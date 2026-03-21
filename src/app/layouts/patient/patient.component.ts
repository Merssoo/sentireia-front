import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { startWith, switchMap, finalize, catchError, debounceTime, tap } from 'rxjs/operators';
import { PatientService } from 'src/app/services/patient/patient.service';
import { of as observableOf } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Patient {
  id?: string;
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
  instagram?: string;
  twitter?: string;
  isDeleting?: boolean; // Controle visual de exclusão
}

@Component({
  selector: 'app-patients',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements AfterViewInit, OnInit {

  displayedColumns: string[] = ['name', 'age', 'email', 'phoneNumber', 'instagram', 'twitter', 'actions'];
  dataSource = new MatTableDataSource<Patient>();

  resultsLength = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  isSaving = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
  tipo: String = 'Cadastrar';
  editingPatientId: string | null = null;

  patientForm = new FormGroup({
    name: new FormControl<string | null>('', [Validators.required]),
    age: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(120)]),
    email: new FormControl<string | null>('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl<string | null>('', [Validators.required]),
    instagram: new FormControl<string | null>(''),
    twitter: new FormControl<string | null>(''),
    filter: new FormControl<string | null>('')
  });

  private filterChanged = new Subject<string | null>();
  private refresh$ = new Subject<void>();

  constructor(private patientService: PatientService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Resetar para a primeira página quando houver mudança de ordenação, filtro ou refresh
    this.sort.sortChange.subscribe(() => this.pageIndex = 0);
    this.filterChanged.pipe(debounceTime(300)).subscribe(() => this.pageIndex = 0);
    this.refresh$.subscribe(() => this.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.filterChanged.pipe(debounceTime(300)), this.refresh$)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.isRateLimitReached = false;
          const filterValue = this.patientForm.get('filter')?.value ?? null;

          // Usar as variáveis locais que estão sincronizadas com o paginator
          return this.patientService.getPatients(
            this.paginator.pageIndex,
            this.paginator.pageSize || this.pageSize,
            this.sort.active ?? 'name',
            this.sort.direction ?? 'asc',
            filterValue
          ).pipe(
            catchError(() => {
              this.isRateLimitReached = true;
              this.snackBar.open('Erro ao buscar pacientes. Tente novamente mais tarde.', 'Fechar', {
                duration: 5000,
              });
              return observableOf({ content: [], totalElements: 0, number: 0, size: this.pageSize, totalPages: 0 });
            })
          );
        })
      )
      .subscribe(data => {
        this.isLoadingResults = false;
        this.resultsLength = data.totalElements;
        this.dataSource.data = data.content;
        
        // Sincroniza as variáveis com os dados reais retornados pela API
        this.pageIndex = data.number;
        this.pageSize = data.size;
      });
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.isSaving = true;
      const formValues = this.patientForm.getRawValue();
      const { filter, ...patientFields } = formValues;

      const dataToSave: Patient = {
        ...patientFields,
        id: this.editingPatientId ?? undefined
      } as Patient;

      const request = this.editingPatientId
        ? this.patientService.update(dataToSave)
        : this.patientService.save(dataToSave);

      request.pipe(
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: () => {
            const message = this.editingPatientId ? 'Paciente atualizado com sucesso!' : 'Paciente salvo com sucesso!';
            this.snackBar.open(message, 'Fechar', {
              duration: 3000,
            });
            this.cancelEdit();
            this.refresh$.next();
          },
          error: (error) => {
            console.error('Erro ao processar paciente:', error);
            if (error.status !== 0 && error.error?.message) {
              this.snackBar.open(error.error.message, 'Fechar', {
                duration: 5000,
              });
            }
          }
        });
    }
  }

  cancelEdit(): void {
    this.tipo = 'Cadastrar';
    this.editingPatientId = null;
    this.formDirective.resetForm();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.patientForm.get('filter')?.setValue(filterValue);
    this.filterChanged.next(filterValue);
  }

  editPatient(patient: Patient): void {
    this.tipo = 'Editando';
    this.editingPatientId = patient.id ?? null;
    this.patientForm.patchValue({
      name: patient.name,
      age: patient.age ? Number(patient.age) : null,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      instagram: patient.instagram,
      twitter: patient.twitter
    });
    // Rolar para o topo para ver o formulário preenchido
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deletePatient(patient: Patient): void {
    if (!patient.id) return;

    // Inicia o estado de exclusão (ativando o risco visual no HTML)
    patient.isDeleting = true;

    // Abre o SnackBar no canto inferior esquerdo
    const snackBarRef = this.snackBar.open(`Removendo ${patient.name}...`, 'DESFAZER', {
      duration: 5000,
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
    });

    let isUndone = false;

    // Se clicar em DESFAZER
    snackBarRef.onAction().subscribe(() => {
      isUndone = true;
      patient.isDeleting = false; // Remove o risco visual
    });

    // Ao fechar o SnackBar
    snackBarRef.afterDismissed().subscribe((dismiss) => {
      // Só executa a exclusão se o SnackBar fechou por tempo (não por clique no Desfazer)
      if (!isUndone && !dismiss.dismissedByAction) {
        this.patientService.delete(patient.id!).subscribe({
          next: () => {
            this.refresh$.next(); // Recarrega a listagem
            this.snackBar.open('Paciente excluído com sucesso.', 'Fechar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Erro ao excluir:', error);
            patient.isDeleting = false; // Remove o risco em caso de erro
            if (error.status !== 0 && error.error?.message) {
              this.snackBar.open(error.error.message, 'Fechar', { duration: 5000 });
            }
          }
        });
      }
    });
  }
}

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { startWith, switchMap, finalize, catchError, debounceTime, tap } from 'rxjs/operators';
import { PatientService } from 'src/app/services/patient/patient.service';
import { of as observableOf } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Patient {
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
  instagram?: string;
  twitter?: string;
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
  isLoadingResults = true;
  isRateLimitReached = false;
  isSaving = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  tipo: String = 'Cadastrar';

  patientForm = new FormGroup({
    name: new FormControl<string | null>('', [Validators.required]),
    age: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(120)]),
    email: new FormControl<string | null>('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl<string | null>('', [Validators.required]),
    instagram: new FormControl<string | null>(''),
    twitter: new FormControl<string | null>(''),
    filter: new FormControl<string | null>('')
  });

  // Usamos um Subject para controlar o evento de filtro
  private filterChanged = new Subject<string | null>();

  constructor(private patientService: PatientService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Altera a página para 0 sempre que a ordenação ou o filtro mudam
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.filterChanged.pipe(debounceTime(300)).subscribe(() => this.paginator.pageIndex = 0);
      
    // A logica principal de requisição agora usa os eventos da ordenação, paginação e do filtro
    merge(
      this.sort.sortChange, 
      this.paginator.page, 
      this.filterChanged.pipe(debounceTime(300))
    ).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        const filterValue = this.patientForm.get('filter')?.value ?? null;
        
        return this.patientService.getPatients(
          this.paginator.pageIndex, 
          this.paginator.pageSize, 
          this.sort.active ?? 'name',
          this.sort.direction ?? 'asc',
          filterValue
        );
      }),
      finalize(() => this.isLoadingResults = false),
      catchError((error) => {
        this.isRateLimitReached = true;
        this.snackBar.open('Erro ao buscar pacientes. Tente novamente mais tarde.', 'Fechar', {
          duration: 5000,
        });
        return observableOf({ content: [], totalElements: 0 });
      })
    )
    .subscribe(data => {
      this.resultsLength = data.totalElements;
      this.dataSource.data = data.content;
    });
  }
  
  onSubmit(): void {
    if (this.patientForm.valid) {
      console.log('Paciente salvo:', this.patientForm.value);
      this.patientForm.reset();
    }
  }

  // Este método agora emite o evento para o Subject
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.patientForm.get('filter')?.setValue(filterValue);
    this.filterChanged.next(filterValue);
  }

  editPatient(patient: Patient): void {
    console.log('Editar paciente:', patient);
  }

  deletePatient(patient: Patient): void {
    console.log('Excluir paciente:', patient);
  }
}

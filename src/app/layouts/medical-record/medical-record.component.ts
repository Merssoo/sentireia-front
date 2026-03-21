import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-medical-record',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './medical-record.component.html',
  styleUrls: ['./medical-record.component.scss']
})
export class MedicalRecordComponent implements OnInit, OnDestroy {
  // Dados simulados do Paciente
  patient: any = {
    name: 'João da Silva',
    age: 34,
    email: 'joao@email.com',
    phoneNumber: '(48) 99999-9999',
    instagram: '@joao',
    twitter: '@joao'
  };

  // Histórico de registros simulado (Mock)
  records: any[] = [

  ];

  isLoadingRecords = false;
  isSaving = false;
  showForm = false;
  editingRecordId: string | null = null;

  searchControl = new FormControl('');

  // Formulário alinhado com o layout flexbox do HTML
  recordForm = new FormGroup({
    type: new FormControl<string | null>('Consulta', [Validators.required]),
    date: new FormControl<Date | null>(new Date(), [Validators.required]),
    description: new FormControl<string | null>('', [Validators.required]),
    observations: new FormControl<string | null>('')
  });

  private destroy$ = new Subject<void>();

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // Filtro da barra de busca
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        console.log('Filtrando por:', value);
        // Lógica de filtro aqui
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- LÓGICA DE SCROLL INFINITO ---
  onScroll(event: any): void {
    const element = event.target;
    // Detecta se chegou ao fim da div branca (com margem de 50px)
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      if (!this.isLoadingRecords) {
        this.loadMoreRecords();
      }
    }
  }

  loadMoreRecords(): void {
    this.isLoadingRecords = true;
    setTimeout(() => {
      const olderRecords = [
        {
          id: Math.random().toString(),
          date: new Date('2026-01-05'),
          type: 'Consulta',
          description: 'Registro antigo carregado via scroll.',
          medication: 'Fluoxetina 20mg'
        }
      ];
      this.records = [...this.records, ...olderRecords];
      this.isLoadingRecords = false;
    }, 1000);
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  onSubmit(): void {
    if (this.recordForm.valid) {
      this.isSaving = true;

      setTimeout(() => {
        const formValue = this.recordForm.getRawValue();

        if (this.editingRecordId) {
          const index = this.records.findIndex(r => r.id === this.editingRecordId);
          this.records[index] = { ...this.records[index], ...formValue };
          this.snackBar.open('Registro atualizado!', 'Fechar', { duration: 2000 });
        } else {
          const newRecord = {
            id: Math.random().toString(),
            ...formValue,
            medication: 'Nenhuma'
          };
          this.records.unshift(newRecord); // Novo registro no topo
          this.snackBar.open('Registro salvo!', 'Fechar', { duration: 2000 });
        }

        this.isSaving = false;
        this.cancelEdit();
      }, 600);
    }
  }

  editRecord(record: any): void {
    this.editingRecordId = record.id;
    this.showForm = true;
    this.recordForm.patchValue({
      type: record.type,
      date: new Date(record.date),
      description: record.description,
      observations: record.observations || ''
    });
  }

  cancelEdit(): void {
    this.editingRecordId = null;
    this.recordForm.reset({ type: 'Consulta', date: new Date() });
    this.showForm = false;
  }

  deleteRecord(id: string): void {
    if (confirm('Excluir este registro permanentemente?')) {
      this.records = this.records.filter(r => r.id !== id);
      this.snackBar.open('Registro removido.', 'OK', { duration: 2000 });
    }
  }
}

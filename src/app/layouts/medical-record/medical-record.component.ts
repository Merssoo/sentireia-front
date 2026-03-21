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
import { MAT_DATE_LOCALE } from '@angular/material/core';

// Services & Models
import { MedicalRecordService } from '../../services/medical-record/medical-record.service';
import { PatientService } from '../../services/patient/patient.service';
import { MedicalRecord } from 'src/app/models/medical-record.model';
import { Patient } from '../patient/patient.component';

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
  styleUrls: ['./medical-record.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ]
})
export class MedicalRecordComponent implements OnInit, OnDestroy {
  patient: any = {
    name: '',
    age: 0,
    email: '',
    phoneNumber: '',
    instagram: '',
    twitter: ''
  };

  patientId: string | null = null;
  records: any[] = [];

  page = 0;
  size = 10;
  isLastPage = false;
  isLoadingRecords = false;
  isSaving = false;
  showForm = false;
  editingRecordId: string | null = null;

  searchControl = new FormControl('');

  recordForm = new FormGroup({
    type: new FormControl<string | null>('Consulta', [Validators.required]),
    date: new FormControl<Date | null>(new Date(), [Validators.required]),
    description: new FormControl<string | null>('', [Validators.required]),
    observations: new FormControl<string | null>('')
  });

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private medicalRecordService: MedicalRecordService,
    private patientService: PatientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');

    if (this.patientId) {
      this.loadPatientData();
      this.loadRecords(true);
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadRecords(true);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleError(error: any, defaultMessage: string): void {
    const message = (error.status !== 0 && error.error?.message) ? error.error.message : defaultMessage;
    this.snackBar.open(message, 'Fechar', {
      duration: 6000,
      verticalPosition: 'bottom',
      horizontalPosition: 'start'
    });
  }

  loadPatientData(): void {
    if (!this.patientId) return;
    this.patientService.getById(this.patientId).subscribe({
      next: (data) => {
        this.patient = data;
      },
      error: (error) => {
        this.handleError(error, 'Erro ao carregar dados do paciente.');
      }
    });
  }

  loadRecords(reset: boolean = false): void {
    if (!this.patientId || this.isLoadingRecords) return;

    if (reset) {
      this.page = 0;
      this.records = [];
      this.isLastPage = false;
    }

    if (this.isLastPage && !reset) return;

    this.isLoadingRecords = true;
    const filter = this.searchControl.value;

    this.medicalRecordService.getRecordsByPatientId(this.patientId, this.page, this.size, filter).subscribe({
      next: (pageData) => {
        this.records = [...this.records, ...pageData.content];
        this.isLastPage = (pageData.number + 1 >= pageData.totalPages) || (pageData.content.length < this.size);
        this.isLoadingRecords = false;
        this.page++;
      },
      error: (error) => {
        this.handleError(error, 'Erro ao carregar histórico.');
        this.isLoadingRecords = false;
      }
    });
  }

  onScroll(event: any): void {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      if (!this.isLoadingRecords && !this.isLastPage) {
        this.loadRecords();
      }
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  onSubmit(): void {
    if (this.recordForm.valid && this.patientId) {
      this.isSaving = true;
      const formValue = this.recordForm.getRawValue();

      const recordData: MedicalRecord = {
        patientId: this.patientId,
        type: formValue.type!,
        date: formValue.date?.toISOString()!,
        description: formValue.description!,
        observations: formValue.observations ?? undefined,
        id: this.editingRecordId ?? undefined
      };

      const request = this.editingRecordId
        ? this.medicalRecordService.update(recordData)
        : this.medicalRecordService.save(recordData);

      request.subscribe({
        next: (data) => {
          this.snackBar.open(
            this.editingRecordId ? 'Registro atualizado!' : 'Registro salvo!',
            'Fechar', { duration: 2000 }
          );

          if (this.editingRecordId) {
            const index = this.records.findIndex(r => r.id === this.editingRecordId);
            if (index !== -1) this.records[index] = data;
          } else {
            this.records.unshift(data);
          }

          this.isSaving = false;
          this.cancelEdit();
        },
        error: (error) => {
          this.handleError(error, 'Erro ao salvar registro.');
          this.isSaving = false;
        }
      });
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
    const container = document.querySelector('.scrollable-history-container');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingRecordId = null;
    this.recordForm.reset({ type: 'Consulta', date: new Date() });
    this.showForm = false;
  }

  deleteRecord(id: string): void {
    if (!id) return;
    if (confirm('Excluir este registro permanentemente?')) {
      this.medicalRecordService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Registro removido.', 'OK', { duration: 2000 });
          this.loadRecords(true);
        },
        error: (error) => {
          this.handleError(error, 'Erro ao excluir registro.');
        }
      });
    }
  }
}

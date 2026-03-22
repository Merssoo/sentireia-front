import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// --- Angular Material Imports (Necessário para Standalone) ---
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatNativeDateModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// Services & Models
import { AppointmentService } from '../../services/appointment/appointment.service';
import { PatientService } from '../../services/patient/patient.service';
import { Appointment } from 'src/app/models/appointment.model';
import { Patient } from '../patient/patient.component';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-appointment',
  standalone: true, // Transformado em Standalone para resolver erros de "unknown element"
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class AppointmentComponent implements OnInit, OnDestroy {
  selectedDate: Date = new Date();
  appointments: Appointment[] = [];
  isLoading = false;
  isSaving = false;
  showForm = false;
  editingId: string | null = null;

  get filteredAppointments() {
    return this.appointments;
  }

  page = 0;
  size = 10;
  isLastPage = false;

  patientsForSelect: Patient[] = [];
  isLoadingPatients = false;
  patientSearchControl = new FormControl('');

  searchControl = new FormControl('');

  appointmentForm = new FormGroup({
    patientId: new FormControl<string | null>(null, [Validators.required]),
    type: new FormControl<string>('Consulta', [Validators.required]),
    date: new FormControl<Date | null>(new Date(), [Validators.required]),
    time: new FormControl<string>('', [Validators.required]),
    notes: new FormControl<string>('')
  });

  private destroy$ = new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadAppointments(true));

    // Lógica do Autocomplete
    this.patientSearchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => {
        if (typeof value === 'string' && value.length >= 2) {
          this.searchPatients(value);
        }
      });

    this.loadAppointments(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAppointmentForm(): void {
    this.toggleForm();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.cancelEdit();
  }

  loadAppointments(reset: boolean = false): void {
    if (this.isLoading) return;
    if (reset) {
      this.page = 0;
      this.appointments = [];
      this.isLastPage = false;
    }
    if (this.isLastPage && !reset) return;

    this.isLoading = true;
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    const filter = this.searchControl.value;

    this.appointmentService.getAppointments(this.page, this.size, dateStr, undefined, filter)
      .subscribe({
        next: (pageData) => {
          this.appointments = [...this.appointments, ...pageData.content];
          // Resolve o erro: Property 'last' does not exist (usando lógica segura)
          this.isLastPage = (pageData.number + 1 >= pageData.totalPages) || (pageData.content.length < this.size);
          this.page++;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar agendamentos.', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  onDateChange(date: Date | null): void {
    if (date) {
      this.selectedDate = date;
      this.loadAppointments(true);
    }
  }

  onScroll(event: any): void {
    const el = event.target;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) {
      if (!this.isLoading && !this.isLastPage) {
        this.loadAppointments();
      }
    }
  }

  searchPatients(filter: string): void {
    this.isLoadingPatients = true;
    this.patientService.getPatients(0, 10, 'name', 'asc', filter).subscribe({
      next: (page) => {
        this.patientsForSelect = page.content;
        this.isLoadingPatients = false;
      },
      error: () => this.isLoadingPatients = false
    });
  }

  displayPatient(patient: Patient): string {
    return patient?.name || '';
  }

  onPatientSelected(event: any): void {
    const patient = event.option.value as Patient;
    this.appointmentForm.get('patientId')?.setValue(patient.id || null);
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.isSaving = true;
      const formValue = this.appointmentForm.getRawValue();

      const data: Appointment = {
        id: this.editingId ?? undefined,
        patientId: formValue.patientId!,
        type: formValue.type as any,
        date: formValue.date!,
        time: formValue.time!,
        notes: formValue.notes || ''
      };

      const request = this.editingId
        ? this.appointmentService.update(data)
        : this.appointmentService.save(data);

      request.subscribe({
        next: () => {
          this.snackBar.open(this.editingId ? 'Agendamento atualizado!' : 'Agendamento salvo!', 'OK', { duration: 2000 });
          this.loadAppointments(true);
          this.isSaving = false;
          this.toggleForm();
        },
        error: () => {
          this.snackBar.open('Erro ao salvar agendamento.', 'Fechar');
          this.isSaving = false;
        }
      });
    }
  }

  editAppointment(appt: any): void {
    this.editingId = appt.id;
    this.showForm = true;
    this.appointmentForm.patchValue({
      patientId: appt.patientId,
      type: appt.type,
      date: new Date(appt.date),
      time: appt.time,
      notes: appt.notes
    });

    this.patientService.getById(appt.patientId).subscribe(p => {
      this.patientSearchControl.setValue(p as any);
    });
  }

  deleteAppointment(appt: any): void {
    const ref = this.snackBar.open(`Excluir agendamento de ${appt.patientName}?`, 'CONFIRMAR', {
      duration: 5000,
      panelClass: ['snackbar-warning']
    });

    ref.onAction().subscribe(() => {
      this.appointmentService.delete(appt.id).subscribe(() => {
        this.snackBar.open('Removido com sucesso.', 'OK', { duration: 2000 });
        this.loadAppointments(true);
      });
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.appointmentForm.reset({ type: 'Consulta', date: new Date() });
    this.patientSearchControl.setValue('');
    this.showForm = false;
  }

  getIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'consulta': return 'medical_services';
      case 'retorno': return 'history';
      case 'exame': return 'assignment';
      default: return 'event';
    }
  }
}

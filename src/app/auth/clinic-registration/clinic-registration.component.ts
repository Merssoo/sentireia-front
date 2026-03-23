import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClinicService } from '../../services/clinic/clinic.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-clinic-registration',
  templateUrl: './clinic-registration.component.html',
  styleUrls: ['./clinic-registration.component.scss']
})
export class ClinicRegistrationComponent implements OnInit {
  clinicForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private clinicService: ClinicService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.clinicForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.clinicForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.clinicService.register(this.clinicForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Clínica cadastrada com sucesso! Por favor, faça login novamente para aplicar as alterações.', 'OK', {
          duration: 5000,
        });
        // After registering a clinic, the user usually needs a new token with the clinicId.
        // Logout or redirect to login.
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Erro ao cadastrar clínica. Tente novamente.', 'Fechar', {
          duration: 3000,
        });
      }
    });
  }
}

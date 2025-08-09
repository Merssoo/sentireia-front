import { AuthService } from './../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { finalize } from 'rxjs/operators';

export const passwordMismatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirm = control.get('confirm');

  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  if (confirm?.hasError('passwordMismatch')) {
    confirm.setErrors(null);
  }
  return null;
};


@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent implements OnInit {

    registerForm!: FormGroup;
    isLoading = false; 
  
    constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private router: Router,
      private snackBar: MatSnackBar
    ) {
    }

    ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      documentNumber: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]], 
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]]
    }, {
      validators: passwordMismatchValidator
    });
  }

  formatCpf(): void {
    const cpfControl = this.registerForm.get('documentNumber');
    let documentNumber = cpfControl?.value;

    if (documentNumber) {
      documentNumber = documentNumber.replace(/\D/g, '');

      if (documentNumber.length === 11) {
        const formattedCpf = documentNumber.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        cpfControl?.setValue(formattedCpf, { emitEvent: false });
      }
    }
  }
  
    onSubmit(): void {
      if (this.registerForm.valid) {
        const userData = this.registerForm.value;
        this.isLoading = true;
        this.authService.register(userData).pipe(finalize(() => this.isLoading = false)).subscribe({
          next: (response) => {
            this.snackBar.open(response.message, 'Fechar', {
              duration: 4000,
              verticalPosition: 'bottom',
              horizontalPosition: 'start'
            });
            this.router.navigate(['/confirm-code']);
          },
          error: (error) => {
            this.snackBar.open(error.error.message, 'Fechar', {
              duration: 4000,
              verticalPosition: 'bottom',
              horizontalPosition: 'start'
            });
          }
        });
      }
    }
}

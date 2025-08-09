import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-code',
  templateUrl: './confirm-code.component.html',
  styleUrls: ['./confirm-code.component.scss']
})
export class ConfirmCodeComponent implements OnInit{

  confirmForm!: FormGroup;
  isLoading = false; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.confirmForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  onSubmit(): void {
    if (this.confirmForm.valid) {
      const code = this.confirmForm.value.code;
      const confirmationData = {
        code: String(code),
        email: null
      };
      this.isLoading = true;
      this.authService.confirmCode(confirmationData).pipe(finalize(() => this.isLoading = false)).subscribe({
        next: (response) => {
            this.snackBar.open('Código confirmado com sucesso!', 'Fechar', {
              duration: 4000,
              verticalPosition: 'bottom',
              horizontalPosition: 'start'
            });
            this.authService.clearPendingEmail();
            this.router.navigate(['/login']);
          },
          error: (error) => {
            this.snackBar.open(error.error, 'Fechar', {
              duration: 4000,
              verticalPosition: 'bottom',
              horizontalPosition: 'start'
            });
          }
      })

    }
  }

  resendCode(): void {
    this.isLoading = true;
    const email = null;
    this.authService.resendCode(email).pipe(finalize(() => this.isLoading = false)).subscribe({
      next: (response) => {
          this.snackBar.open('Novo código enviado. Verifique seu e-mail.', 'Fechar', {
            duration: 4000,
            verticalPosition: 'bottom',
            horizontalPosition: 'start'
          });
        },
        error: (error) => {
          this.snackBar.open(error.error.message, 'Fechar', {
            duration: 4000,
            verticalPosition: 'bottom',
            horizontalPosition: 'start'
          });
        }
    })
  }
}

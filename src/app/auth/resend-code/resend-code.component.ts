import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth/auth.service';
import { finalize } from 'rxjs/operators';
import { pipe } from 'rxjs';

@Component({
  selector: 'app-resend-code',
  templateUrl: './resend-code.component.html',
  styleUrls: ['./resend-code.component.scss']
})
export class ResendCodeComponent implements OnInit{

    resendForm!: FormGroup;
    isLoading = false;
  
    constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private router: Router,
      private snackBar: MatSnackBar
    ) { }
  
    ngOnInit(): void {
      this.resendForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
      });
    }
  
    onSubmit(): void {
      if (this.resendForm.valid) {
        const email = this.resendForm.value.email;
        this.isLoading = true;
        this.authService.resendCode(email).pipe(finalize(() => this.isLoading = false)).subscribe({
          next: (response) => {
              this.snackBar.open('Novo código enviado. Verifique seu e-mail.', 'Fechar', {
                duration: 4000,
                verticalPosition: 'bottom',
                horizontalPosition: 'start'
              });
              this.authService.setPedingEmail(email);
              this.router.navigate(['/confirm-code']);
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
}

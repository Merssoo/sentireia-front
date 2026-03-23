// auth.interceptor.ts

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import {EMPTY, Observable, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.url.includes('/auth/login')) {
      return this.handleWithGlobalErrors(next.handle(req));
    }

    if (req.url.includes('/auth/register-user')) {
      return this.handleWithGlobalErrors(next.handle(req));
    }

    if (req.url.includes('/auth/confirm-code')) {
      return this.handleWithGlobalErrors(next.handle(req));
    }

    if (req.url.includes('/auth/resend-confirmation-code')) {
      return this.handleWithGlobalErrors(next.handle(req));
    }

    if (this.authService.getToken() && !this.authService.isTokenExpired()) {
      const token = this.authService.getToken();
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return this.handleWithGlobalErrors(next.handle(cloned));
    } else {
      this.authService.logout();
      this.router.navigate(['/login']);
      return new Observable<HttpEvent<any>>();
    }
  }

  private handleWithGlobalErrors(observable: Observable<HttpEvent<any>>): Observable<HttpEvent<any>> {
    return observable.pipe(
      catchError((error: HttpErrorResponse) => {

        const isCadastroPath = this.router.url.includes('/cadastro-clinica');

        if ((error.status === 403 || error.status === 0) && this.authService.getClinicId() === null ) {
          this.snackBar.open('Atenção: Você precisa cadastrar uma clínica para prosseguir.', 'OK', {
            duration: 5000,
          });
          this.router.navigate(['/cadastro-clinica']);
          return EMPTY;
        }

        if (error.status === 0 && !this.authService.getClinicId() === null ) {
          this.snackBar.open('Problema ao se comunicar com o servidor.', 'Fechar', { duration: 6000 });
        }

        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }
}

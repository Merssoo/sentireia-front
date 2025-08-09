// auth.interceptor.ts

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.url.includes('/auth/login')) {
      return next.handle(req);
    }

    if (req.url.includes('/auth/register-user')) {
      return next.handle(req);
    }

    if (req.url.includes('/auth/confirm-code')) {
      return next.handle(req);
    }

    if (req.url.includes('/auth/resend-confirmation-code')) {
      return next.handle(req);
    }

    if (this.authService.getToken() && !this.authService.isTokenExpired()) {
      const token = this.authService.getToken();
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    } else {
      this.authService.logout();
      this.router.navigate(['/login']);
      return new Observable<HttpEvent<any>>();
    }
  }
}
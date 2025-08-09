import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.getToken() && !authService.isTokenExpired()) {
    return true;
  }

  if (authService.getPendingEmail()) {
    return true;
  }
  
  authService.logout();
  router.navigate(['login']);
  return false;
};

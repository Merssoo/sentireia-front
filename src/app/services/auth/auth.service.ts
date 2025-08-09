import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  userEmail: string;
  userId: string;
}

export interface RestrationResponse {
  message: string;
  userEmail: string;
  userId: string;
}

export interface UserData {
  firstName: String;
  lastName: String;
  dateOfBirth: any,
  phoneNumber: String;
  documentNumber: String;
  email: String;
  password: String;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: ApiService) {}

  private pendingEmail: String | null = null;

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('email', response.userEmail);
        localStorage.setItem('userId', response.userId);
      })
    );
  }

  register(userData: UserData): Observable<RestrationResponse> {
    if(userData.dateOfBirth) {
      const formattedDate = userData.dateOfBirth.toISOString().split('T')[0];
      userData.dateOfBirth = formattedDate
    }
    return this.http.post<RestrationResponse>('/auth/register-user', userData).pipe(
      tap((response) => {
        this.pendingEmail = response.userEmail;
      })
    )
  }

  confirmCode(code: {code: String; email: String | null}): Observable<any> {
    code.email = this.getPendingEmail();
    return this.http.post<any>('/auth/confirm-code',code);
  }

  resendCode(email: String | null): Observable<any> {
    if(email === null) {
      email = this.getPendingEmail();
    }
    const requestBody = { email: email };
    return this.http.post('/auth/resend-confirmation-code', requestBody);
  }

  getToken(): String | null {
    return localStorage.getItem('token');
  }

  getEmail(): String | null {
    return localStorage.getItem('email');
  }

  getUserId(): String | null {
    return localStorage.getItem('userId');
  }

  getPendingEmail(): String | null {
    return this.pendingEmail;
  }

  setPedingEmail(email: String): void {
    this.pendingEmail = email;
  }

  clearPendingEmail(): void {
    this.pendingEmail = null;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate.valueOf() < new Date().valueOf();
    } catch (e) {
      return true;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
  }
}

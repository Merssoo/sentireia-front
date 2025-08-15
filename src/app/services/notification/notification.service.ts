import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable, tap } from 'rxjs';

export interface NotificationDTO {
  id: number;
  message: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: ApiService) {}

  getUnreadNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>('/notification');
  }

  markAllAsRead(): Observable<any> {
    return this.http.post('/notification', {});
  }
}

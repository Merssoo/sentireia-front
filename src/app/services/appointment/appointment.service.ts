import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { Appointment } from 'src/app/models/appointment.model';
import { HttpParams } from '@angular/common/http';
import { Page } from '../page.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly endpoint = '/appointments';

  constructor(private http: ApiService) { }
  getAppointments(
    page: number,
    size: number,
    date?: string,
    patientId?: string,
    filter?: string | null
  ): Observable<Page<Appointment>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (date) params = params.set('date', date);
    if (patientId) params = params.set('patientId', patientId);
    if (filter) params = params.set('filter', filter);

    return this.http.get<Page<Appointment>>(this.endpoint, { params });
  }

  save(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(this.endpoint, appointment);
  }

  update(appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.endpoint}/${appointment.id}`, appointment);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}

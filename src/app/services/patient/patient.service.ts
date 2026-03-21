import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable, tap } from 'rxjs';
import { Page } from '../page.model';
import { Patient } from 'src/app/layouts/patient/patient.component'; 
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: ApiService) { }


  getPatients(page: number, size: number, sort: string, direction: string, filter: string | null): Observable<Page<Patient>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (filter) {
      params = params.set('filter', filter);
    }

    return this.http.get<Page<Patient>>('/patient', { params });
  }

  getById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`/patient/${id}`);
  }

  save(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>('/patient', patient);
  }

  update(patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`/patient`, patient);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/patient/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { MedicalRecord } from 'src/app/models/medical-record.model';
import { HttpParams } from '@angular/common/http';
import { Page } from '../page.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {

  constructor(private http: ApiService) { }

  getRecordsByPatientId(
    patientId: string, 
    page: number, 
    size: number, 
    filter: string | null = null
  ): Observable<Page<MedicalRecord>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('patientId', patientId);

    if (filter) {
      params = params.set('filter', filter);
    }

    return this.http.get<Page<MedicalRecord>>(`/medical-records`, { params });
  }

  save(record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>('/medical-records', record);
  }

  update(record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.put<MedicalRecord>(`/medical-records/${record.id}`, record);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/medical-records/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

export interface ClinicRegistrationDTO {
  name: string;
}

export interface Clinic {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicService {

  constructor(private http: ApiService) {}

  register(clinicData: ClinicRegistrationDTO): Observable<Clinic> {
    return this.http.post<Clinic>('/clinics', clinicData);
  }
}

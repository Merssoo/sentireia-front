export interface Appointment {
  id?: string;
  patientId: string;
  patientName?: string;
  date: string | Date;
  time: string;
  type: 'Consulta' | 'Retorno';
  notes?: string;
  status?: string;
}

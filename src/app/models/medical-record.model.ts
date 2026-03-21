export interface MedicalRecord {
  id?: string;
  patientId: string;
  date: string;
  type: string;
  description: string;
  diagnosis?: string;
  observations?: string;
}

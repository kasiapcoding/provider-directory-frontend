import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  specialization: string;
  locations: string[];
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private http = inject(HttpClient);
  // private apiUrl = 'http://localhost:8080/api/doctors';
private apiUrl = 'https://provider-directory-api-2o4q.onrender.com/api/doctors';

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.apiUrl);
  }

  getDoctorsBySpecialization(specialization: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/specialization/${specialization}`);
  }

  uploadXml(formData: FormData): Observable<Doctor[]> {
    return this.http.post<Doctor[]>(`${this.apiUrl}/upload`, formData);
  }
}
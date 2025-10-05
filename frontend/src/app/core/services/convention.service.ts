import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ConventionDto {
  id?: number;
  titre?: string;
  description?: string;
  statut?: string;
  etudiantId?: number;
  enseignantId?: number;
  entrepriseId?: number;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ConventionService {
  private base = `${environment.apiUrl}/conventions`;

  constructor(private http: HttpClient) {}

  create(dto: ConventionDto) {
    return this.http.post<ConventionDto>(`${this.base}`, dto);
  }

  getById(id: number) {
    return this.http.get<ConventionDto>(`${this.base}/${id}`);
  }

  getAll() {
    return this.http.get<ConventionDto[]>(`${this.base}/all`);
  }

  update(id: number, dto: ConventionDto) {
    return this.http.put<ConventionDto>(`${this.base}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CandidatureDto {
  id?: number;
  dateCandidature?: string;
  statut?: string;
  cvUrl?: string;
  lettreMotivation?: string;
  luParEntreprise?: boolean;
  etudiantId?: number;
  offreId?: number;
}

@Injectable({ providedIn: 'root' })
export class CandidatureService {
  private base = `${environment.apiUrl}/candidatures`;

  constructor(private http: HttpClient) {}

  create(data: CandidatureDto, cvFile?: File, lettreMotivationFile?: File) {
    const form = new FormData();
    form.append('candidature', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (cvFile) form.append('cvFile', cvFile);
    if (lettreMotivationFile) form.append('lettreMotivationFile', lettreMotivationFile);
    return this.http.post<CandidatureDto>(`${this.base}`, form);
  }

  updateFields(id: number, fields: { statut?: string; lettreMotivation?: string; luParEntreprise?: boolean }, cvFile?: File) {
    const form = new FormData();
    if (fields.statut !== undefined) form.append('statut', fields.statut);
    if (fields.lettreMotivation !== undefined) form.append('lettreMotivation', fields.lettreMotivation);
    if (fields.luParEntreprise !== undefined) form.append('luParEntreprise', String(fields.luParEntreprise));
    if (cvFile) form.append('cvFile', cvFile);
    return this.http.put<CandidatureDto>(`${this.base}/${id}`, form);
  }

  getAll() {
    return this.http.get<CandidatureDto[]>(`${this.base}/all`);
  }

  getById(id: number) {
    return this.http.get<CandidatureDto>(`${this.base}/${id}`);
  }

  getByEtudiant(etudiantId: number) {
    return this.http.get<CandidatureDto[]>(`${this.base}/etudiant/${etudiantId}`);
  }

  getByOffre(offreId: number) {
    return this.http.get<CandidatureDto[]>(`${this.base}/offre/${offreId}`);
  }

  getByEntreprise(entrepriseId: number) {
    return this.http.get<CandidatureDto[]>(`${this.base}/entreprise/${entrepriseId}`);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

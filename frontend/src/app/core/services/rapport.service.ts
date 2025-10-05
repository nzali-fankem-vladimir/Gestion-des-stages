import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface RapportHebdomadaireDto {
  id?: number;
  etudiant?: { id: number; nom?: string; prenom?: string; email?: string; };
  etudiantDetails?: { id: number; nom?: string; prenom?: string; email?: string; };
  stage?: { 
    id: number; 
    titre?: string; 
    entreprise?: { id: number; nom: string; email?: string; };
  };
  semaineNumero?: number;
  dateDebutSemaine?: string;
  dateFinSemaine?: string;
  activitesRealisees?: string;
  competencesAcquises?: string;
  difficultes?: string;
  objectifsSemaineSuivante?: string;
  statut?: 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'REJETE';
  enseignantDestinataire?: { id: number; nom?: string; prenom?: string; };
  dateSoumission?: string;
  commentairesEnseignant?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Champs pour compatibilité frontend
  titre?: string;
  contenu?: string;
  etudiantId?: number;
  offreId?: number;
  semaine?: number;
  dateDebut?: string;
  dateFin?: string;
  heuresTravaillees?: number;
  fichierPath?: string;
  entreprise?: { id: number; nom: string; email?: string; };
}

@Injectable({ providedIn: 'root' })
export class RapportService {
  private base = `${environment.apiUrl}/rapports-hebdomadaires`;

  constructor(private http: HttpClient) {}

  create(dto: RapportHebdomadaireDto) {
    return this.http.post<RapportHebdomadaireDto>(`${this.base}`, dto);
  }

  getById(id: number) {
    return this.http.get<RapportHebdomadaireDto>(`${this.base}/${id}`);
  }

  getAll() {
    return this.http.get<RapportHebdomadaireDto[]>(`${this.base}`);
  }

  getByEtudiant(etudiantId: number) {
    return this.http.get<RapportHebdomadaireDto[]>(`${this.base}/etudiant/${etudiantId}`);
  }

  getByOffre(offreId: number) {
    return this.http.get<RapportHebdomadaireDto[]>(`${this.base}/stage/${offreId}`);
  }

  update(id: number, dto: RapportHebdomadaireDto) {
    return this.http.put<RapportHebdomadaireDto>(`${this.base}/${id}`, dto);
  }

  updateRapport(id: number, data: any) {
    return this.http.put<RapportHebdomadaireDto>(`${this.base}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadFile(formData: FormData) {
    return this.http.post<RapportHebdomadaireDto>(`${this.base}/upload`, formData);
  }

  downloadFile(id: number) {
    return this.http.get(`${this.base}/${id}/download`, { responseType: 'blob' });
  }
}

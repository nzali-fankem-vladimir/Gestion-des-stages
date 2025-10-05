import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  RapportHebdomadaireDto, 
  RapportHebdomadaireCreateRequest,
  RapportHebdomadaireUpdateRequest,
  RapportSubmissionRequest,
  RapportValidationRequest,
  RapportRejectionRequest,
  RapportHebdomadaireEtendu,
  StatutRapport
} from '../models/rapport-hebdomadaire.interface';

@Injectable({
  providedIn: 'root'
})
export class RapportHebdomadaireService {
  private apiUrl = `${environment.apiUrl}/rapports-hebdomadaires`;
  
  // Observable pour les rapports de l'utilisateur connecté
  private rapportsSubject = new BehaviorSubject<RapportHebdomadaireDto[]>([]);
  public rapports$ = this.rapportsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ========================= CREATE =========================
  
  /**
   * Crée un nouveau rapport hebdomadaire avec fichier optionnel
   */
  createRapport(rapport: RapportHebdomadaireCreateRequest, file?: File): Observable<RapportHebdomadaireDto> {
    const formData = new FormData();
    
    // Ajouter les données du rapport comme JSON
    const rapportBlob = new Blob([JSON.stringify(rapport)], { type: 'application/json' });
    formData.append('rapport', rapportBlob);
    
    // Ajouter le fichier si fourni
    if (file) {
      formData.append('file', file);
    }

    return this.http.post<RapportHebdomadaireDto>(this.apiUrl, formData).pipe(
      tap(() => {
        console.log('✅ Rapport hebdomadaire créé avec succès');
        // Recharger la liste des rapports
        this.loadRapportsByCurrentUser();
      })
    );
  }

  /**
   * Crée un rapport simple sans fichier (JSON uniquement)
   */
  createRapportSimple(rapport: RapportHebdomadaireCreateRequest): Observable<RapportHebdomadaireDto> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<RapportHebdomadaireDto>(`${this.apiUrl}/simple`, rapport, { headers }).pipe(
      tap(() => {
        console.log('✅ Rapport hebdomadaire simple créé avec succès');
        this.loadRapportsByCurrentUser();
      })
    );
  }

  // ========================= READ =========================
  
  /**
   * Récupère un rapport par son ID
   */
  getRapportById(id: number): Observable<RapportHebdomadaireDto> {
    return this.http.get<RapportHebdomadaireDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère tous les rapports (admin uniquement)
   */
  getAllRapports(): Observable<RapportHebdomadaireDto[]> {
    return this.http.get<RapportHebdomadaireDto[]>(this.apiUrl);
  }

  /**
   * Récupère les rapports d'un étudiant
   */
  getRapportsByEtudiantId(etudiantId: number): Observable<RapportHebdomadaireDto[]> {
    return this.http.get<RapportHebdomadaireDto[]>(`${this.apiUrl}/etudiant/${etudiantId}`);
  }

  /**
   * Récupère les rapports d'une offre de stage
   */
  getRapportsByOffreId(offreId: number): Observable<RapportHebdomadaireDto[]> {
    return this.http.get<RapportHebdomadaireDto[]>(`${this.apiUrl}/stage/${offreId}`);
  }

  /**
   * Récupère les rapports destinés à un enseignant
   */
  getRapportsByEnseignantId(enseignantId: number): Observable<RapportHebdomadaireDto[]> {
    return this.http.get<RapportHebdomadaireDto[]>(`${this.apiUrl}/enseignant/${enseignantId}`);
  }

  // ========================= UPDATE =========================
  
  /**
   * Met à jour un rapport existant avec fichier optionnel
   */
  updateRapport(id: number, rapport: RapportHebdomadaireUpdateRequest, file?: File): Observable<RapportHebdomadaireDto> {
    const formData = new FormData();
    
    // Ajouter les données du rapport comme JSON
    const rapportBlob = new Blob([JSON.stringify(rapport)], { type: 'application/json' });
    formData.append('rapport', rapportBlob);
    
    // Ajouter le fichier si fourni
    if (file) {
      formData.append('file', file);
    }

    return this.http.put<RapportHebdomadaireDto>(`${this.apiUrl}/${id}`, formData).pipe(
      tap(() => {
        console.log('✅ Rapport hebdomadaire mis à jour avec succès');
        this.loadRapportsByCurrentUser();
      })
    );
  }

  // ========================= SUBMIT & VALIDATION =========================
  
  /**
   * Soumet un rapport à un enseignant
   */
  submitRapport(id: number, submissionData: RapportSubmissionRequest): Observable<RapportHebdomadaireDto> {
    return this.http.put<RapportHebdomadaireDto>(`${this.apiUrl}/${id}/submit`, submissionData).pipe(
      tap(() => {
        console.log('✅ Rapport soumis avec succès');
        this.loadRapportsByCurrentUser();
      })
    );
  }

  /**
   * Valide un rapport (enseignant)
   */
  validateRapport(id: number, validationData: RapportValidationRequest): Observable<RapportHebdomadaireDto> {
    return this.http.put<RapportHebdomadaireDto>(`${this.apiUrl}/${id}/validate`, validationData).pipe(
      tap(() => {
        console.log('✅ Rapport validé avec succès');
      })
    );
  }

  /**
   * Demande une modification du rapport (enseignant)
   */
  requestModification(id: number, validationData: RapportValidationRequest): Observable<RapportHebdomadaireDto> {
    return this.http.put<RapportHebdomadaireDto>(`${this.apiUrl}/${id}/request-modification`, validationData).pipe(
      tap(() => {
        console.log('✅ Modification demandée avec succès');
      })
    );
  }

  /**
   * Rejette un rapport (enseignant)
   */
  rejectRapport(id: number, rejectionData: RapportRejectionRequest): Observable<RapportHebdomadaireDto> {
    return this.http.put<RapportHebdomadaireDto>(`${this.apiUrl}/${id}/reject`, rejectionData).pipe(
      tap(() => {
        console.log('✅ Rapport rejeté avec succès');
      })
    );
  }

  // ========================= DELETE =========================
  
  /**
   * Supprime un rapport
   */
  deleteRapport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log('✅ Rapport supprimé avec succès');
        this.loadRapportsByCurrentUser();
      })
    );
  }

  // ========================= UTILITY METHODS =========================
  
  /**
   * Charge les rapports de l'utilisateur connecté
   */
  private loadRapportsByCurrentUser(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id && currentUser.role === 'ETUDIANT') {
      this.getRapportsByEtudiantId(currentUser.id).subscribe({
        next: (rapports) => {
          this.rapportsSubject.next(rapports);
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des rapports:', error);
        }
      });
    }
  }

  /**
   * Transforme un rapport en version étendue pour l'affichage
   */
  toRapportEtendu(rapport: RapportHebdomadaireDto): RapportHebdomadaireEtendu {
    // Gestion sécurisée des noms selon le type d'utilisateur
    let enseignantNom = '';
    let enseignantPrenom = '';
    
    if (rapport.enseignantDestinataire) {
      // Cast vers Enseignant pour accéder aux propriétés spécifiques
      const enseignant = rapport.enseignantDestinataire as any;
      enseignantNom = enseignant.nom || '';
      enseignantPrenom = enseignant.prenom || '';
    }

    return {
      ...rapport,
      etudiantNom: rapport.etudiant?.nom || '',
      etudiantPrenom: rapport.etudiant?.prenom || '',
      stageTitle: rapport.stage?.titre || '',
      entrepriseNom: rapport.entreprise?.nom || '',
      enseignantNom,
      enseignantPrenom,
      statutLabel: this.getStatutLabel(rapport.statut),
      semaineDateRange: this.formatDateRange(rapport.dateDebutSemaine, rapport.dateFinSemaine),
      hasFile: !!rapport.fichierUrl,
      canEdit: rapport.statut === StatutRapport.BROUILLON,
      canSubmit: rapport.statut === StatutRapport.BROUILLON,
      canValidate: rapport.statut === StatutRapport.SOUMIS
    };
  }

  /**
   * Retourne le libellé français du statut
   */
  getStatutLabel(statut?: StatutRapport): string {
    switch (statut) {
      case StatutRapport.BROUILLON:
        return 'Brouillon';
      case StatutRapport.SOUMIS:
        return 'Soumis';
      case StatutRapport.VALIDE:
        return 'Validé';
      case StatutRapport.REJETE:
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  }

  /**
   * Formate une plage de dates
   */
  private formatDateRange(dateDebut?: string, dateFin?: string): string {
    if (!dateDebut || !dateFin) return '';
    
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    
    return `${debut.toLocaleDateString('fr-FR', options)} - ${fin.toLocaleDateString('fr-FR', options)}`;
  }

  /**
   * Retourne la couleur du badge selon le statut
   */
  getStatutBadgeClass(statut?: StatutRapport): string {
    switch (statut) {
      case StatutRapport.BROUILLON:
        return 'bg-gray-100 text-gray-800';
      case StatutRapport.SOUMIS:
        return 'bg-blue-100 text-blue-800';
      case StatutRapport.VALIDE:
        return 'bg-green-100 text-green-800';
      case StatutRapport.REJETE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Vérifie si un fichier est une image
   */
  isImageFile(typeFichier?: string): boolean {
    if (!typeFichier) return false;
    return typeFichier.startsWith('image/');
  }

  /**
   * Vérifie si un fichier est un PDF
   */
  isPdfFile(typeFichier?: string): boolean {
    return typeFichier === 'application/pdf';
  }

  /**
   * Génère l'URL complète du fichier
   */
  getFileUrl(fichierUrl?: string): string {
    if (!fichierUrl) return '';
    if (fichierUrl.startsWith('http')) return fichierUrl;
    return `${environment.apiUrl}${fichierUrl}`;
  }

  /**
   * Initialise le service et charge les données
   */
  init(): void {
    this.loadRapportsByCurrentUser();
  }
}

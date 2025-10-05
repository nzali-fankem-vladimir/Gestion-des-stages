import { Etudiant, Enseignant, Entreprise, User } from './user.models';

// Interfaces pour les objets liés aux rapports
export interface OffreDto {
  id?: number;
  titre?: string;
  description?: string;
  entreprise?: Entreprise;
  dateDebut?: string;
  dateFin?: string;
}

export interface RapportHebdomadaireDto {
  id?: number;
  
  // --- Champs d'Entrée (IDs pour les relations) ---
  etudiantId?: number;
  offreId?: number;
  enseignantDestinataireId?: number;
  
  // --- Champs de Sortie (Objets pour l'affichage) ---
  etudiant?: Etudiant;
  stage?: OffreDto;
  entreprise?: Entreprise;
  enseignantDestinataire?: User;
  
  // --- Contenu du Rapport ---
  semaineNumero?: number;
  dateDebutSemaine?: string; // LocalDate -> string
  dateFinSemaine?: string;   // LocalDate -> string
  activitesRealisees?: string;
  competencesAcquises?: string;
  difficultes?: string;
  objectifsSemaineSuivante?: string;
  statut?: StatutRapport;
  
  // --- Fichier ---
  fichierUrl?: string;
  nomFichier?: string;
  typeFichier?: string;
  
  // --- Métadonnées ---
  dateSoumission?: string;    // LocalDateTime -> string
  commentairesEnseignant?: string;
  createdAt?: string;         // LocalDateTime -> string
  updatedAt?: string;         // LocalDateTime -> string
}

export enum StatutRapport {
  BROUILLON = 'BROUILLON',
  SOUMIS = 'SOUMIS',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE'
}

export interface RapportHebdomadaireCreateRequest {
  etudiantId: number;
  offreId: number;
  enseignantDestinataireId?: number;
  semaineNumero: number;
  dateDebutSemaine: string;
  dateFinSemaine: string;
  activitesRealisees: string;
  competencesAcquises: string;
  difficultes: string;
  objectifsSemaineSuivante: string;
}

export interface RapportHebdomadaireUpdateRequest {
  semaineNumero?: number;
  dateDebutSemaine?: string;
  dateFinSemaine?: string;
  activitesRealisees?: string;
  competencesAcquises?: string;
  difficultes?: string;
  objectifsSemaineSuivante?: string;
  statut?: StatutRapport;
}

export interface RapportSubmissionRequest {
  statut: StatutRapport;
  enseignantId: number;
}

export interface RapportValidationRequest {
  commentaires?: string;
}

export interface RapportRejectionRequest {
  reason: string;
}

// Interface étendue pour l'affichage avec informations complètes
export interface RapportHebdomadaireEtendu extends RapportHebdomadaireDto {
  etudiantNom?: string;
  etudiantPrenom?: string;
  stageTitle?: string;
  entrepriseNom?: string;
  enseignantNom?: string;
  enseignantPrenom?: string;
  statutLabel?: string;
  semaineDateRange?: string;
  hasFile?: boolean;
  canEdit?: boolean;
  canSubmit?: boolean;
  canValidate?: boolean;
}

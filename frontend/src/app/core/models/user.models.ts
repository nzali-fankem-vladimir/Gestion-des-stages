export type UserRole = 'ETUDIANT' | 'ENSEIGNANT' | 'ENTREPRISE' | 'ADMIN';

export interface BaseUser {
  id?: number;
  email: string;
  motDePasse?: string;
  photoProfil?: string;
  role?: any; // Role object from backend
  actif?: boolean;
}

export interface Etudiant extends BaseUser {
  nom?: string;
  prenom?: string;
  matricule?: string;
  filiere?: string;
  cvFile?: string;
}

export interface Enseignant extends BaseUser {
  nom?: string;
  prenom?: string;
  departement?: string;
  specialite?: string;
}

export interface Entreprise extends BaseUser {
  nom?: string;
  siret?: string;
  secteur?: string;
  logoUrl?: string;
}

export interface Admin extends BaseUser {
  role: 'ADMIN';
}

export type User = Etudiant | Enseignant | Entreprise | Admin;

export interface RegisterRequest {
  email: string;
  motDePasse: string;
  role: UserRole;
  nom?: string;
  prenom?: string;
  matricule?: string;
  filiere?: string;
  siret?: string;
  secteur?: string;
  logoUrl?: string;
  departement?: string;
  specialite?: string;
  photoProfil?: string;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  role: UserRole;
  fullName?: string;
  avatarUrl?: string;
}

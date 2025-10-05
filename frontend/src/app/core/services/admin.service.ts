import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUserDto {
  id: number;
  email: string;
  role: string;
  photoProfil?: string;
  fullName?: string;
  createdAt?: string;
  actif?: boolean;
}

export interface CreateUserRequest {
  email: string;
  motDePasse: string;
  role: 'ETUDIANT' | 'ENSEIGNANT' | 'ENTREPRISE';
}

export interface UserStatistics {
  ETUDIANT: number;
  ENSEIGNANT: number;
  ENTREPRISE: number;
  ADMIN: number;
  TOTAL: number;
}

export interface GlobalStatistics {
  users: UserStatistics;
  candidatures: { TOTAL: number };
  offres: { TOTAL: number };
  conventions: { TOTAL: number };
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Gestion des utilisateurs
  getAllUsers(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(`${this.base}/users`);
  }

  getUserById(id: number): Observable<AdminUserDto> {
    return this.http.get<AdminUserDto>(`${this.base}/users/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<AdminUserDto> {
    return this.http.post<AdminUserDto>(`${this.base}/users`, user);
  }

  updateUser(id: number, user: Partial<AdminUserDto>): Observable<AdminUserDto> {
    return this.http.put<AdminUserDto>(`${this.base}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }

  // Statistiques
  getGlobalStatistics(): Observable<GlobalStatistics> {
    return this.http.get<GlobalStatistics>(`${this.base}/statistics`);
  }

  getUserStatistics(): Observable<UserStatistics> {
    return this.http.get<UserStatistics>(`${this.base}/users/statistics`);
  }

  // Gestion de l'activation des utilisateurs
  activateUser(id: number): Observable<AdminUserDto> {
    return this.http.put<AdminUserDto>(`${this.base}/users/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<AdminUserDto> {
    return this.http.put<AdminUserDto>(`${this.base}/users/${id}/deactivate`, {});
  }

  getPendingUsers(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(`${this.base}/users/pending`);
  }

  // Mise à jour du statut d'un utilisateur
  updateUserStatus(userId: number, status: 'ACTIF' | 'INACTIF' | 'BLOQUE'): Observable<AdminUserDto> {
    return this.http.put<AdminUserDto>(`${this.base}/users/${userId}/status`, { status });
  }
}

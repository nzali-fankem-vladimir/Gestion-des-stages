import { Injectable } from '@angular/core';

export type UserRole = 'ADMIN' | 'ETUDIANT' | 'ENSEIGNANT' | 'ENTREPRISE';

export interface CurrentUser {
  id: number;
  email: string;
  fullName?: string;
  role: UserRole;
  avatarUrl?: string;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'auth';

  get currentUser(): CurrentUser | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const user = raw ? JSON.parse(raw) as CurrentUser : null;
      console.log('AuthService - Getting current user:', user);
      return user;
    } catch (error) {
      console.error('AuthService - Error getting current user:', error);
      return null;
    }
  }

  set currentUser(user: CurrentUser | null) {
    if (user) localStorage.setItem(this.storageKey, JSON.stringify(user));
    else localStorage.removeItem(this.storageKey);
  }

  get token(): string | null {
    return this.currentUser?.token ?? null;
  }

  get role(): UserRole | null {
    return this.currentUser?.role ?? null;
  }

  get displayName(): string {
    return this.currentUser?.fullName || this.currentUser?.email || '';
  }

  get avatar(): string {
    return this.currentUser?.avatarUrl || '';
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
  }
}

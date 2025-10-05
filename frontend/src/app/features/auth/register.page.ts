import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService, CurrentUser, UserRole } from '../../core/services/auth.service';
import { ProfileImageService } from '../../core/services/profile-image.service';
import { ToastService } from '../../shared/services/toast.service';
import { RegisterRequest, LoginResponse } from '../../core/models/user.models';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
    <div class="bg-white border rounded-lg p-6 w-full max-w-lg space-y-4">
      <h2 class="text-xl font-semibold">Créer un compte</h2>
      <form #f="ngForm" (ngSubmit)="register()" class="space-y-3">
        
        <!-- Rôle - en premier pour adapter le formulaire -->
        <div>
          <label class="text-sm text-gray-600">Rôle</label>
          <select class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.role" name="role" required (change)="onRoleChange()">
            <option value="ETUDIANT">Étudiant</option>
            <option value="ENSEIGNANT">Enseignant</option>
            <option value="ENTREPRISE">Entreprise</option>
          </select>
        </div>

        <!-- Email -->
        <div>
          <label class="text-sm text-gray-600">Email</label>
          <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.email" name="email" type="email" required email #emailCtrl="ngModel" />
          <p class="mt-1 text-xs text-red-600" *ngIf="emailCtrl.invalid && (emailCtrl.touched || f.submitted)">Email invalide.</p>
        </div>

        <!-- Mot de passe -->
        <div>
          <label class="text-sm text-gray-600">Mot de passe</label>
          <div class="relative">
            <input class="mt-1 w-full border rounded px-3 py-2 pr-10" [(ngModel)]="formData.motDePasse" name="motDePasse" [type]="showPassword ? 'text' : 'password'" required minlength="4" #pwdCtrl="ngModel" />
            <button type="button" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" (click)="showPassword = !showPassword">
              <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-xs text-red-600" *ngIf="pwdCtrl.invalid && (pwdCtrl.touched || f.submitted)">Mot de passe requis (≥ 4 caractères).</p>
        </div>

        <!-- Champs spécifiques selon le rôle -->
        <div [ngSwitch]="formData.role" class="space-y-3">
          
          <!-- ETUDIANT -->
          <div *ngSwitchCase="'ETUDIANT'" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-gray-600">Nom</label>
                <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.nom" name="nom" required />
              </div>
              <div>
                <label class="text-sm text-gray-600">Prénom</label>
                <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.prenom" name="prenom" required />
              </div>
            </div>
            <div>
              <label class="text-sm text-gray-600">Matricule</label>
              <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.matricule" name="matricule" required />
            </div>
            <div>
              <label class="text-sm text-gray-600">Filière</label>
              <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.filiere" name="filiere" required />
            </div>
          </div>

          <!-- ENSEIGNANT -->
          <div *ngSwitchCase="'ENSEIGNANT'" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-gray-600">Nom</label>
                <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.nom" name="nom" required />
              </div>
              <div>
                <label class="text-sm text-gray-600">Prénom</label>
                <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.prenom" name="prenom" required />
              </div>
            </div>
            <div>
              <label class="text-sm text-gray-600">Département</label>
              <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.departement" name="departement" required />
            </div>
            <div>
              <label class="text-sm text-gray-600">Spécialité</label>
              <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.specialite" name="specialite" required />
            </div>
          </div>

          <!-- ENTREPRISE -->
          <div *ngSwitchCase="'ENTREPRISE'" class="space-y-3">
            <div>
              <label class="text-sm text-gray-600">Nom de l'entreprise</label>
              <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.nom" name="nom" required />
            </div>
            <div>
              <label class="text-sm text-gray-600">SIRET</label>
              <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.siret" name="siret" required />
            </div>
            <div>
              <label class="text-sm text-gray-600">Secteur d'activité</label>
              <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.secteur" name="secteur" required />
            </div>
            <div>
              <label class="text-sm text-gray-600">URL du logo (optionnel)</label>
              <input class="mt-1 w-full border rounded px-3 py-2" [(ngModel)]="formData.logoUrl" name="logoUrl" type="url" />
            </div>
          </div>

        </div>

        <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 disabled:opacity-60 inline-flex items-center justify-center gap-2" [disabled]="loading || f.invalid" [attr.aria-busy]="loading">
          <svg *ngIf="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
          <span>{{ loading ? 'Inscription…' : "S'inscrire" }}</span>
        </button>
      </form>
      <div class="text-sm text-gray-600">Déjà un compte ? <a routerLink="/login" class="text-indigo-600 hover:underline">Se connecter</a></div>
    </div>
  </div>
  `
})
export class RegisterPageComponent {
  formData: RegisterRequest = {
    email: '',
    motDePasse: '',
    role: 'ETUDIANT'
  };
  loading = false;
  showPassword = false;

  constructor(private http: HttpClient, private auth: AuthService, private toast: ToastService, private router: Router, private profileImageService: ProfileImageService) {}

  onRoleChange() {
    // Reset optional fields when role changes
    const baseData = {
      email: this.formData.email,
      motDePasse: this.formData.motDePasse,
      role: this.formData.role
    };
    this.formData = baseData;
  }

  register() {
    if (this.loading) return;
    
    this.loading = true;
    this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, this.formData).subscribe({
      next: (res) => {
        let avatar = res.avatarUrl;
        try {
          if (avatar && !avatar.startsWith('http') && !avatar.startsWith('/files/')) {
            avatar = this.profileImageService.buildImageUrl(avatar);
          }
        } catch (e) {
          console.warn('Erreur build avatarUrl:', e);
        }

        const user: CurrentUser = {
          id: res.id,
          email: res.email,
          fullName: res.fullName || this.getDisplayName(),
          role: res.role,
          token: res.token,
          avatarUrl: avatar
        };
        this.auth.currentUser = user;
        this.toast.show('Compte créé avec succès !', 'success');
        this.router.navigateByUrl('/dashboard');
        this.loading = false;
      },
      error: (err) => {
        console.error('Registration error:', err);
        if (err?.status === 400) {
          this.toast.show("Données invalides. Vérifiez tous les champs requis.", 'error');
        } else if (err?.status === 409) {
          this.toast.show("Cet email est déjà utilisé.", 'error');
        } else {
          this.toast.show("Erreur lors de l'inscription. Réessayez.", 'error');
        }
        this.loading = false;
      }
    });
  }

  private getDisplayName(): string {
    switch (this.formData.role) {
      case 'ETUDIANT':
      case 'ENSEIGNANT':
        return `${this.formData.prenom} ${this.formData.nom}`;
      case 'ENTREPRISE':
        return this.formData.nom || 'Entreprise';
      case 'ADMIN':
        return 'Administrateur';
      default:
        return this.formData.email;
    }
  }
}

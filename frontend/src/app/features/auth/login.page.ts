import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, CurrentUser, UserRole } from '../../core/services/auth.service';
import { ProfileImageService } from '../../core/services/profile-image.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/services/toast.service';
import { LoginRequest, LoginResponse } from '../../core/models/user.models';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900">Connexion</h2>
        <p class="mt-2 text-sm text-gray-600">Connectez-vous à votre compte</p>
      </div>
      
      <div *ngIf="infoMessage" class="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-3">
        {{ infoMessage }}
      </div>
      
      <form #f="ngForm" (ngSubmit)="onSubmit(f)" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input 
            class="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
            [(ngModel)]="email" 
            name="email" 
            type="email" 
            required 
            email 
            #emailCtrl="ngModel" 
            placeholder="votre@email.com"
          />
          <p class="mt-1 text-xs text-red-600" *ngIf="emailCtrl.invalid && (emailCtrl.touched || f.submitted)">
            Veuillez saisir un email valide.
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
          <div class="relative">
            <input 
              class="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              [(ngModel)]="password" 
              name="password" 
              [type]="showPassword ? 'text' : 'password'" 
              required 
              minlength="4" 
              #pwdCtrl="ngModel" 
              placeholder="Votre mot de passe"
            />
            <button 
              type="button" 
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" 
              (click)="showPassword = !showPassword"
            >
              <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-xs text-red-600" *ngIf="pwdCtrl.invalid && (pwdCtrl.touched || f.submitted)">
            Le mot de passe est requis (4 caractères minimum).
          </p>
        </div>
        
        <button 
          type="submit"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-4 py-2 disabled:opacity-60 inline-flex items-center justify-center gap-2 transition-colors" 
          [disabled]="loading" 
          [attr.aria-busy]="loading"
          (click)="onButtonClick($event)"
        >
          <svg *ngIf="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span>{{ loading ? 'Connexion…' : 'Se connecter' }}</span>
        </button>
      </form>
      
      <div class="text-center text-sm text-gray-600">
        Pas de compte ? 
        <a routerLink="/register" class="text-indigo-600 hover:text-indigo-500 font-medium">
          Créer un compte
        </a>
      </div>
    </div>
  </div>
  `
})
export class LoginPageComponent {
  email = '';
  password = '';
  loading = false;
  infoMessage = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router, private http: HttpClient, private toast: ToastService, private profileImageService: ProfileImageService, route: ActivatedRoute) {
    const qp = route.snapshot.queryParamMap;
    const reason = qp.get('reason');
    if (reason === 'auth') this.infoMessage = 'Veuillez vous connecter pour continuer.';
  }

  onButtonClick(event: Event) {
    event.preventDefault();
    this.login();
  }

  onSubmit(form: any) {
    console.log('=== FORM SUBMIT ===');
    console.log('Form valid:', form.valid);
    console.log('Form value:', form.value);
    console.log('Form errors:', form.errors);
    
    if (form.valid) {
      console.log('Formulaire valide, appel de login()');
      this.login();
    } else {
      console.log('Formulaire invalide, abandon');
    }
  }

  login() {
    console.log('=== DÉBUT LOGIN ===');
    console.log('Loading state:', this.loading);
    
    if (this.loading) {
      console.log('Login déjà en cours, abandon');
      return;
    }
    
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    
    const loginData: LoginRequest = {
      email: this.email,
      motDePasse: this.password
    };
    
    console.log('LoginData créé:', loginData);
    console.log('URL API:', `${environment.apiUrl}/auth/login`);
    
    this.loading = true;
    console.log('Loading défini à true, envoi de la requête...');
    this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginData).subscribe({
      next: (res) => {
        console.log('Réponse du serveur:', res);
        
        if (!res || !res.token) {
          console.error('Réponse invalide du serveur:', res);
          this.toast.show('Erreur de connexion - réponse invalide', 'error');
          this.loading = false;
          return;
        }

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
          fullName: res.fullName || res.email.split('@')[0],
          role: res.role,
          token: res.token,
          avatarUrl: avatar
        };
        
        console.log('Utilisateur créé:', user);
        this.auth.currentUser = user;
        console.log('Utilisateur sauvegardé. Vérification:', this.auth.currentUser);
        this.toast.show('Connexion réussie !', 'success');
        
        // Redirection en fonction du rôle
        console.log('Redirection basée sur le rôle:', user.role);
        switch(user.role) {
          case 'ADMIN':
            console.log('Redirection vers /admin');
            this.router.navigateByUrl('/admin');
            break;
          case 'ETUDIANT':
            console.log('Redirection vers /etudiant');
            this.router.navigateByUrl('/etudiant');
            break;
          case 'ENSEIGNANT':
            console.log('Redirection vers /dashboard');
            this.router.navigateByUrl('/dashboard');
            break;
          case 'ENTREPRISE':
            console.log('Redirection vers /offres');
            this.router.navigateByUrl('/offres');
            break;
          default:
            console.log('Redirection par défaut vers /dashboard');
            this.router.navigateByUrl('/dashboard');
        }
        
        console.log('Fin du processus de connexion');
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur complète de connexion:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Body:', err.error);
        
        let errorMessage = 'Email ou mot de passe incorrect';
        if (err.status === 0) {
          errorMessage = 'Impossible de contacter le serveur';
        } else if (err.status === 500) {
          errorMessage = 'Erreur serveur interne';
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        
        this.toast.show(errorMessage, 'error');
        this.loading = false;
      }
    });
  }

}

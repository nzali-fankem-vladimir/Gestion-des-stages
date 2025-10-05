import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService, CurrentUser, UserRole } from './auth.service';
import { ProfileImageService } from './profile-image.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private profileImageService: ProfileImageService
  ) {}

  /**
   * Vérifie s'il y a une session active côté backend
   */
  checkExistingSession(): Observable<boolean> {
    console.log('=== VÉRIFICATION SESSION EXISTANTE ===');
    
    // Si on a déjà un utilisateur en localStorage, il est valide
    const currentUser = this.auth.currentUser;
    if (currentUser && currentUser.token) {
      console.log('Utilisateur trouvé en localStorage:', currentUser);
      return of(true);
    }

    // Le backend utilise un filtrage JWT (Authorization: Bearer ...).
    // Si on n'a pas de token local, l'appel à /auth/me renverra systématiquement 401.
    // Pour éviter les erreurs côté client, on ne tente pas la vérification côté serveur
    // ici. Si vous utilisez une authentification basée sur cookie, réactivez l'appel
    // et assurez-vous que les cookies sont envoyés avec `withCredentials` côté client
    // et que le backend gère la session.
    console.log('Aucun token local, pas d appel à /auth/me (backend attend un JWT)');
    return of(false);
  }

  /**
   * Valide une session existante
   */
  private validateSession(user: CurrentUser): Observable<boolean> {
    console.log('Validation de la session pour:', user.email);
    
    return this.http.get<any>(`${environment.apiUrl}/auth/validate`).pipe(
      tap(() => {
        console.log('Session validée, redirection...');
        this.redirectBasedOnRole(user.role);
      }),
      catchError((error) => {
        console.log('Session expirée, nettoyage:', error.status);
        this.auth.logout();
        return of(false);
      })
    );
  }

  /**
   * Redirige l'utilisateur selon son rôle
   */
  private redirectBasedOnRole(role: UserRole) {
    console.log('Redirection basée sur le rôle:', role);
    
    // Éviter la redirection si on est déjà sur la bonne page
    const currentUrl = this.router.url;
    console.log('URL actuelle:', currentUrl);
    
    switch(role) {
      case 'ADMIN':
        if (!currentUrl.startsWith('/admin')) {
          console.log('Redirection vers /admin');
          this.router.navigateByUrl('/admin');
        }
        break;
      case 'ETUDIANT':
        if (!currentUrl.startsWith('/etudiant') && !currentUrl.startsWith('/candidatures') && !currentUrl.startsWith('/rapports')) {
          console.log('Redirection vers /etudiant');
          this.router.navigateByUrl('/etudiant');
        }
        break;
      case 'ENSEIGNANT':
        if (!currentUrl.startsWith('/enseignant') && currentUrl !== '/dashboard') {
          console.log('Redirection vers /dashboard');
          this.router.navigateByUrl('/dashboard');
        }
        break;
      case 'ENTREPRISE':
        if (!currentUrl.startsWith('/offres') && !currentUrl.startsWith('/candidatures-recues') && !currentUrl.startsWith('/entreprise')) {
          console.log('Redirection vers /offres');
          this.router.navigateByUrl('/offres');
        }
        break;
      default:
        if (currentUrl !== '/dashboard') {
          console.log('Redirection par défaut vers /dashboard');
          this.router.navigateByUrl('/dashboard');
        }
    }
  }
}

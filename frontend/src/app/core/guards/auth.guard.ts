import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  console.log('AuthGuard - Checking authentication for:', state.url);
  console.log('AuthGuard - Current user:', auth.currentUser);
  
  // Si l'utilisateur est déjà authentifié localement
  if (auth.currentUser && auth.token) {
    console.log('AuthGuard - User authenticated locally, allowing access');
    return true;
  }
  
  // Pas d'utilisateur authentifié, rediriger vers login
  console.log('AuthGuard - No authenticated user, redirecting to login');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard pour protéger les routes nécessitant une authentification
 * VERSION AMÉLIORÉE pour gérer correctement l'état asynchrone
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord si on a un token valide
  const hasValidToken = authService.isTokenValid();

  if (!hasValidToken) {
    // Pas de token valide, rediriger immédiatement
    localStorage.setItem('returnUrl', state.url);
    router.navigate(['/authentication/login']);
    return false;
  }

  // On a un token valide, vérifier l'état d'authentification
  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      // Si déjà authentifié et on a un utilisateur, autoriser l'accès
      if (isAuthenticated && authService.getCurrentUserValue()) {
        return true;
      }

      // Si on a un token valide mais l'état n'est pas encore à jour
      // C'est que checkAuth() est en cours d'exécution
      // On autorise l'accès car le token est valide
      if (hasValidToken) {
        return true;
      }

      // Sinon, rediriger vers login
      localStorage.setItem('returnUrl', state.url);
      router.navigate(['/authentication/login']);
      return false;
    }),
    catchError(() => {
      localStorage.setItem('returnUrl', state.url);
      router.navigate(['/authentication/login']);
      return of(false);
    })
  );
};

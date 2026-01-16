import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard pour empêcher l'accès aux pages d'auth si déjà connecté
 * Exemple: page de login, register
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }

      // Rediriger vers le dashboard si déjà connecté
      router.navigate(['/admin/dashboard']);
      return false;
    })
  );
};

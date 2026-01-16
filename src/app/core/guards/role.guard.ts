import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard pour protéger les routes selon le rôle
 * Utilisation: canActivate: [() => roleGuard(['ACS', 'ICP'])]
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          router.navigate(['/authentication/login']);
          return false;
        }

        if (allowedRoles.includes(user.role)) {
          return true;
        }

        // Rediriger vers une page "Accès refusé"
        router.navigate(['/error/unauthorized']);
        return false;
      })
    );
  };
};

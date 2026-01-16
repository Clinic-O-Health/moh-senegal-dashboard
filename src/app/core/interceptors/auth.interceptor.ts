import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

/**
 * Interceptor corrigé pour éviter la dépendance circulaire
 * On n'injecte PAS AuthService ici, on accède directement au localStorage
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Récupérer le token directement du localStorage (pas via AuthService)
  const token = localStorage.getItem('access_token');

  // Liste des URLs qui ne nécessitent pas de token
  const publicUrls = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/password/request'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  // Cloner la requête et ajouter le token si disponible et nécessaire
  let authReq = req;
  if (token && !isPublicUrl) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si erreur 401 et pas déjà sur une route de refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        // Récupérer le refresh token
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          // Tenter de rafraîchir le token
          const refreshReq = req.clone({
            url: req.url.replace(/\/users\/me.*/, '/auth/refresh'),
            method: 'POST',
            body: { refresh_token: refreshToken },
            headers: req.headers.delete('Authorization')
          });

          // Utiliser l'URL correcte pour le refresh
          const apiUrl = req.url.split('/')[0] + '//' + req.url.split('/')[2];
          const refreshUrl = `${apiUrl}/auth/refresh`;

          return next(
            req.clone({
              url: refreshUrl,
              method: 'POST',
              body: { refresh_token: refreshToken },
              headers: req.headers.delete('Authorization')
            })
          ).pipe(
            switchMap((response: any) => {
              // Sauvegarder les nouveaux tokens
              if (response?.data?.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);

                // Retry la requête originale avec le nouveau token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${response.data.access_token}`
                  }
                });
                return next(retryReq);
              }

              // Si pas de token dans la réponse, déconnecter
              handleLogout(router);
              return throwError(() => error);
            }),
            catchError(refreshError => {
              // Si le refresh échoue, déconnecter
              handleLogout(router);
              return throwError(() => refreshError);
            })
          );
        } else {
          // Pas de refresh token, déconnecter
          handleLogout(router);
        }
      }

      return throwError(() => error);
    })
  );
};
function handleLogout(router: Router): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  router.navigate(['/authorisation/login']);
}
// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { AuthService } from '../services/auth.service';
// import { catchError, switchMap, throwError } from 'rxjs';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);
//   const token = authService.getAccessToken();

//   // Cloner la requête et ajouter le token si disponible
//   let authReq = req;
//   if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
//     authReq = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//   }

//   return next(authReq).pipe(
//     catchError(error => {
//       // Si erreur 401, tenter de rafraîchir le token
//       if (error.status === 401 && !req.url.includes('/auth/refresh')) {
//         return authService.refreshToken().pipe(
//           switchMap(() => {
//             // Récupérer le nouveau token
//             const newToken = authService.getAccessToken();
//             const retryReq = req.clone({
//               setHeaders: {
//                 Authorization: `Bearer ${newToken}`
//               }
//             });
//             return next(retryReq);
//           }),
//           catchError(refreshError => {
//             // Si le rafraîchissement échoue, déconnecter
//             authService.logout();
//             return throwError(() => refreshError);
//           })
//         );
//       }

//       return throwError(() => error);
//     })
//   );
// };

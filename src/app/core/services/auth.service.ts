import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar?: string;
  status: string;
  email_verified: boolean;
}

export interface AuthResponse {
  data: {
    access_token: string;
    refresh_token: string;
    expires: number;
  };
}

export interface MeResponse {
  data: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  // BehaviorSubject pour suivre l'état de connexion
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  constructor(private readonly http: HttpClient, private readonly router: Router) {
    this.checkAuth();
  }

  verifyAccount(token: string, email: string): Observable<any> {
    const url = `${this.apiUrl}/account-verification/auth/verify-email`;
    return this.http.post<any>(url, { token, email });
  }
  resetPasswordRequest(email: string): Observable<any> {
    const url = `${this.apiUrl}/account-verification/auth/init-forgotten-password`;
    const params = new HttpParams().set('email', email);
    return this.http.get<any>(url, { params });
  }
  validatePasswordReset(token: string, email: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/account-verification/auth/update-user-password`;
    return this.http.post<any>(url, { token, email, password });
  }
  /**
   * Connexion de l'utilisateur
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          console.log('Réponse de connexion:', response);
          // Stocker les tokens
          this.setTokens(response.data.access_token, response.data.refresh_token);

          // Récupérer les infos utilisateur
          this.getCurrentUser().subscribe();
        }),
        catchError((error) => {
          console.error('Erreur de connexion:', error);
          throw error;
        })
      );
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    // Appeler l'endpoint de déconnexion Directus
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      this.http
        .post(`${this.apiUrl}/auth/logout`, {
          refresh_token: refreshToken,
        })
        .subscribe({
          next: () => {
            this.clearSession();
          },
          error: () => {
            // Même en cas d'erreur, on nettoie la session locale
            this.clearSession();
          },
        });
    } else {
      this.clearSession();
    }
  }

  /**
   * Rafraîchir le token d'accès
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return of(null as any);
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {
        refresh_token: refreshToken,
      })
      .pipe(
        tap((response) => {
          this.setTokens(response.data.access_token, response.data.refresh_token);
        }),
        catchError((error) => {
          console.error('Erreur rafraîchissement token:', error);
          this.clearSession();
          throw error;
        })
      );
  }

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  getCurrentUser(): Observable<MeResponse> {
    const token = this.getAccessToken();

    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    // Créer les headers manuellement pour éviter la dépendance circulaire avec l'interceptor
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<MeResponse>(`${this.apiUrl}/users/me`, {
        headers,
      })
      .pipe(
        tap((response) => {
          console.log('Utilisateur connecté:', response.data);
          localStorage.setItem('user_id', response.data.id);
          this.currentUserSubject.next(response.data);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError((error) => {
          console.error('Erreur récupération utilisateur:', error);
          this.clearSession();
          return throwError(() => error);
        })
      );
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  private checkAuth(): void {
    const token = this.getAccessToken();

    if (token) {
      // Vérifier si le token est encore valide
      // console.log('Vérification du token:', token);
      // console.log('Token expiré ?', this.isTokenExpired(token));
      this.isAuthenticatedSubject.next(true);
      if (this.isTokenExpired(token)) {
        // Tenter de rafraîchir le token
        this.refreshToken().subscribe({
          next: () => {
            this.getCurrentUser().subscribe();
          },
          error: () => {
            // this.clearSession();
          },
        });
      } else {
        // Token valide, récupérer l'utilisateur
        this.getCurrentUser().subscribe({
          error: () => {
            this.clearSession();
          },
        });
      }
    }
  }
  /**
   * Vérifier si le token est expiré (version publique pour les guards)
   */
  isTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }
  /**
   * Vérifier si le token est expiré
   */
  private isTokenExpired(token: string): boolean {
    // try {
    //   const payload = JSON.parse(atob(token.split('.')[1]));
    //   const exp = payload.exp * 1000; // Convertir en millisecondes
    //   return Date.now() >= exp;
    // } catch {
    //   return true;
    // }
    try {
      // Vérifier que le token a bien 3 parties (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token invalide: format incorrect');
        return true;
      }

      // Décoder le payload (partie centrale du JWT)
      const payload = JSON.parse(atob(parts[1]));

      // Vérifier que le champ exp existe
      if (!payload.exp) {
        console.warn('Token invalide: pas de champ exp');
        return true;
      }

      // Le champ exp est en secondes, on le convertit en millisecondes
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();

      // Ajouter une marge de 30 secondes pour éviter les problèmes de timing
      const isExpired = currentTime >= expirationTime - 30000;

      // Log pour debug (à retirer en production)
      if (isExpired) {
        console.log('Token expiré:', {
          expirationDate: new Date(expirationTime),
          currentDate: new Date(currentTime),
          difference: Math.floor((expirationTime - currentTime) / 1000) + ' secondes',
        });
      }

      return isExpired;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return true;
    }
  }

  /**
   * Stocker les tokens
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Récupérer le token d'accès
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Récupérer le token de rafraîchissement
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Obtenir les headers d'authentification
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Nettoyer la session
   */
  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/authentication/login']);
  }

  /**
   * Vérifier si l'utilisateur est authentifié (synchrone)
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtenir l'utilisateur actuel (synchrone)
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === role;
  }

  /**
   * Vérifier si l'utilisateur a l'un des rôles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUserValue();
    return user ? roles.includes(user.role) : false;
  }
}

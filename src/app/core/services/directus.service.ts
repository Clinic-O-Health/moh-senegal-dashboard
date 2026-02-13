import { Injectable } from '@angular/core';
import { authentication, createDirectus, realtime, rest, AuthenticationStorage, AuthenticationData } from '@directus/sdk';
import { environment } from '@environments/environment.development';

/**
 * Storage personnalisé pour synchroniser les tokens entre
 * le SDK Directus et le système d'auth Angular
 */
class DirectusAuthStorage implements AuthenticationStorage {
  get(): AuthenticationData | null {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const expiresAt = localStorage.getItem('token_expires_at');

    if (!accessToken) {
      return null;
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken ?? '',
      expires_at: expiresAt ? parseInt(expiresAt, 10) : 0,
      expires: null,
    };
  }

  set(data: AuthenticationData | null): void {
    if (data) {
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      if (data.expires_at) {
        localStorage.setItem('token_expires_at', data.expires_at.toString());
      }
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class DirectusService {
  private readonly storage = new DirectusAuthStorage();

  public readonly directus = createDirectus(environment.apiUrl)
    .with(rest())
    .with(authentication('json', { storage: this.storage, autoRefresh: true }))
    .with(realtime());

  /**
   * Vérifie si l'utilisateur est authentifié et que le token est valide
   */
  async ensureAuthenticated(): Promise<boolean> {
    try {
      const token = await this.directus.getToken();
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Rafraîchit le token manuellement si nécessaire
   */
  async refreshTokenIfNeeded(): Promise<void> {
    try {
      await this.directus.refresh();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }

  /**
   * Déconnexion - nettoie les tokens
   */
  async logout(): Promise<void> {
    try {
      await this.directus.logout();
    } catch {
      // Nettoyer le storage même si l'appel API échoue
      this.storage.set(null);
    }
  }
}

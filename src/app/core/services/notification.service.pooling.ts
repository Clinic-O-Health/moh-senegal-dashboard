import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, Subscription, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { DirectusNotification, NotificationState } from '@core/models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationPoolingService implements OnDestroy {
  private readonly apiUrl: string;
  private pollingSubscription: Subscription | null = null;
  private readonly POLLING_INTERVAL = 30_000; // 30s

  private readonly state = new BehaviorSubject<NotificationState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  });

  state$ = this.state.asObservable();
  notifications$ = this.state$.pipe(map(s => s.notifications));
  unreadCount$ = this.state$.pipe(map(s => s.unreadCount));
  loading$ = this.state$.pipe(map(s => s.loading));

  constructor(private readonly http: HttpClient) {
    // Remplace par ton URL Directus
    this.apiUrl = environment.apiUrl;
  }

  // ── Récupère les notifications (inbox) ──────────────────────────────────
  fetchNotifications(): Observable<DirectusNotification[]> {
    this.patchState({ loading: true, error: null });

    return this.http
      .get<{ data: DirectusNotification[] }>(`${this.apiUrl}/notifications`, {
        params: { filter: JSON.stringify({ status: { _eq: 'inbox' } }), sort: '-timestamp' },
      })
      .pipe(
        map(res => res.data),
        tap(notifications => {
          this.patchState({ notifications, unreadCount: notifications.length, loading: false });
        }),
        catchError(err => {
          this.patchState({ loading: false, error: err.message });
          return throwError(() => err);
        })
      );
  }

  // ── Marque une notification comme lue (archivée) ────────────────────────
  markAsRead(id: number): Observable<DirectusNotification> {
    return this.http
      .patch<{ data: DirectusNotification }>(`${this.apiUrl}/notifications/${id}`, {
        status: 'archived',
      })
      .pipe(
        map(res => res.data),
        tap(() => {
          const current = this.state.getValue();
          const notifications = current.notifications.filter(n => n.id !== id);
          this.patchState({ notifications, unreadCount: notifications.length });
        }),
        catchError(err => throwError(() => err))
      );
  }

  // ── Marque toutes les notifications comme lues ──────────────────────────
  markAllAsRead(): Observable<void> {
    const ids = this.state.getValue().notifications.map(n => n.id);
    if (!ids.length) return new Observable(obs => obs.complete());

    return this.http
      .patch<void>(`${this.apiUrl}/notifications`, ids.map(id => ({ id, status: 'archived' })))
      .pipe(
        tap(() => this.patchState({ notifications: [], unreadCount: 0 })),
        catchError(err => throwError(() => err))
      );
  }

  // ── Polling automatique ─────────────────────────────────────────────────
  startPolling(): void {
    this.fetchNotifications().subscribe();

    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(switchMap(() => this.fetchNotifications()))
      .subscribe();
  }

  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = null;
  }

  // ── WebSocket temps réel (optionnel) ────────────────────────────────────
  connectWebSocket(token: string): WebSocket {
    const ws = new WebSocket(`${environment.wsUrl}?access_token=${token}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', collection: 'directus_notifications' }));
    };

    ws.onmessage = event => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'notification') {
        this.fetchNotifications().subscribe(); // refresh à chaque événement
      }
    };

    ws.onerror = err => console.error('[WS] Erreur:', err);
    return ws;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private patchState(partial: Partial<NotificationState>): void {
    this.state.next({ ...this.state.getValue(), ...partial });
  }
}

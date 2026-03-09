import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';
import { DirectusNotification } from '@core/models/notification';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, ButtonModule, AvatarModule, MenuModule, PopoverModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  notifications: DirectusNotification[] = [];
  unreadCount = 0;
  loading = false;
  error: string | null = null;
  panelOpen = false;

  private readonly destroy$ = new Subject<void>();
  user = input<any>(null);

  @Output() toggleSidebar = new EventEmitter<void>();
  constructor(
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.notificationService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.notifications = state.notifications;
        this.unreadCount = state.unreadCount;
        this.loading = state.loading;
        this.error = state.error;
        this.cdr.markForCheck();
      });

    this.notificationService.startPolling();
  //   const token = localStorage.getItem('access_token')!;
  // this.notificationService.connect(token); // 👈 remplace startPolling()
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  markAsRead(notification: DirectusNotification): void {
    this.notificationService.markAsRead(notification.id).subscribe();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.notificationService.stopPolling();
    // this.notificationService.disconnect();
  }
}

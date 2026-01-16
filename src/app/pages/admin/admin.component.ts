import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { readUser } from '@directus/sdk';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { DirectusService } from '../../core/services/directus.service';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <app-header (toggleSidebar)="sidebarOpen = !sidebarOpen" [user]="user()" />

    <div class="flex">
      <!-- Sidebar -->
      <app-sidebar [isOpen]="sidebarOpen" [user]="user()" />

      <!-- Main Content -->
      <main class="flex-1 p-4 md:p-6 lg:p-8">
        <router-outlet />
      </main>
    </div>
  </div>`,
})
export class AdminComponent implements OnInit {
  user = signal<any>(null);
  sidebarOpen = false;

  constructor(private readonly directusService: DirectusService) {}
  async ngOnInit() {
    const data = await this.directusService.directus.request(
      readUser(localStorage.getItem('user_id') || '', { fields: ['*,role.id,role.name'] })
    );
    this.user.set(data);
  }
}

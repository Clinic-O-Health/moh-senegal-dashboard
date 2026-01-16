import { Component, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() isOpen = false;
  user = input<any>(null);
  menuItems: MenuItem[] = [
    { label: 'Tableau de bord', icon: 'pi pi-chart-line', route: '/admin/dashboard' },
    { label: 'Patients', icon: 'pi pi-users', route: '/admin/patients' },
    { label: 'Foyers', icon: 'pi pi-home', route: '/admin/households' },
    { label: 'ACS', icon: 'pi pi-id-card', route: '/admin/workers' },
    { label: 'Consultations', icon: 'pi pi-building', route: '/admin/screenings' },
  ];

  get sidebarClasses(): string {
    return `
      fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200
      transition-transform duration-300 ease-in-out flex flex-col
      ${this.isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:static
      w-72
    `;
  }
  constructor(private readonly authService: AuthService) {}
  closeSidebar() {
    this.isOpen = false;
  }

  onMobileClick() {
    // Fermer la sidebar sur mobile après click
    if (window.innerWidth < 1024) {
      this.closeSidebar();
    }
  }
  logout(){
    this.authService.logout();
  }
}

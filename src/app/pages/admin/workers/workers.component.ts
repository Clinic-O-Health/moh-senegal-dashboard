import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';

import { UserDisplay, USER_STATUS_OPTIONS, USER_ROLE_OPTIONS } from '@core/models/user';

@Component({
  selector: 'app-workers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    Select,
    DialogModule,
    TooltipModule,
    AvatarModule,
    DividerModule,
    BadgeModule,
  ],
  templateUrl: './workers.component.html',
  styleUrl: './workers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkersComponent implements OnInit {
  // Data
  users = signal<UserDisplay[]>([]);
  filteredUsers = signal<UserDisplay[]>([]);

  // Search & filters
  searchTerm = '';
  selectedStatus: string | null = null;
  selectedRole: string | null = null;
  selectedRegion: string | null = null;

  // Options
  statusOptions = USER_STATUS_OPTIONS;
  roleOptions = USER_ROLE_OPTIONS;
  regionOptions: { label: string; value: string }[] = [];

  // Loading
  loading = signal(false);

  // Modal
  showUserModal = false;
  selectedUser: UserDisplay | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);

    // Test data
    const usersData: UserDisplay[] = [
      {
        id: 'u-001',
        first_name: 'Fatou',
        last_name: 'Sow',
        email: 'fatou.sow@moh.sn',
        phone_number: '+221 77 123 45 67',
        title: 'Agent Communautaire de Santé',
        status: 'active',
        role: 'acs',
        roleLabel: 'Agent Communautaire (ACS)',
        region: 'Dakar',
        district: 'Pikine',
        community: 'Thiaroye',
        health_center: 'Centre de Santé Thiaroye',
        supervisorName: 'Dr. Mamadou Ba',
        last_access: new Date('2026-01-24T08:30:00'),
        householdsCount: 45,
        patientsCount: 187,
        screeningsCount: 156,
        created_at: new Date('2024-06-15'),
      },
      {
        id: 'u-002',
        first_name: 'Ibrahima',
        last_name: 'Ndiaye',
        email: 'ibrahima.ndiaye@moh.sn',
        phone_number: '+221 76 234 56 78',
        title: 'Agent Communautaire de Santé',
        status: 'active',
        role: 'acs',
        roleLabel: 'Agent Communautaire (ACS)',
        region: 'Dakar',
        district: 'Guédiawaye',
        community: 'Golf Sud',
        health_center: 'Centre de Santé Golf Sud',
        supervisorName: 'Dr. Mamadou Ba',
        last_access: new Date('2026-01-23T16:45:00'),
        householdsCount: 38,
        patientsCount: 142,
        screeningsCount: 128,
        created_at: new Date('2024-07-20'),
      },
      {
        id: 'u-003',
        first_name: 'Moussa',
        last_name: 'Diop',
        email: 'moussa.diop@moh.sn',
        phone_number: '+221 78 345 67 89',
        title: 'Agent Communautaire de Santé',
        status: 'active',
        role: 'acs',
        roleLabel: 'Agent Communautaire (ACS)',
        region: 'Thiès',
        district: 'Thiès',
        community: 'Mbour',
        health_center: 'Centre de Santé Mbour',
        supervisorName: 'Dr. Aïssatou Diallo',
        last_access: new Date('2026-01-24T10:15:00'),
        householdsCount: 52,
        patientsCount: 203,
        screeningsCount: 189,
        created_at: new Date('2024-05-10'),
      },
      {
        id: 'u-004',
        first_name: 'Mamadou',
        last_name: 'Ba',
        email: 'mamadou.ba@moh.sn',
        phone_number: '+221 77 456 78 90',
        title: 'Médecin Chef de District',
        status: 'active',
        role: 'medecin',
        roleLabel: 'Médecin',
        region: 'Dakar',
        district: 'Pikine',
        community: '',
        health_center: 'District Sanitaire de Pikine',
        supervisorName: '',
        last_access: new Date('2026-01-24T09:00:00'),
        householdsCount: 0,
        patientsCount: 0,
        screeningsCount: 0,
        created_at: new Date('2024-01-05'),
      },
      {
        id: 'u-005',
        first_name: 'Aïssatou',
        last_name: 'Diallo',
        email: 'aissatou.diallo@moh.sn',
        phone_number: '+221 76 567 89 01',
        title: 'Infirmière Chef de Poste',
        status: 'active',
        role: 'infirmier',
        roleLabel: 'Infirmier',
        region: 'Thiès',
        district: 'Thiès',
        community: '',
        health_center: 'Poste de Santé Mbour Nord',
        supervisorName: 'Dr. Oumar Sy',
        last_access: new Date('2026-01-22T14:30:00'),
        householdsCount: 0,
        patientsCount: 0,
        screeningsCount: 0,
        created_at: new Date('2024-02-18'),
      },
      {
        id: 'u-006',
        first_name: 'Oumar',
        last_name: 'Sy',
        email: 'oumar.sy@moh.sn',
        phone_number: '+221 78 678 90 12',
        title: 'Superviseur Régional',
        status: 'active',
        role: 'supervisor',
        roleLabel: 'Superviseur',
        region: 'Thiès',
        district: '',
        community: '',
        health_center: 'Région Médicale de Thiès',
        supervisorName: '',
        last_access: new Date('2026-01-24T07:45:00'),
        householdsCount: 0,
        patientsCount: 0,
        screeningsCount: 0,
        created_at: new Date('2023-11-20'),
      },
      {
        id: 'u-007',
        first_name: 'Khady',
        last_name: 'Mbaye',
        email: 'khady.mbaye@moh.sn',
        phone_number: '+221 77 789 01 23',
        title: 'Agent Communautaire de Santé',
        status: 'suspended',
        role: 'acs',
        roleLabel: 'Agent Communautaire (ACS)',
        region: 'Saint-Louis',
        district: 'Saint-Louis',
        community: 'Sor',
        health_center: 'Centre de Santé Sor',
        supervisorName: 'Dr. Abdoulaye Fall',
        last_access: new Date('2026-01-10T11:20:00'),
        householdsCount: 28,
        patientsCount: 95,
        screeningsCount: 72,
        created_at: new Date('2024-08-05'),
      },
      {
        id: 'u-008',
        first_name: 'Admin',
        last_name: 'System',
        email: 'admin@moh.sn',
        phone_number: '+221 33 800 00 00',
        title: 'Administrateur Système',
        status: 'active',
        role: 'admin',
        roleLabel: 'Administrateur',
        region: '',
        district: '',
        community: '',
        health_center: 'Ministère de la Santé',
        supervisorName: '',
        last_access: new Date('2026-01-24T11:00:00'),
        householdsCount: 0,
        patientsCount: 0,
        screeningsCount: 0,
        created_at: new Date('2023-01-01'),
      },
    ];

    // Extract unique regions
    const regions = [...new Set(usersData.map((u) => u.region).filter(Boolean))];
    this.regionOptions = regions.map((r) => ({ label: r!, value: r! }));

    this.users.set(usersData);
    this.filteredUsers.set(usersData);
    this.loading.set(false);
  }

  applyFilters(): void {
    let filtered = [...this.users()];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.first_name?.toLowerCase().includes(term) ||
          u.last_name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.phone_number?.includes(term) ||
          u.district?.toLowerCase().includes(term) ||
          u.health_center?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter((u) => u.status === this.selectedStatus);
    }

    if (this.selectedRole) {
      filtered = filtered.filter((u) => u.role === this.selectedRole);
    }

    if (this.selectedRegion) {
      filtered = filtered.filter((u) => u.region === this.selectedRegion);
    }

    this.filteredUsers.set(filtered);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedRole = null;
    this.selectedRegion = null;
    this.filteredUsers.set(this.users());
  }

  viewUser(user: UserDisplay): void {
    this.selectedUser = user;
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
  }

  editUser(user: UserDisplay): void {
    console.log('Edit user:', user);
    // TODO: Navigate to edit page or open edit modal
  }

  callUser(user: UserDisplay): void {
    if (user.phone_number) {
      window.location.href = `tel:${user.phone_number}`;
    }
  }

  emailUser(user: UserDisplay): void {
    if (user.email) {
      window.location.href = `mailto:${user.email}`;
    }
  }

  // Helpers
  getUserInitials(user: UserDisplay): string {
    const first = user.first_name?.charAt(0) || '';
    const last = user.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  getFullName(user: UserDisplay): string {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
  }

  getStatusSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'active':
        return 'success';
      case 'invited':
        return 'info';
      case 'draft':
        return 'secondary';
      case 'suspended':
        return 'warn';
      case 'archived':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string | undefined): string {
    const option = this.statusOptions.find((o) => o.value === status);
    return option?.label || status || 'Inconnu';
  }

  getRoleSeverity(role: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'supervisor':
        return 'warn';
      case 'medecin':
        return 'info';
      case 'infirmier':
        return 'success';
      case 'acs':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getRoleIcon(role: string | undefined): string {
    switch (role) {
      case 'admin':
        return 'pi-shield';
      case 'supervisor':
        return 'pi-eye';
      case 'medecin':
        return 'pi-heart';
      case 'infirmier':
        return 'pi-plus-circle';
      case 'acs':
        return 'pi-users';
      default:
        return 'pi-user';
    }
  }

  getRelativeTime(date: Date | string | undefined): string {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return d.toLocaleDateString('fr-FR');
  }

  // Stats
  getTotalUsers(): number {
    return this.users().length;
  }

  getActiveUsers(): number {
    return this.users().filter((u) => u.status === 'active').length;
  }

  getACSCount(): number {
    return this.users().filter((u) => u.role === 'acs').length;
  }

  getMedicalStaffCount(): number {
    return this.users().filter((u) => u.role === 'medecin' || u.role === 'infirmier').length;
  }
}

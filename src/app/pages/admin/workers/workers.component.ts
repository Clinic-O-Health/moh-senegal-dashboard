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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';

import { UserDisplay, USER_STATUS_OPTIONS, USER_ROLE_OPTIONS, Role } from '@core/models/user';
import { DirectusService } from '@core/services/directus.service';
import { readUsers, updateUser } from '@directus/sdk';
import { MessageService } from 'primeng/api';

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
    ToggleSwitchModule,
    ToastModule,
  ],
  templateUrl: './workers.component.html',
  styleUrl: './workers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
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

  constructor(
    private readonly directusService: DirectusService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    try {
      const rawUsers = await this.directusService.directus.request(
        readUsers({
          fields: [
            'id',
            'first_name',
            'last_name',
            'email',
            'status',
            'role',
            'role.name',
            'role.code',
            'title',
            'phone_number',
            'region',
            'district',
            'community',
            'health_center',
            'last_access',
            'created_at',
            'supervisor_id.id',
            'supervisor_id.first_name',
            'supervisor_id.last_name',
          ],
          sort: ['first_name', 'last_name'],
          filter: {
            role: {
              code: {
                _neq: 'ADMIN'
              }
            }
          }
        })
      );

      const usersData: UserDisplay[] = (rawUsers as any[]).map((u) => this.mapUser(u));

      const regions = [...new Set(usersData.map((u) => u.region).filter(Boolean))];
      this.regionOptions = regions.map((r) => ({ label: r!, value: r! }));

      this.users.set(usersData);
      this.filteredUsers.set(usersData);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private normalizeRole(role: string | Role | undefined): 'admin' | 'supervisor' | 'medecin' | 'infirmier' | 'acs' | 'guest' {
    if (!role) return 'guest';
    if (typeof role === 'string') {
      const r = role.toLowerCase();
      if (['admin', 'supervisor', 'medecin', 'infirmier', 'acs'].includes(r)) return r as any;
      return 'guest';
    }
    const name = role.name?.toLowerCase() || '';
    if (name.includes('admin')) return 'admin';
    if (name.includes('super')) return 'supervisor';
    if (name.includes('medec') || name.includes('doctor') || name.includes('médec')) return 'medecin';
    if (name.includes('infirm')) return 'infirmier';
    if (name.includes('acs') || name.includes('agent')) return 'acs';
    return 'guest';
  }

  private mapUser(raw: any): UserDisplay {
    const normalizedRole = this.normalizeRole(raw.role);
    const roleLabel = this.roleOptions.find((o) => o.value === normalizedRole)?.label || (typeof raw.role === 'object' ? raw.role?.name : normalizedRole);
    const supervisorName = raw?.supervisor_id ? [raw.supervisor_id.first_name, raw.supervisor_id.last_name].filter(Boolean).join(' ') : '';

    const fullName = [raw.first_name, raw.last_name].filter(Boolean).join(' ');

    return {
      id: raw.id,
      first_name: raw.first_name,
      last_name: raw.last_name,
      email: raw.email,
      phone_number: raw.phone_number,
      title: raw.title,
      status: raw.status,
      role: normalizedRole,
      roleLabel,
      region: raw.region,
      district: raw.district,
      community: raw.community,
      health_center: raw.health_center,
      supervisorName,
      last_access: raw.last_access,
      created_at: raw.created_at,
      fullName,
      householdsCount: 0,
      patientsCount: 0,
      screeningsCount: 0,
    };
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
    // Ouvrir le modal de profil pour édition
    this.viewUser(user);
  }

  callUser(user: UserDisplay): void {
    if (user.phone_number) {
      globalThis.location.href = `tel:${user.phone_number}`;
    }
  }

  emailUser(user: UserDisplay): void {
    if (user.email) {
      globalThis.location.href = `mailto:${user.email}`;
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

  async toggleUserStatus(user: UserDisplay): Promise<void> {
    // Only proceed if the toggle is being turned on (activating the user)
    // if (!isChecked) {
    //   return;
    // }

    // if (user.status !== 'invited') {
    //   this.messageService.add({
    //     severity: 'warn',
    //     summary: 'Action non autorisée',
    //     detail: 'Seuls les utilisateurs non vérifiés peuvent être activés'
    //   });
    //   return;
    // }

    try {
      await this.directusService.directus.request(
        updateUser(user.id, {
          status: user.status === 'active' ? 'unverified' : 'active'
        })
      );

      // Update local state
      const users = this.users();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], status: user.status === 'active' ? 'unverified' : 'active' };
        this.users.set([...users]);
        this.applyFilters();
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Statut mis à jour',
        detail: `Le statut de l'utilisateur ${this.getFullName(user)} a été mis à jour avec succès`
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la mise à jour du statut de l\'utilisateur'
      });
    }
  }

  canToggleStatus(user: UserDisplay): boolean {
    return user.status === 'invited';
  }
}

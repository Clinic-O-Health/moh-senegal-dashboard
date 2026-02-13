import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Select } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { Household, HouseholdMember } from '@core/models/household';
import { DirectusService } from '@core/services/directus.service';
import { readItem, readItems } from '@directus/sdk';

@Component({
  selector: 'app-household-details',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    Select,
    CardModule,
    TooltipModule,
    DividerModule,
  ],
  templateUrl: './household-details.component.html',
  styleUrl: './household-details.component.scss',
})
export class HouseholdDetailsComponent implements OnInit {
  loading = false;
  household: Household | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly directusService: DirectusService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadHousehold();
  }

  async loadHousehold() {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading = false;
      return;
    }

    try {
      // Charger le ménage depuis Directus
      const householdData = await this.directusService.directus.request(
        readItem('household', id, {
          fields: ['*']
        })
      ) as Household;

      // Charger les membres du ménage
      const members = await this.directusService.directus.request(
        readItems('householdmember', {
          filter: { householdid: { _eq: id } },
          fields: [
            '*',
            'workerId.id',
            'workerId.first_name',
            'workerId.last_name',
            'workerId.phone_number'
          ]
        })
      ) as HouseholdMember[];

      // Mapper les membres
      const mappedMembers = members.map(m => this.mapMember(m));

      // Calculer les statistiques
      const totalMembers = mappedMembers.length;
      const membersScreened = mappedMembers.filter(m => m.filledScreeningForm).length;
      const membersAtRisk = mappedMembers.filter(m =>
        m.htaClassification === 'elevee' || m.diabetesClassification === 'elevee'
      ).length;

      // Récupérer le nom de l'ACS si disponible
      let workerName = '';
      const headOfHousehold = mappedMembers.find(m => m.isheadofhousehold);
      if (headOfHousehold?.assignedWorkerName) {
        workerName = headOfHousehold.assignedWorkerName;
      }

      this.household = {
        ...householdData,
        members: mappedMembers,
        totalMembers,
        membersScreened,
        membersAtRisk,
        workerName
      };

      console.log('Ménage chargé:', this.household);
    } catch (error) {
      console.error('Erreur lors du chargement du ménage:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Forcer la détection de changements
    }
  }

  /**
   * Mappe un membre brut de Directus vers le format attendu
   */
  mapMember(raw: HouseholdMember): HouseholdMember {
    // Calculer l'âge depuis dateofbirth
    let age: number | undefined;
    if (raw.dateofbirth) {
      const birthDate = new Date(raw.dateofbirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Normaliser le genre
    let sex: 'M' | 'F' | undefined;
    if (raw.gender) {
      const g = raw.gender.toLowerCase();
      if (g === 'male' || g === 'm' || g === 'homme') {
        sex = 'M';
      } else if (g === 'female' || g === 'f' || g === 'femme') {
        sex = 'F';
      }
    }

    // Extraire les infos du worker si expanded
    let assignedWorkerName: string | undefined;
    let assignedWorkerPhone: string | undefined;
    if (raw.workerId && typeof raw.workerId === 'object') {
      const worker = raw.workerId;
      assignedWorkerName = [worker.first_name, worker.last_name].filter(Boolean).join(' ') || undefined;
      assignedWorkerPhone = worker.phone_number;
    }

    // Déterminer le lien avec le chef de ménage
    let relationshipToHead = 'Membre';
    if (raw.isheadofhousehold) {
      relationshipToHead = 'Chef de ménage';
    }

    const mapped: HouseholdMember = {
      ...raw,
    };

    if (age !== undefined) mapped.age = age;
    if (sex !== undefined) mapped.sex = sex;
    if (assignedWorkerName) mapped.assignedWorkerName = assignedWorkerName;
    if (assignedWorkerPhone) mapped.assignedWorkerPhone = assignedWorkerPhone;
    mapped.relationshipToHead = relationshipToHead;

    return mapped;
  }

  // Helper pour obtenir le nom complet du membre
  getMemberFullName(member: HouseholdMember): string {
    return [member.firstname, member.lastname].filter(Boolean).join(' ');
  }

  addMember() {
    console.log('Ajouter un nouveau membre');
    // TODO: Ouvrir un dialogue pour ajouter un membre
  }

  viewMemberDetails(memberId: string) {
    console.log('Voir détails du membre:', memberId);
    // Navigation vers les détails du patient
    this.router.navigate(['/admin/patient', memberId]);
  }

  editMember(memberId: string) {
    console.log('Modifier le membre:', memberId);
    // TODO: Ouvrir un dialogue pour modifier le membre
  }

  editHousehold() {
    console.log('Modifier le ménage');
    // TODO: Ouvrir un dialogue pour modifier le ménage
  }

  confirmDeleteMember(memberId: string) {
    console.log('Confirmer suppression du membre:', memberId);
    // TODO: Ouvrir une confirmation de suppression
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      this.deleteMember(memberId);
    }
  }

  private deleteMember(memberId: string) {
    if (this.household?.members) {
      this.household.members = this.household.members.filter(m => m.id !== memberId);
      this.household.totalMembers = this.household.members.length;
      console.log('Membre supprimé:', memberId);
    }
  }

  // Helpers pour l'affichage
  getFollowUpStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      'actif': 'Actif',
      'stable': 'Stable',
      'risque': 'À risque',
      'urgent': 'Urgent'
    };
    return labels[status || ''] || 'Non défini';
  }

  getFollowUpStatusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'actif': 'info',
      'stable': 'success',
      'risque': 'warn',
      'urgent': 'danger'
    };
    return severities[status || ''] || 'secondary';
  }

  getScreeningStatus(member: HouseholdMember): string {
    if (!member.filledScreeningForm) return 'Non dépisté';
    if (member.htaClassification === 'elevee' || member.diabetesClassification === 'elevee') return 'À risque';
    return 'Normal';
  }

  getScreeningStatusSeverity(member: HouseholdMember): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (!member.filledScreeningForm) return 'secondary';
    if (member.htaClassification === 'elevee' || member.diabetesClassification === 'elevee') return 'danger';
    return 'success';
  }

  getMemberInitials(member: HouseholdMember): string {
    const first = member.firstname?.charAt(0) || '';
    const last = member.lastname?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getAwarenessFormCount(): number {
    return this.household?.members?.filter(m => m.filledAwarenessForm).length || 0;
  }

  getScreeningFormCount(): number {
    return this.household?.members?.filter(m => m.filledScreeningForm).length || 0;
  }
}

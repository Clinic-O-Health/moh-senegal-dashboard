import { Component, OnInit } from '@angular/core';
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
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadHousehold();
  }

  loadHousehold() {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    // Simuler le chargement des données
    setTimeout(() => {
      this.household = {
        id: id || '1',
        location: 'Cité Mixta, Rue 12',
        commune: 'Pikine',
        district: 'Pikine Est',
        headOfHouseHoldContact: '+221 77 123 45 67',
        typeOfWater: 'Robinet',
        typeLatrine: 'Moderne',
        dailyExpenditure: '15000',
        hasGarbageCollectionService: true,
        timeToNearestHealthCenterMinutes: '15',
        lastDoctorVisitDate: new Date('2025-12-10'),
        doctorVisitsLast12Months: '3',
        totalMembers: 6,
        membersScreened: 4,
        membersAtRisk: 2,
        workerId: 'worker-123',
        workerName: 'Fatou Dieng',
        members: [
          {
            id: '1',
            firstName: 'Mamadou',
            lastName: 'Diop',
            relationshipToHead: 'Chef de ménage',
            age: 45,
            sex: 'M',
            phoneNumber: '+221 77 123 45 67',
            matrimonialStatus: 'Marié',
            filledAwarenessForm: true,
            filledScreeningForm: true,
            htaClassification: 'elevee',
            diabetesClassification: 'normale',
            followUpStatus: 'risque',
          },
          {
            id: '2',
            firstName: 'Aissatou',
            lastName: 'Diop',
            relationshipToHead: 'Épouse',
            age: 40,
            sex: 'F',
            matrimonialStatus: 'Mariée',
            filledAwarenessForm: true,
            filledScreeningForm: true,
            htaClassification: 'normale',
            diabetesClassification: 'normale',
            followUpStatus: 'stable',
          },
          {
            id: '3',
            firstName: 'Fatou',
            lastName: 'Diop',
            relationshipToHead: 'Fille',
            age: 18,
            sex: 'F',
            filledAwarenessForm: false,
            filledScreeningForm: false,
            followUpStatus: 'actif',
          },
          {
            id: '4',
            firstName: 'Ibrahima',
            lastName: 'Diop',
            relationshipToHead: 'Fils',
            age: 15,
            sex: 'M',
            filledAwarenessForm: true,
            filledScreeningForm: true,
            htaClassification: 'normale',
            diabetesClassification: 'normale',
            followUpStatus: 'stable',
          },
          {
            id: '5',
            firstName: 'Mariama',
            lastName: 'Diop',
            relationshipToHead: 'Fille',
            age: 12,
            sex: 'F',
            filledAwarenessForm: false,
            filledScreeningForm: false,
            followUpStatus: 'actif',
          },
          {
            id: '6',
            firstName: 'Cheikh',
            lastName: 'Diop',
            relationshipToHead: 'Fils',
            age: 8,
            sex: 'M',
            filledAwarenessForm: true,
            filledScreeningForm: false,
            followUpStatus: 'actif',
          },
        ],
      };
      this.loading = false;
    }, 800);
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
    const first = member.firstName?.charAt(0) || '';
    const last = member.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getAwarenessFormCount(): number {
    return this.household?.members?.filter(m => m.filledAwarenessForm).length || 0;
  }

  getScreeningFormCount(): number {
    return this.household?.members?.filter(m => m.filledScreeningForm).length || 0;
  }
}

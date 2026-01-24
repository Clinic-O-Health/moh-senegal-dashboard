import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { HouseholdMember } from '@core/models/household';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    Select,
    TooltipModule,
    FormsModule,
  ],
  templateUrl: './patients-list.component.html',
  styleUrl: './patients-list.component.scss',
})
export class PatientsListComponent implements OnInit {
  loading = false;
  searchTerm = '';
  selectedStatut: string | null = null;
  selectedClassification: string | null = null;

  statutOptions: FilterOption[] = [
    { label: 'Actif', value: 'actif' },
    { label: 'Stable', value: 'stable' },
    { label: 'À Risque', value: 'risque' },
    { label: 'Urgent', value: 'urgent' }
  ];

  classificationOptions: FilterOption[] = [
    { label: 'HTA Élevée', value: 'hta_elevee' },
    { label: 'Diabète Élevé', value: 'diabete_eleve' },
    { label: 'HTA + Diabète', value: 'both' }
  ];

  patients: HouseholdMember[] = [];
  filteredPatients: HouseholdMember[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;

    // Simuler un appel API avec des données de test
    setTimeout(() => {
      this.patients = [
        {
          id: '1',
          firstName: 'Moussa',
          lastName: 'Sall',
          age: 58,
          sex: 'M',
          phoneNumber: '+221 77 123 45 67',
          assignedWorkerName: 'Fatou Dieng',
          lastVisitDate: new Date('2026-01-08'),
          htaClassification: 'elevee',
          diabetesClassification: 'elevee',
          followUpStatus: 'risque',
          lastBloodPressure: '145/92',
          lastGlycemia: 1.35,
          filledScreeningForm: true,
          filledAwarenessForm: true,
          householdid: 'h-001'
        },
        {
          id: '2',
          firstName: 'Awa',
          lastName: 'Ndiaye',
          age: 52,
          sex: 'F',
          phoneNumber: '+221 77 234 56 78',
          assignedWorkerName: 'Fatou Dieng',
          lastVisitDate: new Date('2026-01-10'),
          htaClassification: 'elevee',
          followUpStatus: 'urgent',
          lastBloodPressure: '185/105',
          filledScreeningForm: true,
          filledAwarenessForm: true,
          householdid: 'h-002'
        },
        {
          id: '3',
          firstName: 'Khady',
          lastName: 'Ba',
          age: 45,
          sex: 'F',
          phoneNumber: '+221 77 345 67 89',
          assignedWorkerName: 'Ibou Seck',
          lastVisitDate: new Date('2026-01-09'),
          htaClassification: 'normale',
          diabetesClassification: 'normale',
          followUpStatus: 'stable',
          filledScreeningForm: true,
          filledAwarenessForm: true,
          householdid: 'h-003'
        },
        {
          id: '4',
          firstName: 'Oumar',
          lastName: 'Diop',
          age: 62,
          sex: 'M',
          phoneNumber: '+221 77 456 78 90',
          assignedWorkerName: 'Aminata Fall',
          lastVisitDate: new Date('2026-01-07'),
          htaClassification: 'elevee',
          diabetesClassification: 'normale',
          followUpStatus: 'actif',
          lastBloodPressure: '142/88',
          filledScreeningForm: true,
          filledAwarenessForm: false,
          householdid: 'h-001'
        },
        {
          id: '5',
          firstName: 'Aissatou',
          lastName: 'Faye',
          age: 39,
          sex: 'F',
          phoneNumber: '+221 77 567 89 01',
          assignedWorkerName: 'Fatou Dieng',
          lastVisitDate: new Date('2026-01-11'),
          diabetesClassification: 'elevee',
          followUpStatus: 'actif',
          lastGlycemia: 1.45,
          filledScreeningForm: true,
          filledAwarenessForm: true,
          householdid: 'h-004'
        },
        {
          id: '6',
          firstName: 'Ibrahima',
          lastName: 'Gueye',
          age: 35,
          sex: 'M',
          phoneNumber: '+221 77 678 90 12',
          assignedWorkerName: 'Ibou Seck',
          lastVisitDate: new Date('2026-01-05'),
          followUpStatus: 'stable',
          filledScreeningForm: false,
          filledAwarenessForm: true,
          householdid: 'h-005'
        }
      ];

      this.filteredPatients = [...this.patients];
      this.loading = false;
    }, 800);
  }

  onSearch() {
    this.applyFilters();
  }

  onFilter() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredPatients = this.patients.filter(patient => {
      // Filtre recherche
      const matchSearch = !this.searchTerm ||
        (patient.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false) ||
        (patient.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false) ||
        (patient.phoneNumber?.includes(this.searchTerm) ?? false) ||
        (patient.assignedWorkerName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false);

      // Filtre statut
      const matchStatut = !this.selectedStatut ||
        patient.followUpStatus === this.selectedStatut;

      // Filtre classification
      let matchClassification = true;
      if (this.selectedClassification) {
        if (this.selectedClassification === 'hta_elevee') {
          matchClassification = patient.htaClassification === 'elevee';
        } else if (this.selectedClassification === 'diabete_eleve') {
          matchClassification = patient.diabetesClassification === 'elevee';
        } else if (this.selectedClassification === 'both') {
          matchClassification = patient.htaClassification === 'elevee' &&
                               patient.diabetesClassification === 'elevee';
        }
      }

      return matchSearch && matchStatut && matchClassification;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedStatut = null;
    this.selectedClassification = null;
    this.filteredPatients = [...this.patients];
  }

  getActivePatients(): number {
    return this.patients.filter(p => p.followUpStatus === 'actif').length;
  }

  getRiskPatients(): number {
    return this.patients.filter(p => p.followUpStatus === 'risque').length;
  }

  getUrgentPatients(): number {
    return this.patients.filter(p => p.followUpStatus === 'urgent').length;
  }

  getScreenedPatients(): number {
    return this.patients.filter(p => p.filledScreeningForm).length;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'actif': 'Actif',
      'stable': 'Stable',
      'risque': 'À Risque',
      'urgent': 'Urgent'
    };
    return labels[statut] || statut;
  }

  getStatutSeverity(statut: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    const severities: Record<string, "success" | "info" | "warn" | "danger" | "secondary" | "contrast"> = {
      'stable': 'success',
      'actif': 'info',
      'risque': 'warn',
      'urgent': 'danger'
    };
    return severities[statut] || 'info';
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  }

  onNewPatient() {
    console.log('Ajouter nouveau patient');
    // Navigation vers formulaire de création
  }

  viewPatient(patient: HouseholdMember) {
    this.router.navigate(['/admin/patient', patient.id]);
  }

  editPatient(patient: HouseholdMember) {
    console.log('Modifier patient:', patient);
    // Navigation vers formulaire d'édition
  }

  callPatient(patient: HouseholdMember) {
    console.log('Téléconsultation:', patient);
    // Lancer téléconsultation
  }

  getPatientInitials(patient: HouseholdMember): string {
    const first = patient.firstName?.charAt(0) || '';
    const last = patient.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getLastMeasures(patient: HouseholdMember): string {
    const measures: string[] = [];
    if (patient.lastBloodPressure) {
      measures.push(`TA: ${patient.lastBloodPressure}`);
    }
    if (patient.lastGlycemia) {
      measures.push(`Glyc: ${patient.lastGlycemia} g/L`);
    }
    return measures.length > 0 ? measures.join(' | ') : '—';
  }
}

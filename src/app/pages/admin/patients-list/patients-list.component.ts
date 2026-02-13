import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { DirectusService } from '../../../core/services/directus.service';
import { readItems } from '@directus/sdk';

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
    private readonly router: Router,
    private readonly directusService: DirectusService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  async loadPatients() {
    this.loading = true;

    try {
      // Le SDK utilise automatiquement le token via le storage personnalisé
      const patients = await this.directusService.directus.request(
        readItems('householdmember', {
          // filter: { filledScreeningForm: { _eq: true } },
          fields: ['*', 'householdid.*', 'workerId.id', 'workerId.first_name', 'workerId.last_name', 'workerId.phone_number']
        })
      ) as HouseholdMember[];

      console.log('Patients chargés:', patients);

      // Si des données sont retournées, les mapper et les utiliser
      if (patients && patients.length > 0) {
        this.patients = patients.map(p => this.mapPatient(p));
        this.filteredPatients = [...this.patients];
        this.loading = false;
        this.cdr.detectChanges(); // Forcer la détection de changements
        console.log('Patients après mapping:', this.patients);
        return;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    }

    this.loading = false;
    this.cdr.detectChanges(); // Forcer la détection de changements
  }

  /**
   * Mappe les données brutes de Directus vers le format attendu par le template
   */
  mapPatient(raw: HouseholdMember): HouseholdMember {
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

    // Retourner l'objet mappé avec les champs calculés
    const mapped: HouseholdMember = {
      ...raw,
    };

    // Ajouter les champs calculés uniquement s'ils ont une valeur
    if (age !== undefined) mapped.age = age;
    if (sex !== undefined) mapped.sex = sex;
    if (assignedWorkerName) mapped.assignedWorkerName = assignedWorkerName;
    if (assignedWorkerPhone) mapped.assignedWorkerPhone = assignedWorkerPhone;

    return mapped;
  }

  onSearch() {
    this.applyFilters();
  }

  onFilter() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredPatients = this.patients.filter(patient => {
      // Filtre recherche (utilise les champs DB: firstname, lastname)
      const matchSearch = !this.searchTerm ||
        (patient.lastname?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false) ||
        (patient.firstname?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false) ||
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
    const first = patient.firstname?.charAt(0) || '';
    const last = patient.lastname?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  /**
   * Retourne le nom complet du patient
   */
  getPatientFullName(patient: HouseholdMember): string {
    return [patient.firstname, patient.lastname].filter(Boolean).join(' ') || 'N/A';
  }

  /**
   * Retourne le sexe normalisé (M/F) ou le genre brut
   */
  getPatientGender(patient: HouseholdMember): string {
    if (patient.sex) return patient.sex;
    if (patient.gender) {
      const g = patient.gender.toLowerCase();
      if (g === 'male' || g === 'm' || g === 'homme') return 'M';
      if (g === 'female' || g === 'f' || g === 'femme') return 'F';
      return patient.gender;
    }
    return '—';
  }

  /**
   * Retourne le libellé du sexe
   */
  getGenderLabel(patient: HouseholdMember): string {
    const gender = this.getPatientGender(patient);
    if (gender === 'M') return 'Homme';
    if (gender === 'F') return 'Femme';
    return gender;
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

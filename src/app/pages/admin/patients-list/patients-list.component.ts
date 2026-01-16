import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  sexe: string;
  telephone: string;
  acs_assigne: string;
  derniere_visite: Date;
  classification_hta: 'normale' | 'elevee' | null;
  classification_diabete: 'normale' | 'elevee' | null;
  statut_suivi: 'actif' | 'stable' | 'risque' | 'urgent';
  derniere_tension?: string;
  derniere_glycemie?: string;
}

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
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './patients-list.component.html',
  styleUrl: './patients-list.component.scss',
})
export class PatientsListComponent implements OnInit {
  sidebarOpen = false;
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

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];

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
          nom: 'Sall',
          prenom: 'Moussa',
          age: 58,
          sexe: 'M',
          telephone: '+221 77 123 45 67',
          acs_assigne: 'Fatou Dieng',
          derniere_visite: new Date('2026-01-08'),
          classification_hta: 'elevee',
          classification_diabete: 'elevee',
          statut_suivi: 'risque',
          derniere_tension: '145/92',
          derniere_glycemie: '1.35 g/L'
        },
        {
          id: '2',
          nom: 'Ndiaye',
          prenom: 'Awa',
          age: 52,
          sexe: 'F',
          telephone: '+221 77 234 56 78',
          acs_assigne: 'Fatou Dieng',
          derniere_visite: new Date('2026-01-10'),
          classification_hta: 'elevee',
          classification_diabete: null,
          statut_suivi: 'urgent',
          derniere_tension: '185/105'
        },
        {
          id: '3',
          nom: 'Ba',
          prenom: 'Khady',
          age: 45,
          sexe: 'F',
          telephone: '+221 77 345 67 89',
          acs_assigne: 'Ibou Seck',
          derniere_visite: new Date('2026-01-09'),
          classification_hta: 'normale',
          classification_diabete: 'normale',
          statut_suivi: 'stable'
        },
        {
          id: '4',
          nom: 'Diop',
          prenom: 'Oumar',
          age: 62,
          sexe: 'M',
          telephone: '+221 77 456 78 90',
          acs_assigne: 'Aminata Fall',
          derniere_visite: new Date('2026-01-07'),
          classification_hta: 'elevee',
          classification_diabete: 'normale',
          statut_suivi: 'actif',
          derniere_tension: '142/88'
        },
        {
          id: '5',
          nom: 'Faye',
          prenom: 'Aissatou',
          age: 39,
          sexe: 'F',
          telephone: '+221 77 567 89 01',
          acs_assigne: 'Fatou Dieng',
          derniere_visite: new Date('2026-01-11'),
          classification_hta: null,
          classification_diabete: 'elevee',
          statut_suivi: 'actif',
          derniere_glycemie: '1.45 g/L'
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
        patient.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.telephone.includes(this.searchTerm) ||
        patient.acs_assigne.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtre statut
      const matchStatut = !this.selectedStatut ||
        patient.statut_suivi === this.selectedStatut;

      // Filtre classification
      let matchClassification = true;
      if (this.selectedClassification) {
        if (this.selectedClassification === 'hta_elevee') {
          matchClassification = patient.classification_hta === 'elevee';
        } else if (this.selectedClassification === 'diabete_eleve') {
          matchClassification = patient.classification_diabete === 'elevee';
        } else if (this.selectedClassification === 'both') {
          matchClassification = patient.classification_hta === 'elevee' &&
                               patient.classification_diabete === 'elevee';
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
    return this.patients.filter(p => p.statut_suivi === 'actif').length;
  }

  getRiskPatients(): number {
    return this.patients.filter(p => p.statut_suivi === 'risque').length;
  }

  getUrgentPatients(): number {
    return this.patients.filter(p => p.statut_suivi === 'urgent').length;
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

  viewPatient(patient: Patient) {
    console.log('Voir dossier:', patient);
    // Navigation vers détails patient
  }

  editPatient(patient: Patient) {
    console.log('Modifier patient:', patient);
    // Navigation vers formulaire d\'édition
  }

  callPatient(patient: Patient) {
    console.log('Téléconsultation:', patient);
    // Lancer téléconsultation
  }
}

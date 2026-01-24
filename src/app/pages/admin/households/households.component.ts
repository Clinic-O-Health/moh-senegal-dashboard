import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Select } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { Household } from '@core/models/household';
@Component({
  selector: 'app-households',
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
  ],
  templateUrl: './households.component.html',
  styleUrl: './households.component.scss',
})
export class HouseholdsComponent implements OnInit {
  constructor(
    private readonly router: Router,
  ) {}
  loading = false;
  searchTerm = '';
  selectedStatut: string | null = null;

  statutOptions = [
    { label: 'Complet', value: 'complet' },
    { label: 'Incomplet', value: 'incomplet' },
  ];

  households: Household[] = [];
  filteredHouseholds: Household[] = [];

  ngOnInit() {
    this.loadHouseholds();
  }

  loadHouseholds() {
    this.loading = true;
    // Simuler des données basées sur le modèle Directus
    setTimeout(() => {
      this.households = [
        {
          id: '1',
          headOfHouseHoldContact: '+221 77 123 45 67',
          location: 'Touba Toulé',
          commune: 'Khombole',
          district: 'Thiès',
          typeOfWater: 'Robinet',
          typeLatrine: 'WC moderne',
          dailyExpenditure: '5000-10000 FCFA',
          hasGarbageCollectionService: true,
          timeToNearestHealthCenterMinutes: '15',
          lastDoctorVisitDate: new Date('2025-12-15'),
          doctorVisitsLast12Months: '3',
          totalMembers: 6,
          membersScreened: 4,
          membersAtRisk: 2,
          workerName: 'Fatou Dieng',
        },
        {
          id: '2',
          headOfHouseHoldContact: '+221 77 234 56 78',
          location: 'Thilla Ounté',
          commune: 'Khombole',
          district: 'Thiès',
          typeOfWater: 'Puits',
          typeLatrine: 'Latrine traditionnelle',
          dailyExpenditure: '2000-5000 FCFA',
          hasGarbageCollectionService: false,
          timeToNearestHealthCenterMinutes: '30',
          lastDoctorVisitDate: new Date('2025-10-20'),
          doctorVisitsLast12Months: '1',
          totalMembers: 8,
          membersScreened: 8,
          membersAtRisk: 0,
          workerName: 'Ibou Seck',
        },
        {
          id: '3',
          headOfHouseHoldContact: '+221 77 345 67 89',
          location: 'Refane Souf',
          commune: 'Khombole',
          district: 'Thiès',
          typeOfWater: 'Borne fontaine',
          typeLatrine: 'WC moderne',
          dailyExpenditure: '10000-15000 FCFA',
          hasGarbageCollectionService: true,
          timeToNearestHealthCenterMinutes: '10',
          lastDoctorVisitDate: new Date('2026-01-05'),
          doctorVisitsLast12Months: '5',
          totalMembers: 5,
          membersScreened: 2,
          membersAtRisk: 1,
          workerName: 'Aminata Fall',
        },
      ];
      this.filteredHouseholds = [...this.households];
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
    this.filteredHouseholds = this.households.filter((household) => {
      const matchSearch =
        !this.searchTerm ||
        household.location?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        household.commune?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        household.district?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        household.headOfHouseHoldContact?.includes(this.searchTerm);

      const isComplete = household.totalMembers === household.membersScreened;
      const matchStatut = !this.selectedStatut ||
        (this.selectedStatut === 'complet' && isComplete) ||
        (this.selectedStatut === 'incomplet' && !isComplete);

      return matchSearch && matchStatut;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedStatut = null;
    this.filteredHouseholds = [...this.households];
  }

  getTotalPersonnes(): number {
    return this.households.reduce((sum, h) => sum + (h.totalMembers || 0), 0);
  }

  getTotalDepistes(): number {
    return this.households.reduce((sum, h) => sum + (h.membersScreened || 0), 0);
  }

  getTotalARisque(): number {
    return this.households.reduce((sum, h) => sum + (h.membersAtRisk || 0), 0);
  }

  getStatutLabel(household: Household): string {
    const isComplete = household.totalMembers === household.membersScreened;
    return isComplete ? 'Complet' : 'Incomplet';
  }

  getStatutSeverity(household: Household): 'success' | 'warn' | 'danger' | 'info' {
    const isComplete = household.totalMembers === household.membersScreened;
    return isComplete ? 'success' : 'warn';
  }

  onNewHousehold() {
    console.log('Ajouter nouveau ménage');
  }

  viewHousehold(household: Household) {
    console.log('Voir ménage:', household);
    this.router.navigate(['/admin/household-details', household.id]);
  }

  editHousehold(household: Household) {
    console.log('Modifier ménage:', household);
  }
}

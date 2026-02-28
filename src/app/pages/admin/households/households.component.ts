import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { Household, HouseholdMember } from '@core/models/household';
import { DirectusService } from '@core/services/directus.service';
import { readItems } from '@directus/sdk';
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
    private readonly directusService: DirectusService,
    private readonly cdr: ChangeDetectorRef
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

  async loadHouseholds() {
    this.loading = true;

    try {
      // Charger les ménages depuis Directus
      const householdsData = await this.directusService.directus.request(
        readItems('household', {
          fields: ['*'],
          limit: -1
        })
      ) as Household[];

      // Pour chaque ménage, charger les statistiques des membres
      const householdsWithStats = await Promise.all(
        householdsData.map(async (household) => {
          try {
            // Charger les membres du ménage
            const members = await this.directusService.directus.request(
              readItems('householdmember', {
                filter: { householdid: { _eq: household.id } },
                fields: [
                  'id',
                  'workerId.id',
                  'workerId.first_name',
                  'workerId.last_name'
                ]
              })
            ) as HouseholdMember[];

            const totalMembers = members.length;
            const membersScreened = 0;
            // const membersScreened = members.filter(m => m.filledScreeningForm).length;

            // Récupérer le nom de l'ACS du premier membre qui en a un
            let workerName = '';
            for (const member of members) {
              if (member.workerId && typeof member.workerId === 'object') {
                const worker = member.workerId;
                const name = [worker.first_name, worker.last_name].filter(Boolean).join(' ');
                if (name) {
                  workerName = name;
                  break;
                }
              }
            }

            return {
              ...household,
              totalMembers,
              membersScreened,
              membersAtRisk: 0, // On calculerait depuis les screenings si nécessaire
              workerName
            };
          } catch (error) {
            console.error(`Erreur pour le ménage ${household.id}:`, error);
            return {
              ...household,
              totalMembers: 0,
              membersScreened: 0,
              membersAtRisk: 0
            };
          }
        })
      );

      this.households = householdsWithStats;
      this.filteredHouseholds = [...this.households];
      console.log('Ménages chargés:', this.households);
    } catch (error) {
      console.error('Erreur lors du chargement des ménages:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Forcer la détection de changements
    }
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

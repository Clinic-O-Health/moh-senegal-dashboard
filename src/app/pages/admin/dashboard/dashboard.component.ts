import { ChangeDetectionStrategy, Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { DirectusService } from '@core/services/directus.service';
import { aggregate, readItems } from '@directus/sdk';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CardModule, ProgressBarModule, ChartModule, TagModule, DividerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  loading = false;

  // Basic counts
  totalHouseholds = 0;
  totalPatients = 0;
  totalScreened = 0;
  totalReferred = 0;
  totalFollowedUp = 0;

  // Main KPIs (percentages)
  earlyDetectionRate = 0;
  linkageToCareRate = 0;
  stabilizedConditionsRate = 0;

  // Detailed metrics
  htaScreened = 0;
  htaElevated = 0;
  diabetesScreened = 0;
  diabetesElevated = 0;
  preScreeningHighRisk = 0;
  awarenessCompleted = 0;

  // Chart data
  screeningChartData: any;
  kpiChartData: any;
  chartOptions: any;

  constructor(
    private readonly directusService: DirectusService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.loadKPIs();
  }

  private initChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };
  }

  private getTotalCount(res: any): number {
    try {
      // Handle aggregate API response format
      if (res && typeof res.count === 'number') return res.count;
      if (res && res[0]) return parseInt(res[0].count, 10) || 0;
      // if (Array.isArray(res)) return res.length;
      return 0;
    } catch {
      return 0;
    }
  }

  async loadKPIs(): Promise<void> {
    this.loading = true;
    try {
      // Remove the test call
      const [
        householdsRes,
        patientsRes,
        htaScreeningRes,
        htaElevatedRes,
        diabetesScreeningRes,
        diabetesElevatedRes,
        preScreeningRes,
        preScreeningHighRiskRes,
        referencesRes,
        followingRes,
        awarenessRes,
        controlledHtaRes,
        controlledDiabetesRes,
      ] = await Promise.all([
        // Basic counts
        this.directusService.directus.request(
          aggregate('household', {
            aggregate: { count: '*' },
          })
        ),
        this.directusService.directus.request(
          aggregate('householdmember', {
            aggregate: { count: '*' },
          })
        ),

        // HTA screening data
        this.directusService.directus.request(
          aggregate('screening', {
            query: {
              filter: { type: { _eq: 'Hypertension' } },
            },
            aggregate: { count: '*' },
          })
        ),
        this.directusService.directus.request(
          aggregate('screening', {
            query: {
              filter: { type: { _eq: 'Hypertension' }, flag: { _eq: 2 } },
            },
            aggregate: { count: '*' },
          })
        ),

        // Diabetes screening data
        this.directusService.directus.request(
          aggregate('screeningdiabete', {
            aggregate: { count: '*' },
          })
        ),
        this.directusService.directus.request(
          aggregate('screeningdiabete', {
            query: {
              filter: { flag: { _eq: 2 } },
            },
            aggregate: { count: '*' },
          })
        ),

        // Pre-screening data (new format)
        this.directusService.directus.request(
          aggregate('prescreeninganswers', {
            aggregate: { count: '*' },
          })
        ),
        this.directusService.directus.request(
          aggregate('risktest', {
            query: {
              filter: { risklevel: { _gte: 5 } },
            },
            aggregate: { count: '*' },
          })
        ),

        // Care linkage data
        this.directusService.directus.request(
          aggregate('patientreference', {
            aggregate: { count: '*' },
          })
        ),
        this.directusService.directus.request(
          aggregate('following', {
            aggregate: { count: '*' },
          })
        ),

        // Awareness data
        this.directusService.directus.request(
          aggregate('awareness', {
            aggregate: { count: '*' },
          })
        ),

        // Controlled conditions (simplified - patients with recent normal screening)
        this.directusService.directus.request(
          aggregate('screening', {
            query: {
              filter: { type: { _eq: 'Hypertension' }, flag: { _eq: 0 } },
            },
            aggregate: { count: '*' },
          })
        ),
        this.directusService.directus.request(
          aggregate('screeningdiabete', {
            query: {
              filter: { flag: { _eq: 0 } },
            },
            aggregate: { count: '*' },
          })
        ),
      ]);

      console.log('Raw API responses:', {
        householdsRes,
        patientsRes,
        htaScreeningRes,
        htaElevatedRes,
        diabetesScreeningRes,
        diabetesElevatedRes,
        preScreeningRes,
        preScreeningHighRiskRes,
      });
      // Extract counts
      this.totalHouseholds = this.getTotalCount(householdsRes);
      this.totalPatients = this.getTotalCount(patientsRes);
      this.htaScreened = this.getTotalCount(htaScreeningRes);
      this.htaElevated = this.getTotalCount(htaElevatedRes);
      this.diabetesScreened = this.getTotalCount(diabetesScreeningRes);
      this.diabetesElevated = this.getTotalCount(diabetesElevatedRes);
      this.preScreeningHighRisk = this.getTotalCount(preScreeningHighRiskRes);
      this.totalReferred = this.getTotalCount(referencesRes);
      this.totalFollowedUp = this.getTotalCount(followingRes);
      this.awarenessCompleted = this.getTotalCount(awarenessRes);

      console.log('Counts:', {
        totalHouseholds: this.totalHouseholds,
        totalPatients: this.totalPatients,
      });
      // Calculate total screened (unique patients with any screening)
      this.totalScreened =
        this.htaScreened + this.diabetesScreened + this.getTotalCount(preScreeningRes);

      // Calculate controlled conditions
      const controlledHta = this.getTotalCount(controlledHtaRes);
      const controlledDiabetes = this.getTotalCount(controlledDiabetesRes);

      // Calculate main KPIs
      this.calculateMainKPIs(controlledHta, controlledDiabetes);

      // Update charts
      this.updateChartData();
    } catch (error) {
      console.error('Erreur chargement KPIs:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private calculateMainKPIs(controlledHta: number, controlledDiabetes: number): void {
    // KPI 1: Early Detection Rate
    // Percentage of people screened and detected early with conditions
    const totalDetected = this.htaElevated + this.diabetesElevated + this.preScreeningHighRisk;
    this.earlyDetectionRate =
      this.totalPatients > 0 ? (this.preScreeningHighRisk / this.totalPatients) * 100 : 0;

    // KPI 2: Linkage to Care Rate
    // Percentage of detected people who are linked to care
    this.linkageToCareRate = totalDetected > 0 ? (this.totalReferred / totalDetected) * 100 : 0;

    // KPI 3: Stabilized Conditions Rate
    // Percentage of people on treatment with controlled conditions
    const totalElevated = this.htaElevated + this.diabetesElevated;
    const totalControlled = controlledHta + controlledDiabetes;
    this.stabilizedConditionsRate = totalElevated > 0 ? (totalControlled / totalElevated) * 100 : 0;
  }

  private updateChartData(): void {
    // Screening overview chart
    this.screeningChartData = {
      labels: [
        'HTA Dépistés',
        'HTA Élevés',
        'Diabète Dépistés',
        'Diabète Élevés',
        'Prédépistage Risque',
      ],
      datasets: [
        {
          data: [
            this.htaScreened,
            this.htaElevated,
            this.diabetesScreened,
            this.diabetesElevated,
            this.preScreeningHighRisk,
          ],
          backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'],
          borderWidth: 0,
        },
      ],
    };

    // Main KPIs chart
    this.kpiChartData = {
      labels: ['Détection Précoce', 'Liaison aux Soins', 'Conditions Stabilisées'],
      datasets: [
        {
          label: 'Pourcentage (%)',
          data: [this.earlyDetectionRate, this.linkageToCareRate, this.stabilizedConditionsRate],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
          borderColor: ['#059669', '#2563eb', '#d97706'],
          borderWidth: 2,
        },
      ],
    };
  }

  // Helper methods for UI
  getKpiSeverity(value: number): 'success' | 'warn' | 'danger' {
    if (value >= 70) return 'success';
    if (value >= 50) return 'warn';
    return 'danger';
  }

  getKpiColor(value: number): string {
    if (value >= 70) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }
}
interface DirectusResponse {
  data: any[];
  meta: { total_count: number };
}

import { ChangeDetectionStrategy, Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { DirectusService } from '@core/services/directus.service';
import { readItems } from '@directus/sdk';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  loading = false;

  // KPIs
  totalHouseholds = 0;
  totalPatients = 0;
  highRiskCount = 0;
  htaElevated = 0;
  diabeteElevated = 0;

  constructor(
    private readonly directusService: DirectusService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadKPIs();
  }

  private getTotalCount(res: any): number {
    try {
      const meta = res?.meta;
      if (meta && typeof meta.total_count === 'number') return meta.total_count;
      if (Array.isArray(res)) return res.length;
      return 0;
    } catch {
      return 0;
    }
  }

  async loadKPIs(): Promise<void> {
    this.loading = true;
    try {
      const [householdsRes, patientsRes, riskHighRes, htaRes, diabRes] = await Promise.all([
        this.directusService.directus.request(
          readItems('household', { limit: 0, meta: ['total_count'] })
        ),
        this.directusService.directus.request(
          readItems('householdmember', { limit: 0, meta: ['total_count'] })
        ),
        this.directusService.directus.request(
          readItems('risktest', {
            filter: { risklevel: { _gte: 5 } },
            limit: 0,
            meta: ['total_count']
          })
        ),
        this.directusService.directus.request(
          readItems('screening', {
            filter: { type: { _eq: 'Hypertension' }, flag: { _eq: 2 } },
            limit: 0,
            meta: ['total_count']
          })
        ),
        this.directusService.directus.request(
          readItems('screeningdiabete', {
            filter: { flag: { _eq: 2 } },
            limit: 0,
            meta: ['total_count']
          })
        ),
      ]);

      this.totalHouseholds = this.getTotalCount(householdsRes);
      this.totalPatients = this.getTotalCount(patientsRes);
      this.highRiskCount = this.getTotalCount(riskHighRes);
      this.htaElevated = this.getTotalCount(htaRes);
      this.diabeteElevated = this.getTotalCount(diabRes);
    } catch (error) {
      console.error('Erreur chargement KPIs:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}

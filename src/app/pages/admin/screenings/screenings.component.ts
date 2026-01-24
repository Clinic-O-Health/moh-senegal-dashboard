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
import { TabsModule } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

import { RiskTest, ScreeningHTA, ScreeningDiabete } from '@core/models/household';

interface ScreeningWithPatient {
  patientName?: string;
  patientAge?: number;
  patientSex?: 'M' | 'F';
  workerName?: string;
}

export type RiskTestWithPatient = RiskTest & ScreeningWithPatient;
export type ScreeningHTAWithPatient = ScreeningHTA & ScreeningWithPatient;
export type ScreeningDiabeteWithPatient = ScreeningDiabete & ScreeningWithPatient;

@Component({
  selector: 'app-screenings',
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
    TabsModule,
    DialogModule,
    TooltipModule,
    CardModule,
    DividerModule,
  ],
  templateUrl: './screenings.component.html',
  styleUrl: './screenings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreeningsComponent implements OnInit {
  // Data
  riskTests = signal<RiskTestWithPatient[]>([]);
  screeningsHTA = signal<ScreeningHTAWithPatient[]>([]);
  screeningsDiabete = signal<ScreeningDiabeteWithPatient[]>([]);

  // Filtered data
  filteredRiskTests = signal<RiskTestWithPatient[]>([]);
  filteredScreeningsHTA = signal<ScreeningHTAWithPatient[]>([]);
  filteredScreeningsDiabete = signal<ScreeningDiabeteWithPatient[]>([]);

  // Search & filters
  searchTerm = '';
  selectedRiskLevel: string | null = null;
  selectedHTAGrade: string | null = null;
  selectedDiabeteGrade: string | null = null;

  // Loading
  loading = signal(false);

  // Modals
  showRiskTestModal = false;
  showHTAModal = false;
  showDiabeteModal = false;

  selectedRiskTest: RiskTestWithPatient | null = null;
  selectedScreeningHTA: ScreeningHTAWithPatient | null = null;
  selectedScreeningDiabete: ScreeningDiabeteWithPatient | null = null;

  // Options
  riskLevelOptions = [
    { label: 'Faible (0-2)', value: 'low' },
    { label: 'Modéré (3-4)', value: 'moderate' },
    { label: 'Élevé (5+)', value: 'high' },
  ];

  gradeOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Élevé', value: 'elevated' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    // Test data - RiskTests (Prédépistage)
    const riskTestsData: RiskTestWithPatient[] = [
      {
        id: 'rt-001',
        patientid: 'p-001',
        patientName: 'Amadou Diallo',
        patientAge: 52,
        patientSex: 'M',
        workerName: 'Fatou Sow',
        testdate: '2026-01-20',
        testtype: 'Hypertension',
        testresult: JSON.stringify({ age45Plus: true, familyHistory: true, obesity: false, smoking: true, sedentary: true }),
        risklevel: 4,
        isactive: true,
        createdat: new Date('2026-01-20'),
      },
      {
        id: 'rt-002',
        patientid: 'p-002',
        patientName: 'Mariama Fall',
        patientAge: 48,
        patientSex: 'F',
        workerName: 'Ibrahima Ndiaye',
        testdate: '2026-01-19',
        testtype: 'Diabete',
        testresult: JSON.stringify({ age45Plus: true, familyHistory: false, obesity: true, sedentary: true, hypertension: false }),
        risklevel: 3,
        isactive: true,
        createdat: new Date('2026-01-19'),
      },
      {
        id: 'rt-003',
        patientid: 'p-003',
        patientName: 'Ousmane Ba',
        patientAge: 35,
        patientSex: 'M',
        workerName: 'Fatou Sow',
        testdate: '2026-01-18',
        testtype: 'Hypertension',
        testresult: JSON.stringify({ age45Plus: false, familyHistory: false, obesity: false, smoking: false, sedentary: true }),
        risklevel: 1,
        isactive: true,
        createdat: new Date('2026-01-18'),
      },
      {
        id: 'rt-004',
        patientid: 'p-004',
        patientName: 'Aïssatou Sarr',
        patientAge: 60,
        patientSex: 'F',
        workerName: 'Moussa Diop',
        testdate: '2026-01-17',
        testtype: 'Diabete',
        testresult: JSON.stringify({ age45Plus: true, familyHistory: true, obesity: true, sedentary: true, hypertension: true }),
        risklevel: 5,
        isactive: true,
        createdat: new Date('2026-01-17'),
      },
    ];

    // Test data - ScreeningHTA (Dépistage HTA)
    const screeningsHTAData: ScreeningHTAWithPatient[] = [
      {
        id: 'hta-001',
        patientid: 'p-001',
        patientName: 'Amadou Diallo',
        patientAge: 52,
        patientSex: 'M',
        workerName: 'Fatou Sow',
        type: 'Hypertension',
        didhavethedisease: 'Non',
        armrightsystol: '145',
        armleftsystol: '142',
        armrightdiastol: '92',
        armleftdiastol: '90',
        sys_avarage: '143.5',
        dias_avarage: '91',
        flag: 2,
        grade: 'Grade 1',
        isactive: true,
        registrationdate: new Date('2026-01-21'),
        createdat: new Date('2026-01-21'),
      },
      {
        id: 'hta-002',
        patientid: 'p-003',
        patientName: 'Ousmane Ba',
        patientAge: 35,
        patientSex: 'M',
        workerName: 'Fatou Sow',
        type: 'Hypertension',
        didhavethedisease: 'Non',
        armrightsystol: '118',
        armleftsystol: '120',
        armrightdiastol: '78',
        armleftdiastol: '76',
        sys_avarage: '119',
        dias_avarage: '77',
        flag: 0,
        grade: 'Normal',
        isactive: true,
        registrationdate: new Date('2026-01-20'),
        createdat: new Date('2026-01-20'),
      },
      {
        id: 'hta-003',
        patientid: 'p-005',
        patientName: 'Khady Mbaye',
        patientAge: 58,
        patientSex: 'F',
        workerName: 'Ibrahima Ndiaye',
        type: 'Hypertension',
        didhavethedisease: 'Oui',
        armrightsystol: '162',
        armleftsystol: '158',
        armrightdiastol: '102',
        armleftdiastol: '98',
        sys_avarage: '160',
        dias_avarage: '100',
        flag: 2,
        grade: 'Grade 2',
        isactive: true,
        registrationdate: new Date('2026-01-19'),
        createdat: new Date('2026-01-19'),
      },
    ];

    // Test data - ScreeningDiabete (Dépistage Diabète)
    const screeningsDiabeteData: ScreeningDiabeteWithPatient[] = [
      {
        id: 'diab-001',
        patientid: 'p-002',
        patientName: 'Mariama Fall',
        patientAge: 48,
        patientSex: 'F',
        workerName: 'Ibrahima Ndiaye',
        type: 'Diabetes',
        glucose_level: '1.35',
        eatornot: 'Non',
        didhavethedisease: 'Non',
        flag: 2,
        grade: 'Élevé',
        isactive: true,
        registrationdate: new Date('2026-01-20'),
        createdat: new Date('2026-01-20'),
      },
      {
        id: 'diab-002',
        patientid: 'p-004',
        patientName: 'Aïssatou Sarr',
        patientAge: 60,
        patientSex: 'F',
        workerName: 'Moussa Diop',
        type: 'Diabetes',
        glucose_level: '2.10',
        eatornot: 'Non',
        didhavethedisease: 'Oui',
        flag: 2,
        grade: 'Très élevé',
        isactive: true,
        registrationdate: new Date('2026-01-18'),
        createdat: new Date('2026-01-18'),
      },
      {
        id: 'diab-003',
        patientid: 'p-006',
        patientName: 'Mamadou Sy',
        patientAge: 42,
        patientSex: 'M',
        workerName: 'Fatou Sow',
        type: 'Diabetes',
        glucose_level: '0.95',
        eatornot: 'Oui',
        didhavethedisease: 'Non',
        flag: 0,
        grade: 'Normal',
        isactive: true,
        registrationdate: new Date('2026-01-17'),
        createdat: new Date('2026-01-17'),
      },
    ];

    this.riskTests.set(riskTestsData);
    this.screeningsHTA.set(screeningsHTAData);
    this.screeningsDiabete.set(screeningsDiabeteData);

    this.filteredRiskTests.set(riskTestsData);
    this.filteredScreeningsHTA.set(screeningsHTAData);
    this.filteredScreeningsDiabete.set(screeningsDiabeteData);

    this.loading.set(false);
  }

  // Risk Tests filters
  applyRiskTestFilters(): void {
    let filtered = [...this.riskTests()];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (rt) =>
          rt.patientName?.toLowerCase().includes(term) ||
          rt.workerName?.toLowerCase().includes(term) ||
          rt.testtype?.toLowerCase().includes(term)
      );
    }

    if (this.selectedRiskLevel) {
      filtered = filtered.filter((rt) => {
        const level = rt.risklevel || 0;
        if (this.selectedRiskLevel === 'low') return level <= 2;
        if (this.selectedRiskLevel === 'moderate') return level >= 3 && level <= 4;
        if (this.selectedRiskLevel === 'high') return level >= 5;
        return true;
      });
    }

    this.filteredRiskTests.set(filtered);
  }

  // HTA filters
  applyHTAFilters(): void {
    let filtered = [...this.screeningsHTA()];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.patientName?.toLowerCase().includes(term) ||
          s.workerName?.toLowerCase().includes(term)
      );
    }

    if (this.selectedHTAGrade) {
      filtered = filtered.filter((s) => {
        if (this.selectedHTAGrade === 'normal') return s.flag === 0;
        if (this.selectedHTAGrade === 'elevated') return s.flag === 2;
        return true;
      });
    }

    this.filteredScreeningsHTA.set(filtered);
  }

  // Diabete filters
  applyDiabeteFilters(): void {
    let filtered = [...this.screeningsDiabete()];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.patientName?.toLowerCase().includes(term) ||
          s.workerName?.toLowerCase().includes(term)
      );
    }

    if (this.selectedDiabeteGrade) {
      filtered = filtered.filter((s) => {
        if (this.selectedDiabeteGrade === 'normal') return s.flag === 0;
        if (this.selectedDiabeteGrade === 'elevated') return s.flag === 2;
        return true;
      });
    }

    this.filteredScreeningsDiabete.set(filtered);
  }

  onSearchRiskTests(): void {
    this.applyRiskTestFilters();
  }

  onSearchHTA(): void {
    this.applyHTAFilters();
  }

  onSearchDiabete(): void {
    this.applyDiabeteFilters();
  }

  resetRiskTestFilters(): void {
    this.searchTerm = '';
    this.selectedRiskLevel = null;
    this.filteredRiskTests.set(this.riskTests());
  }

  resetHTAFilters(): void {
    this.searchTerm = '';
    this.selectedHTAGrade = null;
    this.filteredScreeningsHTA.set(this.screeningsHTA());
  }

  resetDiabeteFilters(): void {
    this.searchTerm = '';
    this.selectedDiabeteGrade = null;
    this.filteredScreeningsDiabete.set(this.screeningsDiabete());
  }

  // Modal methods
  viewRiskTest(riskTest: RiskTestWithPatient): void {
    this.selectedRiskTest = riskTest;
    this.showRiskTestModal = true;
  }

  closeRiskTestModal(): void {
    this.showRiskTestModal = false;
    this.selectedRiskTest = null;
  }

  viewScreeningHTA(screening: ScreeningHTAWithPatient): void {
    this.selectedScreeningHTA = screening;
    this.showHTAModal = true;
  }

  closeHTAModal(): void {
    this.showHTAModal = false;
    this.selectedScreeningHTA = null;
  }

  viewScreeningDiabete(screening: ScreeningDiabeteWithPatient): void {
    this.selectedScreeningDiabete = screening;
    this.showDiabeteModal = true;
  }

  closeDiabeteModal(): void {
    this.showDiabeteModal = false;
    this.selectedScreeningDiabete = null;
  }

  // Helpers
  getRiskLevelSeverity(level: number | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    if (!level) return 'secondary';
    if (level <= 2) return 'success';
    if (level <= 4) return 'warn';
    return 'danger';
  }

  getRiskLevelLabel(level: number | undefined): string {
    if (!level) return 'N/A';
    if (level <= 2) return 'Faible';
    if (level <= 4) return 'Modéré';
    return 'Élevé';
  }

  getHTASeverity(flag: number | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    if (flag === undefined) return 'secondary';
    return flag === 0 ? 'success' : 'danger';
  }

  getDiabeteSeverity(flag: number | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    if (flag === undefined) return 'secondary';
    return flag === 0 ? 'success' : 'danger';
  }

  parseRiskFactors(testresult: string | undefined): { label: string; value: boolean }[] {
    if (!testresult) return [];
    try {
      const factors = JSON.parse(testresult);
      const labels: Record<string, string> = {
        age45Plus: 'Âge > 45 ans',
        familyHistory: 'Antécédents familiaux',
        obesity: 'Obésité',
        smoking: 'Tabagisme',
        sedentary: 'Sédentarité',
        hypertension: 'Hypertension',
      };
      return Object.entries(factors).map(([key, value]) => ({
        label: labels[key] || key,
        value: value as boolean,
      }));
    } catch {
      return [];
    }
  }

  getPatientInitials(name: string | undefined): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.charAt(0);
  }

  // Stats
  getRiskTestsCount(): number {
    return this.riskTests().length;
  }

  getHighRiskCount(): number {
    return this.riskTests().filter((rt) => (rt.risklevel || 0) >= 5).length;
  }

  getHTACount(): number {
    return this.screeningsHTA().length;
  }

  getHTAElevatedCount(): number {
    return this.screeningsHTA().filter((s) => s.flag === 2).length;
  }

  getDiabeteCount(): number {
    return this.screeningsDiabete().length;
  }

  getDiabeteElevatedCount(): number {
    return this.screeningsDiabete().filter((s) => s.flag === 2).length;
  }

  getTotalScreenings(): number {
    return this.getRiskTestsCount() + this.getHTACount() + this.getDiabeteCount();
  }
}

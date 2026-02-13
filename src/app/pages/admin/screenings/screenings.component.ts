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

import { RiskTest, ScreeningHTA, ScreeningDiabete, PreScreeningAnswer, Awareness } from '@core/models/household';
import { DirectusService } from '@core/services/directus.service';
import { readItems } from '@directus/sdk';

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
  preScreenings = signal<PreScreeningAnswer[]>([]);
  awarenessData = signal<Awareness[]>([]);
  screeningsHTA = signal<ScreeningHTAWithPatient[]>([]);
  screeningsDiabete = signal<ScreeningDiabeteWithPatient[]>([]);

  // Deprecated - keep for compatibility during transition
  riskTests = signal<RiskTestWithPatient[]>([]);

  // Filtered data
  filteredPreScreenings = signal<PreScreeningAnswer[]>([]);
  filteredAwareness = signal<Awareness[]>([]);
  filteredRiskTests = signal<RiskTestWithPatient[]>([]);
  filteredScreeningsHTA = signal<ScreeningHTAWithPatient[]>([]);
  filteredScreeningsDiabete = signal<ScreeningDiabeteWithPatient[]>([]);

  // Search & filters
  searchTerm = '';
  selectedRiskLevel: string | null = null;
  selectedAwarenessLevel: string | null = null;
  selectedHTAGrade: string | null = null;
  selectedDiabeteGrade: string | null = null;
  constructor(private readonly directusService: DirectusService) {}


  // Loading
  loading = signal(false);

  // Modals
  showPreScreeningModal = false;
  showAwarenessModal = false;
  showRiskTestModal = false; // Deprecated - keep for compatibility
  showHTAModal = false;
  showDiabeteModal = false;

  selectedPreScreening: PreScreeningAnswer | null = null;
  selectedAwareness: Awareness | null = null;
  selectedRiskTest: RiskTestWithPatient | null = null; // Deprecated
  selectedScreeningHTA: ScreeningHTAWithPatient | null = null;
  selectedScreeningDiabete: ScreeningDiabeteWithPatient | null = null;

  // Options
  riskLevelOptions = [
    { label: 'Faible (0-2)', value: 'low' },
    { label: 'Modéré (3-4)', value: 'moderate' },
    { label: 'Élevé (5+)', value: 'high' },
  ];

  awarenessLevelOptions = [
    { label: 'Bas', value: 'bas' },
    { label: 'Moyen', value: 'moyen' },
    { label: 'Bon', value: 'bon' },
  ];

  gradeOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Élevé', value: 'elevated' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const [preScreeningRaw, awarenessRaw, htaRaw, diabeteRaw] = await Promise.all([
        this.directusService.directus.request(
          readItems('prescreeninganswers', {
            fields: [
              '*',
              'householdMemberId.id',
              'householdMemberId.firstname',
              'householdMemberId.lastname',
              'householdMemberId.dateofbirth',
              'householdMemberId.gender',
              'workerId.first_name',
              'workerId.last_name',
            ],
            sort: ['-createdAt'],
          })
        ),
        this.directusService.directus.request(
          readItems('awareness', {
            fields: [
              '*',
              'householdMemberId.id',
              'householdMemberId.firstname',
              'householdMemberId.lastname',
              'householdMemberId.dateofbirth',
              'householdMemberId.gender',
              'workerId.first_name',
              'workerId.last_name',
            ],
            sort: ['-createdAt'],
          })
        ),
        this.directusService.directus.request(
          readItems('screening', {
            filter: { type: { _eq: 'Hypertension' } },
            fields: [
              '*',
              'patientid.id',
              'patientid.firstname',
              'patientid.lastname',
              'patientid.dateofbirth',
              'patientid.gender',
              'workerId.first_name',
              'workerId.last_name',
            ],
            sort: ['-createdat'],
          })
        ),
        this.directusService.directus.request(
          readItems('screeningdiabete', {
            fields: [
              '*',
              'patientid.id',
              'patientid.firstname',
              'patientid.lastname',
              'patientid.dateofbirth',
              'patientid.gender',
              'workerId.first_name',
              'workerId.last_name',
            ],
            sort: ['-createdat'],
          })
        ),
      ]);

      const mapSex = (gender?: string): 'M' | 'F' | undefined => {
        if (!gender) return undefined;
        const g = gender.toLowerCase();
        if (g.startsWith('m') || g.includes('homme')) return 'M';
        if (g.startsWith('f') || g.includes('femme')) return 'F';
        return undefined;
      };

      const calcAge = (dob?: string | Date): number | undefined => {
        if (!dob) return undefined;
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
      };

      // Calculate risk level from prescreening answers
      const calculateRiskLevel = (answers?: any): { level: number; label: string } => {
        if (!answers || typeof answers !== 'object') {
          return { level: 0, label: 'Indéterminé' };
        }

        let score = 0;
        Object.values(answers as Record<string, any>).forEach((value) => {
          if (value === true || value === 'true' || value === 'Oui' || value === 'Yes') {
            score += 1;
          }
        });

        if (score <= 2) return { level: score, label: 'Faible' };
        if (score <= 4) return { level: score, label: 'Modéré' };
        return { level: score, label: 'Élevé' };
      };

      // Calculate awareness knowledge score
      const calculateKnowledgeScore = (awareness: any): { hypertension: number; diabetes: number; overall: 'bas' | 'moyen' | 'bon' } => {
        let htaScore = 0;
        let diabetesScore = 0;

        // HTA Knowledge scoring
        if (awareness.hypertension_knowledge?.includes('savent ce que c\'est') ||
            awareness.hypertension_knowledge?.includes('know what it is')) htaScore += 1;
        if (awareness.hypertension_symptoms?.includes('plus de trois') ||
            awareness.hypertension_symptoms?.includes('more than three')) htaScore += 1;
        if (awareness.hypertension_action?.includes('sais quoi faire') ||
            awareness.hypertension_action?.includes('know what to do')) htaScore += 1;

        // Diabetes Knowledge scoring
        if (awareness.diabetes_knowledge?.includes('sais ce que c\'est') ||
            awareness.diabetes_knowledge?.includes('know what it is')) diabetesScore += 1;
        if (awareness.diabetes_signs?.includes('sais ce que c\'est') ||
            awareness.diabetes_signs?.includes('know what it is')) diabetesScore += 1;
        if (awareness.diabetes_action?.includes('sais quoi faire') ||
            awareness.diabetes_action?.includes('know what to do')) diabetesScore += 1;

        const avgScore = (htaScore + diabetesScore) / 6;
        let overall: 'bas' | 'moyen' | 'bon';
        if (avgScore < 0.33) overall = 'bas';
        else if (avgScore < 0.67) overall = 'moyen';
        else overall = 'bon';

        return { hypertension: htaScore, diabetes: diabetesScore, overall };
      };

      // Map prescreening data
      const preScreeningData: PreScreeningAnswer[] = (preScreeningRaw as any[]).map((ps) => {
        const risk = calculateRiskLevel(ps.answers);
        return {
          ...ps,
          patientName: [ps.householdMemberId?.firstname, ps.householdMemberId?.lastname].filter(Boolean).join(' '),
          patientAge: calcAge(ps.householdMemberId?.dateofbirth),
          patientSex: mapSex(ps.householdMemberId?.gender),
          workerName: [ps.workerId?.first_name, ps.workerId?.last_name].filter(Boolean).join(' '),
          riskLevel: risk.level,
          riskLevelLabel: risk.label,
        };
      });

      // Map awareness data
      const awarenessData: Awareness[] = (awarenessRaw as any[]).map((aw) => {
        const knowledge = calculateKnowledgeScore(aw);
        return {
          ...aw,
          patientName: [aw.householdMemberId?.firstname, aw.householdMemberId?.lastname].filter(Boolean).join(' '),
          patientAge: calcAge(aw.householdMemberId?.dateofbirth),
          patientSex: mapSex(aw.householdMemberId?.gender),
          workerName: [aw.workerId?.first_name, aw.workerId?.last_name].filter(Boolean).join(' '),
          hypertensionKnowledgeScore: knowledge.hypertension,
          diabetesKnowledgeScore: knowledge.diabetes,
          overallKnowledgeLevel: knowledge.overall,
        };
      });

      const screeningsHTAData: ScreeningHTAWithPatient[] = (htaRaw as any[]).map((s) => ({
        ...s,
        patientName: [s.patientid?.firstname, s.patientid?.lastname].filter(Boolean).join(' '),
        patientAge: calcAge(s.patientid?.dateofbirth),
        patientSex: mapSex(s.patientid?.gender),
        workerName: [s.workerId?.first_name, s.workerId?.last_name].filter(Boolean).join(' '),
      }));

      const screeningsDiabeteData: ScreeningDiabeteWithPatient[] = (diabeteRaw as any[]).map((s) => ({
        ...s,
        patientName: [s.patientid?.firstname, s.patientid?.lastname].filter(Boolean).join(' '),
        patientAge: calcAge(s.patientid?.dateofbirth),
        patientSex: mapSex(s.patientid?.gender),
        workerName: [s.workerId?.first_name, s.workerId?.last_name].filter(Boolean).join(' '),
      }));

      // Set new data
      this.preScreenings.set(preScreeningData);
      this.awarenessData.set(awarenessData);
      this.screeningsHTA.set(screeningsHTAData);
      this.screeningsDiabete.set(screeningsDiabeteData);

      // Set filtered data
      this.filteredPreScreenings.set(preScreeningData);
      this.filteredAwareness.set(awarenessData);
      this.filteredScreeningsHTA.set(screeningsHTAData);
      this.filteredScreeningsDiabete.set(screeningsDiabeteData);

      // Keep legacy for compatibility during transition
      this.riskTests.set([]);
      this.filteredRiskTests.set([]);
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error);
    } finally {
      this.loading.set(false);
    }
  }

  // PreScreening filters
  applyPreScreeningFilters(): void {
    let filtered = [...this.preScreenings()];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ps) =>
          ps.patientName?.toLowerCase().includes(term) ||
          ps.workerName?.toLowerCase().includes(term) ||
          ps.disease?.toLowerCase().includes(term)
      );
    }

    if (this.selectedRiskLevel) {
      filtered = filtered.filter((ps) => {
        const level = ps.riskLevel || 0;
        if (this.selectedRiskLevel === 'low') return level <= 2;
        if (this.selectedRiskLevel === 'moderate') return level >= 3 && level <= 4;
        if (this.selectedRiskLevel === 'high') return level >= 5;
        return true;
      });
    }

    this.filteredPreScreenings.set(filtered);
  }

  // Awareness filters
  applyAwarenessFilters(): void {
    let filtered = [...this.awarenessData()];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (aw) =>
          aw.patientName?.toLowerCase().includes(term) ||
          aw.workerName?.toLowerCase().includes(term)
      );
    }

    if (this.selectedAwarenessLevel) {
      filtered = filtered.filter((aw) => {
        return aw.overallKnowledgeLevel === this.selectedAwarenessLevel;
      });
    }

    this.filteredAwareness.set(filtered);
  }

  // Risk Tests filters (deprecated but kept for compatibility)
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

  onSearchPreScreenings(): void {
    this.applyPreScreeningFilters();
  }

  onSearchAwareness(): void {
    this.applyAwarenessFilters();
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

  resetPreScreeningFilters(): void {
    this.searchTerm = '';
    this.selectedRiskLevel = null;
    this.filteredPreScreenings.set(this.preScreenings());
  }

  resetAwarenessFilters(): void {
    this.searchTerm = '';
    this.selectedAwarenessLevel = null;
    this.filteredAwareness.set(this.awarenessData());
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
  viewPreScreening(preScreening: PreScreeningAnswer): void {
    this.selectedPreScreening = preScreening;
    this.showPreScreeningModal = true;
  }

  closePreScreeningModal(): void {
    this.showPreScreeningModal = false;
    this.selectedPreScreening = null;
  }

  viewAwareness(awareness: Awareness): void {
    this.selectedAwareness = awareness;
    this.showAwarenessModal = true;
  }

  closeAwarenessModal(): void {
    this.showAwarenessModal = false;
    this.selectedAwareness = null;
  }

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

  // Parse prescreening answers from JSON
  parsePreScreeningAnswers(answers: any): { label: string; value: boolean }[] {
    if (!answers || typeof answers !== 'object') return [];

    const labels: Record<string, string> = {
      age45Plus: 'Âge > 45 ans',
      familyHistory: 'Antécédents familiaux',
      obesity: 'Obésité',
      smoking: 'Tabagisme',
      sedentary: 'Sédentarité',
      hypertension: 'Hypertension',
      diabetes: 'Diabète',
      highCholesterol: 'Cholestérol élevé',
      heartDisease: 'Maladie cardiaque',
      stroke: 'AVC',
      physicalInactivity: 'Inactivité physique',
      poorDiet: 'Alimentation déséquilibrée',
    };

    return Object.entries(answers).map(([key, value]) => ({
      label: labels[key] || key,
      value: value === true || value === 'true' || value === 'Oui' || value === 'Yes',
    }));
  }

  // Get awareness level severity
  getAwarenessLevelSeverity(level: string | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (level) {
      case 'bon': return 'success';
      case 'moyen': return 'warn';
      case 'bas': return 'danger';
      default: return 'secondary';
    }
  }

  // Get awareness level label
  getAwarenessLevelLabel(level: string | undefined): string {
    switch (level) {
      case 'bon': return 'Bonne connaissance';
      case 'moyen': return 'Connaissance moyenne';
      case 'bas': return 'Connaissance faible';
      default: return 'Indéterminée';
    }
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
  getPreScreeningsCount(): number {
    return this.preScreenings().length;
  }

  getPreScreeningHighRiskCount(): number {
    return this.preScreenings().filter((ps) => (ps.riskLevel || 0) >= 5).length;
  }

  getAwarenessCount(): number {
    return this.awarenessData().length;
  }

  getGoodAwarenessCount(): number {
    return this.awarenessData().filter((aw) => aw.overallKnowledgeLevel === 'bon').length;
  }

  // Legacy methods for compatibility
  getRiskTestsCount(): number {
    return this.getPreScreeningsCount(); // Use prescreening data
  }

  getHighRiskCount(): number {
    return this.getPreScreeningHighRiskCount(); // Use prescreening data
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
    return this.getPreScreeningsCount() + this.getAwarenessCount() + this.getHTACount() + this.getDiabeteCount();
  }
}

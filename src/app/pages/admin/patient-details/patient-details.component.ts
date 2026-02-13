import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { TabsModule } from 'primeng/tabs';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import {
  HouseholdMember,
  RiskTest,
  ScreeningHTA,
  ScreeningDiabete,
  PatientReference,
  Following,
  Awareness,
  PreScreeningAnswer,
} from '@core/models/household';
import { DirectusService } from '@core/services/directus.service';
import { AuthService, User } from '@core/services/auth.service';
import { readItem, readItems, readUsers, createItem } from '@directus/sdk';

@Component({
  selector: 'app-patient-details',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    TabsModule,
    TimelineModule,
    TooltipModule,
    DividerModule,
    ChartModule,
    AvatarModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    Select,
    DatePicker,
  ],
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss',
})
export class PatientDetailsComponent implements OnInit {
  loading = false;
  member: HouseholdMember | null = null;

  chartData: any;
  chartOptions: any;

  // Modal states
  showReferenceDetailModal = false;
  showFollowingDetailModal = false;
  showNewFollowingModal = false;
  showPreScreeningModal = false;
  showHTAModal = false;
  showDiabeteModal = false;

  // Selected items for modals
  selectedReference: PatientReference | null = null;
  selectedFollowing: Following | null = null;
  selectedPreScreening: PreScreeningAnswer | null = null;
  selectedScreeningHTA: ScreeningHTA | null = null;
  selectedScreeningDiabete: ScreeningDiabete | null = null;

  // Form data for new following
  newFollowingForm: Partial<Following> = {
    type: '',
    daterefered: new Date(),
    referedwhere: '',
    referedby: '',
    workerIdReferedTo: '',
    patientattended: '',
    patientreceivcare: '',
    whydidnotattd: '',
    whydidnotreceivcare: '',
    refReason: '',
    refType: '',
    appointment_date: new Date(),
    refPreviousActions: '',
    proposedTreatment: '',
  };

  // Options for dropdowns
  followingTypeOptions = [
    { label: 'Référence au Médecin', value: 'REFERAL_TO_DOCTOR' },
    { label: 'Contre-référence à l\'ACS', value: 'COUNTER_REFERAL_TO_AC' },
    { label: 'Contre-référence à l\'ICP', value: 'COUNTER_REFERAL_TO_ICP' },
  ];

  attendanceOptions = [
    { label: 'Oui', value: 'Oui' },
    { label: 'Non', value: 'Non' },
  ];

  careReceivedOptions = [
    { label: 'Oui', value: 'Oui' },
    { label: 'Non', value: 'Non' },
  ];

  referalTypeOptions = [
    { label: 'Téléconsultation', value: 'TELECONSULTATION' },
    { label: 'Référence en personne', value: 'IN_PERSON' },
  ];

  treatmentProposedOptions = [
    { label: 'Amlodipine 10mg', value: 'Amlodipine 10mg' },
    { label: 'Metformin 850mg', value: 'Metformin 850mg' },
    { label: 'Metformin 1000mg', value: 'Metformin 1000mg' },
    { label: 'Autre', value: 'OTHER' },
  ];

  nonAttendanceReasons = [
    { label: 'Problème de transport', value: 'Problème de transport' },
    { label: 'Problème financier', value: 'Problème financier' },
    { label: 'Occupation professionnelle', value: 'Occupation professionnelle' },
    { label: 'Maladie', value: 'Maladie' },
    { label: 'Oubli', value: 'Oubli' },
    { label: 'Autre', value: 'Autre' },
  ];

  noCareReasons = [
    { label: 'Médicaments indisponibles', value: 'Médicaments indisponibles' },
    { label: 'Personnel absent', value: 'Personnel absent' },
    { label: "Longue file d'attente", value: "Longue file d'attente" },
    { label: 'Problème financier', value: 'Problème financier' },
    { label: 'Référé ailleurs', value: 'Référé ailleurs' },
    { label: 'Autre', value: 'Autre' },
  ];

  referalReasons = [
    { label: 'Hypertension non contrôlée', value: 'UNCONTROLLED_HTA' },
    { label: 'Diabète non contrôlé', value: 'UNCONTROLLED_DIABETES' },
    { label: 'Complications', value: 'COMPLICATIONS' },
    { label: 'Urgence médicale', value: 'MEDICAL_EMERGENCY' },
    { label: 'Diagnostic difficile', value: 'DIFFICULT_DIAGNOSIS' },
    { label: 'Autre', value: 'OTHER' },
  ];

  // Liste des workers pour le select
  doctors: { label: string; value: string }[] = [];
  workers: { label: string; value: string }[] = [];
  currentUser: User | null = null;
  savingFollowing = false;

  // Track selected treatments
  selectedTreatments: string[] = [];

  // Awareness modal state
  showNewAwarenessModal = false;
  savingAwareness = false;

  // New awareness form
  newAwarenessForm: Partial<Awareness> = {
    registrationDate: new Date(),
    hypertension_knowledge: '',
    hypertension_symptoms: '',
    hypertension_action: '',
    diabetes_knowledge: '',
    diabetes_signs: '',
    diabetes_action: '',
  };

  // Options for awareness dropdowns
  hypertensionKnowledgeOptions = [
    { label: 'Oui, ils savent ce que c\'est', value: 'Oui, ils savent ce que c\'est' },
    { label: 'Oui, ils en savent un peu', value: 'Oui, ils en savent un peu' },
    { label: 'Non, ils ne savent rien', value: 'Non, ils ne savent rien' },
  ];

  hypertensionSymptomsOptions = [
    { label: 'Oui, ils peuvent fournir plus de trois symptômes', value: 'Oui, ils peuvent fournir plus de trois symptômes' },
    { label: 'Oui, ils peuvent fournir un à trois symptômes', value: 'Oui, ils peuvent fournir un à trois symptômes' },
    { label: 'Non, ils ne peuvent fournir aucun symptôme', value: 'Non, ils ne peuvent fournir aucun symptôme' },
  ];

  actionKnowledgeOptions = [
    { label: 'Oui, je sais quoi faire (contacter un agent de santé)', value: 'Oui, je sais quoi faire (contacter un agent de santé)' },
    { label: 'Non, je ne sais pas', value: 'Non, je ne sais pas' },
  ];

  diabetesKnowledgeOptions = [
    { label: 'Oui, je sais ce que c\'est', value: 'Oui, je sais ce que c\'est' },
    { label: 'Oui, j\'en sais un peu', value: 'Oui, j\'en sais un peu' },
    { label: 'Non, je ne sais rien', value: 'Non, je ne sais rien' },
  ];

  diabetesSignsOptions = [
    { label: 'Oui, je sais ce que c\'est', value: 'Oui, je sais ce que c\'est' },
    { label: 'Oui, j\'en sais un peu', value: 'Oui, j\'en sais un peu' },
    { label: 'Non, je ne sais rien', value: 'Non, je ne sais rien' },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly directusService: DirectusService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMember();
    this.loadWorkers();
    this.loadDoctors();
    this.initChart();

    // Récupérer l'utilisateur connecté
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  async loadWorkers() {
    try {
      const users = (await this.directusService.directus.request(
        readUsers({
          fields: ['id', 'first_name', 'last_name', 'role.code'],
          filter: { status: { _eq: 'active' } },
        })
      )) as { id: string; first_name: string; last_name: string }[];

      this.workers = users.map((user) => ({
        label: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.id,
        value: user.id,
      }));
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erreur lors du chargement des workers:', error);
    }
  }

  async loadDoctors() {
    try {
      const users = (await this.directusService.directus.request(
        readUsers({
          fields: ['id', 'first_name', 'last_name', 'role.code'],
          filter: {
            status: { _eq: 'active' },
            role: { code: { _eq: 'MEDECIN' } },
          },
        })
      )) as { id: string; first_name: string; last_name: string }[];

      this.doctors = users.map((user) => ({
        label: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.id,
        value: user.id,
      }));
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
    }
  }

  async loadMember() {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading = false;
      return;
    }

    try {
      // Charger le membre depuis Directus
      const memberData = (await this.directusService.directus.request(
        readItem('householdmember', id, {
          fields: [
            '*',
            'householdid.*',
            'workerId.id',
            'workerId.first_name',
            'workerId.last_name',
            'workerId.phone_number',
          ],
        })
      )) as HouseholdMember;

      // Mapper les données
      this.member = this.mapMember(memberData);

      // Charger les données associées en parallèle
      await Promise.all([
        this.loadRiskTests(id),
        this.loadScreeningsHTA(id),
        this.loadScreeningsDiabete(id),
        this.loadReferences(id),
        this.loadAwarenessRecords(id),
      ]);

      console.log('Membre chargé:', this.member);
    } catch (error) {
      console.error('Erreur lors du chargement du membre:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Forcer la détection de changements
    }
  }

  /**
   * Mappe les données brutes de Directus vers le format attendu par le template
   */
  mapMember(raw: HouseholdMember): HouseholdMember {
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
      assignedWorkerName =
        [worker.first_name, worker.last_name].filter(Boolean).join(' ') || undefined;
      assignedWorkerPhone = worker.phone_number;
    }

    // Déterminer le lien avec le chef de ménage
    let relationshipToHead = 'Membre';
    if (raw.isheadofhousehold) {
      relationshipToHead = 'Chef de ménage';
    }

    const mapped: HouseholdMember = {
      ...raw,
    };

    if (age !== undefined) mapped.age = age;
    if (sex !== undefined) mapped.sex = sex;
    if (assignedWorkerName) mapped.assignedWorkerName = assignedWorkerName;
    if (assignedWorkerPhone) mapped.assignedWorkerPhone = assignedWorkerPhone;
    mapped.relationshipToHead = relationshipToHead;

    return mapped;
  }

  async loadRiskTests(patientId: string) {
    try {
      const riskTests = (await this.directusService.directus.request(
        readItems('risktest', {
          filter: { patientid: { _eq: patientId } },
          sort: ['-createdat'],
          fields: ['*'],
        })
      )) as RiskTest[];

      if (this.member) {
        this.member.riskTests = riskTests;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prédépistages:', error);
    }
  }

  async loadScreeningsHTA(patientId: string) {
    try {
      const screenings = (await this.directusService.directus.request(
        readItems('screening', {
          filter: {
            patientid: { _eq: patientId },
            type: { _eq: 'Hypertension' },
          },
          sort: ['-createdat'],
          fields: [
            '*',
          ],
        })
      )) as ScreeningHTA[];

      if (this.member) {
        this.member.screeningsHTA = screenings;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dépistages HTA:', error);
    }
  }

  async loadScreeningsDiabete(patientId: string) {
    try {
      const screenings = (await this.directusService.directus.request(
        readItems('screeningdiabete', {
          filter: { patientid: { _eq: patientId } },
          sort: ['-createdat'],
          fields: ['*'],
        })
      )) as ScreeningDiabete[];

      if (this.member) {
        this.member.screeningsDiabete = screenings;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dépistages diabète:', error);
    }
  }

  async loadReferences(patientId: string) {
    try {
      const references = (await this.directusService.directus.request(
        readItems('patientreference', {
          filter: { householdmemberid: { _eq: patientId } },
          sort: ['-createdat'],
          fields: ['*,workerId.first_name, workerId.last_name,workerId.id'],
        })
      )) as PatientReference[];

      // Charger les suivis pour chaque référence
      for (const ref of references) {
        const followings = (await this.directusService.directus.request(
          readItems('following', {
            filter: { patientReferenceId: { _eq: ref.id } },
            sort: ['-createdat'],
            fields: ['*,referedby.first_name, referedby.last_name, referedby.id,workerIdReferedTo.id,workerIdReferedTo.first_name,workerIdReferedTo.last_name, patientId.first_name, patientId.last_name, patientId.id'],
          })
        )) as Following[];
        ref.followings = followings;
      }

      if (this.member) {
        this.member.references = references;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des références:', error);
    }
  }

  async loadAwarenessRecords(patientId: string) {
    try {
      const awarenessRecords = (await this.directusService.directus.request(
        readItems('awareness', {
          filter: { householdMemberId: { _eq: patientId } },
          sort: ['-createdAt'],
          fields: ['*', 'workerId.first_name', 'workerId.last_name', 'workerId.id'],
        })
      )) as Awareness[];

      if (this.member) {
        this.member.awarenessRecords = awarenessRecords;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des enregistrements de sensibilisation:', error);
    }
  }

  // Helper pour obtenir le nom complet du patient
  getMemberFullName(): string {
    if (!this.member) return '';
    return [this.member.firstname, this.member.lastname].filter(Boolean).join(' ');
  }

  // Helper pour obtenir les initiales
  getMemberInitials(): string {
    const first = this.member?.firstname?.charAt(0) || '';
    const last = this.member?.lastname?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  // Helper pour obtenir l'âge du membre
  getAge(): number | undefined {
    return this.member?.age;
  }

  initChart() {
    this.chartData = {
      labels: ['Juin', 'Juillet', 'Août', 'Sept', 'Oct', 'Nov', 'Déc', 'Jan'],
      datasets: [
        {
          label: 'Tension Systolique',
          data: [150, 148, 145, 142, 140, 138, 142, 145],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Tension Diastolique',
          data: [95, 92, 90, 88, 85, 82, 88, 92],
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Glycémie (g/L)',
          data: [1.45, 1.42, 1.38, 1.35, 1.32, 1.28, 1.3, 1.35],
          borderColor: '#eab308',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Tension (mmHg)',
          },
        },
        y1: {
          beginAtZero: false,
          position: 'right',
          title: {
            display: true,
            text: 'Glycémie (g/L)',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };
  }

  editMember() {
    console.log('Modifier le membre:', this.member?.id);
  }

  newScreening() {
    console.log('Nouveau dépistage pour:', this.member?.id);
  }

  getStatusLabel(status: string | undefined): string {
    const labels: Record<string, string> = {
      actif: 'Actif',
      stable: 'Stable',
      risque: 'À Risque',
      urgent: 'Urgent',
    };
    return status ? labels[status] : 'Actif';
  }

  getStatusSeverity(
    status: string | undefined
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      stable: 'success',
      actif: 'info',
      risque: 'warn',
      urgent: 'danger',
    };
    return status ? severities[status] : 'info';
  }

  getRoleLabel(role: string | undefined): string {
    if (!role) return '';
    const labels: Record<string, string> = {
      ACS: 'Agent de Santé Communautaire',
      ICP: 'Infirmier de Santé Publique',
      SAGE_FEMME: 'Sage-femme',
      MEDECIN: 'Médecin',
      MAJOR: 'Major',
    };
    return labels[role] || role;
  }

  getRiskLevelLabel(level: string | undefined): string {
    if (!level) return '';
    const labels: Record<string, string> = {
      faible: 'Faible',
      modere: 'Modéré',
      eleve: 'Élevé',
    };
    return labels[level] || level;
  }

  getRiskLevelSeverity(
    level: string | undefined
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      faible: 'success',
      modere: 'warn',
      eleve: 'danger',
    };
    return level ? severities[level] : 'info';
  }

  // Helper pour déterminer le niveau de risque basé sur le score numérique
  getRiskLevelFromScore(score: number | undefined): string {
    if (score === undefined) return '—';
    if (score < 7) return 'Faible';
    if (score < 15) return 'Modéré';
    return 'Élevé';
  }

  // Helper pour déterminer la sévérité basée sur le score numérique
  getRiskSeverityFromScore(score: number | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    if (score === undefined) return 'secondary';
    if (score < 7) return 'success';
    if (score < 15) return 'warn';
    return 'danger';
  }

  // Helper pour formater le résultat du test (JSON-like string)
  formatTestResult(testresult: string | undefined): string {
    if (!testresult) return '—';
    // Extraire quelques facteurs clés pour l'affichage
    const factors: string[] = [];
    if (testresult.includes('smoking=Yes')) factors.push('Fumeur');
    if (testresult.includes('physical_activity=No')) factors.push('Sédentaire');
    if (testresult.includes('family_history=Yes')) factors.push('Antécédents familiaux');
    if (testresult.includes('hypertension=Yes')) factors.push('HTA');
    if (testresult.includes('diabete=Yes') || testresult.includes('high_blood_sugar=Yes'))
      factors.push('Diabète/Glycémie');
    if (testresult.includes('bmi=More than 30') || testresult.includes('bmi=More than 40'))
      factors.push('Obésité');
    return factors.length > 0 ? factors.join(', ') : testresult.substring(0, 50) + '...';
  }

  viewRiskTest(riskTest: RiskTest) {
    console.log('Voir détails du prédépistage:', riskTest.id);
  }

  getTotalScreenings(): number {
    const hta = this.member?.screeningsHTA?.length || 0;
    const diabete = this.member?.screeningsDiabete?.length || 0;
    return hta + diabete;
  }

  // Helper pour obtenir la dernière tension artérielle moyenne
  getLastBloodPressure(): string {
    const lastHTA = this.member?.screeningsHTA?.[0];
    if (lastHTA?.sys_avarage && lastHTA?.dias_avarage) {
      return `${lastHTA.sys_avarage}/${lastHTA.dias_avarage}`;
    }
    return this.member?.lastBloodPressure || '—';
  }

  // Helper pour obtenir la dernière glycémie
  getLastGlycemia(): string {
    const lastDiabete = this.member?.screeningsDiabete?.[0];
    if (lastDiabete?.glucose_level) {
      return `${lastDiabete.glucose_level} g/L`;
    }
    return this.member?.lastGlycemia ? `${this.member.lastGlycemia} g/L` : '—';
  }

  // Helper pour déterminer si le flag indique un risque élevé
  getFlagSeverity(flag: number | undefined): 'success' | 'warn' | 'danger' {
    if (flag === undefined || flag === 0) {
      return 'success';
    }
    if (flag === 2) {
      return 'danger';
    }
    return 'warn';
  }

  // ===== Méthodes pour les références et suivis =====

  viewReference(reference: PatientReference) {
    this.selectedReference = reference;
    this.showReferenceDetailModal = true;
  }

  closeReferenceDetailModal() {
    this.showReferenceDetailModal = false;
    this.selectedReference = null;
  }

  viewFollowing(following: Following) {
    this.selectedFollowing = following;
    this.showFollowingDetailModal = true;
  }

  closeFollowingDetailModal() {
    this.showFollowingDetailModal = false;
    this.selectedFollowing = null;
  }

  // Ouvrir la modal pour ajouter un suivi à une référence
  openNewFollowingModal(reference: PatientReference) {
    this.selectedReference = reference;
    this.newFollowingForm = {
      daterefered: new Date(),
      referedwhere: reference.referedcenter || '',
      referedby: this.currentUser?.id || '', // ID de l'utilisateur connecté
      workerIdReferedTo: '', // Worker qui fera le prochain suivi
      patientattended: '',
      patientreceivcare: '',
      whydidnotattd: '',
      whydidnotreceivcare: '',
    };
    this.showNewFollowingModal = true;
  }

  closeNewFollowingModal() {
    this.showNewFollowingModal = false;
    this.selectedReference = null;
    this.resetNewFollowingForm();
  }

  resetNewFollowingForm() {
    this.newFollowingForm = {
      type: '',
      daterefered: new Date(),
      referedwhere: '',
      referedby: '',
      workerIdReferedTo: '',
      patientattended: '',
      patientreceivcare: '',
      whydidnotattd: '',
      whydidnotreceivcare: '',
      refReason: '',
      refType: '',
      appointment_date: new Date(),
      refPreviousActions: '',
      proposedTreatment: '',
    };
    this.selectedTreatments = [];
  }

  async saveNewFollowing() {
    if (!this.selectedReference || !this.member || this.savingFollowing) return;

    // Validation
    if (!this.newFollowingForm.type) {
      console.error('Type de suivi requis');
      return;
    }

    if (this.newFollowingForm.type === 'REFERAL_TO_DOCTOR') {
      if (!this.newFollowingForm.workerIdReferedTo || !this.newFollowingForm.refReason || !this.newFollowingForm.refType || !this.newFollowingForm.appointment_date) {
        console.error('Tous les champs requis pour la référence au médecin');
        return;
      }
    }

    if (this.newFollowingForm.type === 'COUNTER_REFERAL_TO_AC') {
      if (this.selectedTreatments.length === 0 || !this.newFollowingForm.appointment_date) {
        console.error('Sélectionnez au moins un traitement et une date de rendez-vous');
        return;
      }
    }

    if (this.newFollowingForm.type === 'COUNTER_REFERAL_TO_ICP') {
      if (!this.newFollowingForm.proposedTreatment) {
        console.error('Le traitement proposé est requis');
        return;
      }
    }

    this.savingFollowing = true;

    // Extraire l'ID du worker assigné au patient
    let memberWorkerId = '';
    if (this.member.workerId) {
      if (typeof this.member.workerId === 'string') {
        memberWorkerId = this.member.workerId;
      } else if (typeof this.member.workerId === 'object') {
        memberWorkerId = this.member.workerId.id;
      }
    }

    try {
      // Créer le nouveau suivi dans Directus
      const followingData = {
        patientid: this.member.id,
        patientReferenceId: this.selectedReference.id || '',
        workerId: memberWorkerId || null,
        workerIdReferedTo: this.newFollowingForm.workerIdReferedTo || null,
        status: true,
        daterefered: this.newFollowingForm.daterefered || new Date(),
        type: this.newFollowingForm.type,
        referedwhere: this.newFollowingForm.referedwhere || '',
        referedby: this.currentUser?.id || '',
        refReason: this.newFollowingForm.refReason || null,
        refType: this.newFollowingForm.refType || null,
        appointment_date: this.newFollowingForm.appointment_date || null,
        refPreviousActions: this.newFollowingForm.refPreviousActions || null,
        proposedTreatment: this.newFollowingForm.proposedTreatment || null,
        patientattended: this.newFollowingForm.patientattended || '',
        patientreceivcare: this.newFollowingForm.patientreceivcare || '',
        whydidnotattd: this.newFollowingForm.whydidnotattd || '',
        whydidnotreceivcare: this.newFollowingForm.whydidnotreceivcare || '',
      };

      const newFollowing = (await this.directusService.directus.request(
        createItem('following', followingData)
      )) as Following;

      console.log('Nouveau suivi créé:', newFollowing);

      // Ajouter le suivi à la liste locale
      this.selectedReference.followings ??= [];
      this.selectedReference.followings.unshift(newFollowing);

      // Mettre à jour le statut de la référence si nécessaire
      if (
        this.newFollowingForm.patientattended === 'Oui' &&
        this.newFollowingForm.patientreceivcare
      ) {
        this.selectedReference.status = 'Complété';
      } else if (this.newFollowingForm.patientattended === 'Oui') {
        this.selectedReference.status = 'En cours';
      }

      this.closeNewFollowingModal();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erreur lors de la création du suivi:', error);
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      this.savingFollowing = false;
      this.cdr.detectChanges();
    }
  }

  // Vérifier si le formulaire est valide
  isNewFollowingFormValid(): boolean {
    const type = this.newFollowingForm.type;

    if (!type) return false;

    if (type === 'REFERAL_TO_DOCTOR') {
      return !!(
        this.newFollowingForm.workerIdReferedTo &&
        this.newFollowingForm.refReason &&
        this.newFollowingForm.refType &&
        this.newFollowingForm.appointment_date
      );
    }

    if (type === 'COUNTER_REFERAL_TO_AC') {
      return this.selectedTreatments.length > 0 && !!this.newFollowingForm.appointment_date;
    }

    if (type === 'COUNTER_REFERAL_TO_ICP') {
      return !!this.newFollowingForm.proposedTreatment;
    }

    return false;
  }

  // Déterminer si un champ doit être affiché basé sur le type de suivi
  showFieldForFollowingType(fieldName: string): boolean {
    const type = this.newFollowingForm.type;

    if (type === 'REFERAL_TO_DOCTOR') {
      return ['workerIdReferedTo', 'refReason', 'refType', 'appointment_date', 'refPreviousActions'].includes(fieldName);
    }

    if (type === 'COUNTER_REFERAL_TO_AC') {
      return ['proposedTreatment', 'appointment_date'].includes(fieldName);
    }

    if (type === 'COUNTER_REFERAL_TO_ICP') {
      return ['proposedTreatment'].includes(fieldName);
    }

    return false;
  }

  onTreatmentSelectionChange(treatment: string) {
    const index = this.selectedTreatments.indexOf(treatment);
    if (index > -1) {
      this.selectedTreatments.splice(index, 1);
    } else {
      this.selectedTreatments.push(treatment);
    }
    this.updateProposedTreatment();
  }

  updateProposedTreatment() {
    if (this.newFollowingForm.type === 'COUNTER_REFERAL_TO_AC') {
      this.newFollowingForm.proposedTreatment = this.selectedTreatments.join(', ');
    }
  }

  isTreatmentSelected(treatment: string): boolean {
    return this.selectedTreatments.includes(treatment);
  }

  newReference() {
    console.log('Nouvelle référence pour:', this.member?.id);
  }

  getTotalReferences(): number {
    return this.member?.references?.length || 0;
  }

  getTotalFollowings(): number {
    let total = 0;
    this.member?.references?.forEach((ref) => {
      total += ref.followings?.length || 0;
    });
    return total;
  }

  getReferenceStatusSeverity(
    status: string | undefined
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (!status) return 'secondary';
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      COMPLETED: 'success',
      PENDING: 'danger',
    };
    return severities[status] || 'secondary';
  }
  getReferenceStatusLabel(status: string | undefined): string {
    if (!status) return 'En attente';
    const labels: Record<string, string> = {
      COMPLETED: 'Complété',
      PENDING: 'En attente',
    };
    return labels[status] || 'En attente';
  }

  getReferenceTypeIcon(type: string | undefined): string {
    if (!type) return 'pi-file';
    const icons: Record<string, string> = {
      URGENT_CALL: 'pi-exclamation-triangle',
      TO_HEALTH_POST: 'pi-clock',
    };
    return icons[type] || 'pi-file';
  }
  getReferenceTypeLabel(type: string | undefined): string {
    if (!type) return 'Poste de santé';
    const labels: Record<string, string> = {
      URGENT_CALL: 'Appel urgent',
      TO_HEALTH_POST: 'Poste de santé',
    };
    return labels[type] || 'Poste de santé';
  }

  getFollowingStatusLabel(attended: string | undefined, receivedCare: string | undefined): string {
    if (attended === 'Oui' && receivedCare) {
      return 'Soins reçus';
    }
    if (attended === 'Oui' && !receivedCare) {
      return 'Présent sans soins';
    }
    if (attended !== 'Oui') {
      return 'Non présenté';
    }
    return 'En attente';
  }

  getFollowingStatusSeverity(
    attended: string | undefined,
    receivedCare: string | undefined
  ): 'success' | 'warn' | 'danger' | 'secondary' {
    if (attended === 'Oui' && receivedCare === 'Oui') {
      return 'success';
    }
    if (attended === 'Oui' && receivedCare !== 'Oui') {
      return 'warn';
    }
    if (attended !== 'Oui') {
      return 'danger';
    }
    return 'secondary';
  }

  // ===== Méthodes pour la sensibilisation =====

  openNewAwarenessModal() {
    this.newAwarenessForm = {
      registrationDate: new Date(),
      hypertension_knowledge: '',
      hypertension_symptoms: '',
      hypertension_action: '',
      diabetes_knowledge: '',
      diabetes_signs: '',
      diabetes_action: '',
    };
    this.showNewAwarenessModal = true;
  }

  closeNewAwarenessModal() {
    this.showNewAwarenessModal = false;
    this.newAwarenessForm = {
      registrationDate: new Date(),
      hypertension_knowledge: '',
      hypertension_symptoms: '',
      hypertension_action: '',
      diabetes_knowledge: '',
      diabetes_signs: '',
      diabetes_action: '',
    };
  }

  async saveNewAwareness() {
    if (!this.member || this.savingAwareness) return;

    this.savingAwareness = true;

    try {
      const awarenessData = {
        householdMemberId: this.member.id,
        workerId: this.currentUser?.id || null,
        registrationDate: this.newAwarenessForm.registrationDate || new Date(),
        hypertension_knowledge: this.newAwarenessForm.hypertension_knowledge || '',
        hypertension_symptoms: this.newAwarenessForm.hypertension_symptoms || '',
        hypertension_action: this.newAwarenessForm.hypertension_action || '',
        diabetes_knowledge: this.newAwarenessForm.diabetes_knowledge || '',
        diabetes_signs: this.newAwarenessForm.diabetes_signs || '',
        diabetes_action: this.newAwarenessForm.diabetes_action || '',
      };

      const newAwareness = (await this.directusService.directus.request(
        createItem('awareness', awarenessData)
      )) as Awareness;

      console.log('Nouvel enregistrement de sensibilisation créé:', newAwareness);

      // Ajouter l'enregistrement à la liste locale
      this.member.awarenessRecords ??= [];
      this.member.awarenessRecords.unshift(newAwareness);

      this.closeNewAwarenessModal();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erreur lors de la création de l\'enregistrement de sensibilisation:', error);
    } finally {
      this.savingAwareness = false;
      this.cdr.detectChanges();
    }
  }

  isNewAwarenessFormValid(): boolean {
    return !!(
      this.newAwarenessForm.hypertension_knowledge &&
      this.newAwarenessForm.hypertension_symptoms &&
      this.newAwarenessForm.hypertension_action &&
      this.newAwarenessForm.diabetes_knowledge &&
      this.newAwarenessForm.diabetes_signs &&
      this.newAwarenessForm.diabetes_action
    );
  }

  getAwarenessKnowledgeLevel(awareness: Awareness): { label: string; severity: 'success' | 'warn' | 'danger' } {
    let htaScore = 0;
    let diabetesScore = 0;

    // Score HTA (0-3)
    if (awareness.hypertension_knowledge?.includes('Oui, ils savent')) htaScore++;
    if (awareness.hypertension_symptoms?.includes('plus de trois')) htaScore += 2;
    else if (awareness.hypertension_symptoms?.includes('un à trois')) htaScore += 1;
    if (awareness.hypertension_action?.includes('Oui')) htaScore++;

    // Score Diabète (0-3)
    if (awareness.diabetes_knowledge?.includes('Oui, je sais ce que')) diabetesScore++;
    if (awareness.diabetes_signs?.includes('Oui, je sais ce que')) diabetesScore += 2;
    else if (awareness.diabetes_signs?.includes('Oui, j\'en sais')) diabetesScore += 1;
    if (awareness.diabetes_action?.includes('Oui')) diabetesScore++;

    const totalScore = htaScore + diabetesScore;
    const maxScore = 8;
    const percentage = (totalScore / maxScore) * 100;

    if (percentage >= 75) {
      return { label: 'Excellente connaissance', severity: 'success' };
    } else if (percentage >= 50) {
      return { label: 'Connaissance moyenne', severity: 'warn' };
    } else {
      return { label: 'Connaissance faible', severity: 'danger' };
    }
  }

  // ==================== DETAIL MODAL METHODS ====================

  viewPreScreening(preScreening: PreScreeningAnswer): void {
    this.selectedPreScreening = preScreening;
    this.showPreScreeningModal = true;
  }

  closePreScreeningModal(): void {
    this.showPreScreeningModal = false;
    this.selectedPreScreening = null;
  }

  viewScreeningHTA(screening: ScreeningHTA): void {
    this.selectedScreeningHTA = screening;
    this.showHTAModal = true;
  }

  closeHTAModal(): void {
    this.showHTAModal = false;
    this.selectedScreeningHTA = null;
  }

  viewScreeningDiabete(screening: ScreeningDiabete): void {
    this.selectedScreeningDiabete = screening;
    this.showDiabeteModal = true;
  }

  closeDiabeteModal(): void {
    this.showDiabeteModal = false;
    this.selectedScreeningDiabete = null;
  }

  // ==================== HELPER METHODS ====================

  getRiskLevelSeverityLabel(level: number | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    if (!level) return 'secondary';
    if (level <= 2) return 'success';
    if (level <= 4) return 'warn';
    return 'danger';
  }

  // getRiskLevelLabel(level: number | undefined): string {
  //   if (!level) return 'N/A';
  //   if (level <= 2) return 'Faible';
  //   if (level <= 4) return 'Modéré';
  //   return 'Élevé';
  // }

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
  }}

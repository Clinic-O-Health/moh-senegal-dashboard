
import { Component, OnInit } from '@angular/core';
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
import { HouseholdMember, RiskTest, ScreeningHTA, ScreeningDiabete, PatientReference, Following } from '@core/models/household';

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

  // Selected items for modals
  selectedReference: PatientReference | null = null;
  selectedFollowing: Following | null = null;

  // Form data for new following
  newFollowingForm: Partial<Following> = {
    daterefered: new Date(),
    referedwhere: '',
    referedby: '',
    patientattended: '',
    patientreceivcare: '',
    whydidnotattd: '',
    whydidnotreceivcare: ''
  };

  // Options for dropdowns
  attendanceOptions = [
    { label: 'Oui', value: 'Oui' },
    { label: 'Non', value: 'Non' }
  ];

  careReceivedOptions = [
    { label: 'Oui', value: 'Oui' },
    { label: 'Non', value: 'Non' }
  ];

  nonAttendanceReasons = [
    { label: 'Problème de transport', value: 'Problème de transport' },
    { label: 'Problème financier', value: 'Problème financier' },
    { label: 'Occupation professionnelle', value: 'Occupation professionnelle' },
    { label: 'Maladie', value: 'Maladie' },
    { label: 'Oubli', value: 'Oubli' },
    { label: 'Autre', value: 'Autre' }
  ];

  noCareReasons = [
    { label: 'Médicaments indisponibles', value: 'Médicaments indisponibles' },
    { label: 'Personnel absent', value: 'Personnel absent' },
    { label: 'Longue file d\'attente', value: 'Longue file d\'attente' },
    { label: 'Problème financier', value: 'Problème financier' },
    { label: 'Référé ailleurs', value: 'Référé ailleurs' },
    { label: 'Autre', value: 'Autre' }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadMember();
    this.initChart();
  }

  loadMember() {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    // Simuler le chargement des données
    setTimeout(() => {
      this.member = {
        id: id || '1',
        firstName: 'Moussa',
        lastName: 'Sall',
        age: 58,
        sex: 'M',
        dateOfBirth: new Date('1968-03-15'),
        phoneNumber: '+221 77 123 45 67',
        relationshipToHead: 'Chef de ménage',
        matrimonialStatus: 'Marié',

        householdid: '1',
        pvh: 'Sall Moussa',

        medicalHistory: ['Hypertension', 'Diabète de type 2'],
        allergies: ['Pénicilline'],
        weight: 78,
        height: 170,
        bmi: 27,

        screened: true,
        firstScreeningDate: new Date('2025-06-15'),
        htaClassification: 'elevee',
        diabetesClassification: 'elevee',
        followUpStatus: 'risque',

        lastBloodPressure: '145/92',
        lastGlycemia: 1.35,
        lastVisitDate: new Date('2026-01-08'),

        assignedWorkerName: 'Fatou Dieng',
        assignedWorkerPhone: '+221 77 987 65 43',
        registrationDate: new Date('2025-06-15'),
        filledAwarenessForm: true,
        filledScreeningForm: true,

        // Prédépistage (RiskTest)
        riskTests: [
          {
            id: 'b9609086-8768-4151-ad43-76ad474ff3d9-Hypertension',
            patientid: id || '1',
            testdate: '2025-02-10',
            testtype: 'Hypertension',
            testresult: '{smoking=Yes, physical_activity=No, family_history=No, bmi=25-29, diabete=No, gender=Male, age=less than 54 (45-54)}',
            risklevel: 3,
            isactive: true,
            createdat: new Date('2025-02-10')
          },
          {
            id: '3b6511e7-416c-4ca7-a393-a0c5df3176af-Diabete',
            patientid: id || '1',
            testdate: '2025-02-10',
            testtype: 'Diabete',
            testresult: '{family_history=Yes, Distance Relative, physical_activity=Yes, bmi=Less than 25 kg, level_of_the_navel=More than 102 / More than 88, eat_vegetables_and_fruits=Not every days, high_blood_sugar=Yes, hypertension=Yes, gender=Male, age=Less than 35}',
            risklevel: 16,
            isactive: true,
            createdat: new Date('2025-02-10')
          },
          {
            id: 'e6cfdb11-5bb1-47d9-a765-d734c1f12cce-Diabete',
            patientid: id || '1',
            testdate: '2025-02-13',
            testtype: 'Diabete',
            testresult: '{family_history=Yes, Close Relative, physical_activity=Yes, bmi=More than 30, level_of_the_navel=94 - 102 / 80 - 88, eat_vegetables_and_fruits=Not every days, high_blood_sugar=Yes, hypertension=Yes, gender=Male, age=Less than 35}',
            risklevel: 20,
            isactive: true,
            createdat: new Date('2025-02-13')
          }
        ],

        // Dépistages HTA (Screening)
        screeningsHTA: [
          {
            id: '18a3af8a-4bcd-47ed-b83a-b97b88efbe65',
            patientid: id || '1',
            type: 'Hypertension',
            didhavethedisease: 'Oui',
            armrightsystol: '135',
            armleftsystol: '121',
            armrightdiastol: '82',
            armleftdiastol: '75',
            sys_avarage: '128',
            dias_avarage: '78.5',
            flag: 0,
            workerid: 'f1d920de-2021-709e-39c6-e41788225f1b',
            isactive: true,
            createdat: new Date('2026-01-08'),
            grade: 'Normal'
          },
          {
            id: 'a899bb8c-3fe6-4efa-a3c4-dc8a89cdfa83',
            patientid: id || '1',
            type: 'Hypertension',
            didhavethedisease: 'Non',
            armrightsystol: '154',
            armleftsystol: '178',
            armrightdiastol: '75',
            armleftdiastol: '52',
            sys_avarage: '166',
            dias_avarage: '63.5',
            flag: 2,
            workerid: 'c129e03e-70d1-7017-1301-1f8232658fda',
            isactive: true,
            createdat: new Date('2025-12-15'),
            grade: 'Élevé'
          },
          {
            id: '2e32b089-1069-4a16-8bcc-6fcf2e599f05',
            patientid: id || '1',
            type: 'Hypertension',
            didhavethedisease: 'Non',
            armrightsystol: '178',
            armleftsystol: '175',
            armrightdiastol: '35',
            armleftdiastol: '56',
            sys_avarage: '176.5',
            dias_avarage: '45.5',
            flag: 2,
            workerid: 'c129e03e-70d1-7017-1301-1f8232658fda',
            isactive: true,
            createdat: new Date('2025-06-15'),
            grade: 'Élevé'
          }
        ],

        // Dépistages Diabète (ScreeningDiabete)
        screeningsDiabete: [
          {
            id: 'c67456e7-c720-4f2e-9cd0-f5c061ea3658',
            patientid: id || '1',
            type: 'Diabetes',
            glucose_level: '0.98',
            didhavethedisease: 'Oui',
            flag: 0,
            eatornot: 'Oui',
            workerid: '613990ee-1051-70a9-bb4b-3e1a2fbda25d',
            isactive: true,
            createdat: new Date('2026-01-08'),
            grade: 'Normal'
          },
          {
            id: '3a7931f2-8261-48bf-be75-e71089db4c76',
            patientid: id || '1',
            type: 'Diabetes',
            glucose_level: '1.8',
            didhavethedisease: 'Oui',
            flag: 2,
            eatornot: 'Non',
            workerid: 'c129e03e-70d1-7017-1301-1f8232658fda',
            isactive: true,
            createdat: new Date('2025-12-15'),
            grade: 'Élevé'
          },
          {
            id: 'c3646b3d-6de0-4cad-b6cc-eb9f3a8a513b',
            patientid: id || '1',
            type: 'Diabetes',
            glucose_level: '2.65',
            didhavethedisease: 'Oui',
            flag: 2,
            eatornot: 'Non',
            workerid: '613990ee-1051-70a9-bb4b-3e1a2fbda25d',
            isactive: true,
            createdat: new Date('2025-06-15'),
            grade: 'Élevé'
          }
        ],

        // Références du patient
        references: [
          {
            id: 'ref-001',
            householdmemberid: id || '1',
            workerId: 'f1d920de-2021-709e-39c6-e41788225f1b',
            reference_type: 'Confirmation',
            status: 'En cours',
            referedby: 'Fatou Dieng (ACS)',
            referedcenter: 'Centre de Santé de Dakar',
            referenceillness: 'Hypertension',
            referencedate: new Date('2025-12-20'),
            createdat: new Date('2025-12-20'),
            followings: [
              {
                id: 'fol-001',
                patientid: id || '1',
                patientReferenceId: 'ref-001',
                status: true,
                referedby: 'Fatou Dieng',
                referedwhere: 'Centre de Santé de Dakar',
                daterefered: new Date('2025-12-22'),
                patientattended: 'Oui',
                patientreceivcare: 'Oui',
                createdat: new Date('2025-12-22')
              }
            ]
          },
          {
            id: 'ref-002',
            householdmemberid: id || '1',
            workerId: 'f1d920de-2021-709e-39c6-e41788225f1b',
            reference_type: 'Urgence',
            status: 'Complété',
            referedby: 'Dr. Ndiaye',
            referedcenter: 'Hôpital Principal de Dakar',
            referenceillness: 'Diabète',
            referencedate: new Date('2025-06-18'),
            createdat: new Date('2025-06-18'),
            followings: [
              {
                id: 'fol-002',
                patientid: id || '1',
                patientReferenceId: 'ref-002',
                status: true,
                referedby: 'Dr. Ndiaye',
                referedwhere: 'Hôpital Principal de Dakar',
                daterefered: new Date('2025-06-20'),
                patientattended: 'Oui',
                patientreceivcare: 'Oui',
                createdat: new Date('2025-06-20')
              },
              {
                id: 'fol-003',
                patientid: id || '1',
                patientReferenceId: 'ref-002',
                status: true,
                referedby: 'Dr. Ndiaye',
                referedwhere: 'Hôpital Principal de Dakar',
                daterefered: new Date('2025-07-15'),
                patientattended: 'Oui',
                patientreceivcare: 'Oui',
                createdat: new Date('2025-07-15')
              }
            ]
          },
          {
            id: 'ref-003',
            householdmemberid: id || '1',
            workerId: 'c129e03e-70d1-7017-1301-1f8232658fda',
            reference_type: 'Consultation',
            status: 'En attente',
            referedby: 'Fatou Dieng (ACS)',
            referedcenter: 'Poste de Santé de Pikine',
            referenceillness: 'Hypertension + Diabète',
            referencedate: new Date('2026-01-10'),
            createdat: new Date('2026-01-10'),
            followings: []
          }
        ]
      };
      this.loading = false;
    }, 800);
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
          tension: 0.4
        },
        {
          label: 'Tension Diastolique',
          data: [95, 92, 90, 88, 85, 82, 88, 92],
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4
        },
        {
          label: 'Glycémie (g/L)',
          data: [1.45, 1.42, 1.38, 1.35, 1.32, 1.28, 1.3, 1.35],
          borderColor: '#eab308',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Tension (mmHg)'
          }
        },
        y1: {
          beginAtZero: false,
          position: 'right',
          title: {
            display: true,
            text: 'Glycémie (g/L)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
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
      urgent: 'Urgent'
    };
    return status ? labels[status] : 'Actif';
  }

  getStatusSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      stable: 'success',
      actif: 'info',
      risque: 'warn',
      urgent: 'danger'
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
      MAJOR: 'Major'
    };
    return labels[role] || role;
  }

  getRiskLevelLabel(level: string | undefined): string {
    if (!level) return '';
    const labels: Record<string, string> = {
      faible: 'Faible',
      modere: 'Modéré',
      eleve: 'Élevé'
    };
    return labels[level] || level;
  }

  getRiskLevelSeverity(level: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      faible: 'success',
      modere: 'warn',
      eleve: 'danger'
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
    if (testresult.includes('diabete=Yes') || testresult.includes('high_blood_sugar=Yes')) factors.push('Diabète/Glycémie');
    if (testresult.includes('bmi=More than 30') || testresult.includes('bmi=More than 40')) factors.push('Obésité');
    return factors.length > 0 ? factors.join(', ') : testresult.substring(0, 50) + '...';
  }

  viewRiskTest(riskTest: RiskTest) {
    console.log('Voir détails du prédépistage:', riskTest.id);
  }

  viewScreeningHTA(screening: ScreeningHTA) {
    console.log('Voir détails du dépistage HTA:', screening.id);
  }

  viewScreeningDiabete(screening: ScreeningDiabete) {
    console.log('Voir détails du dépistage diabète:', screening.id);
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
      referedby: this.member?.assignedWorkerName || '',
      patientattended: '',
      patientreceivcare: '',
      whydidnotattd: '',
      whydidnotreceivcare: ''
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
      daterefered: new Date(),
      referedwhere: '',
      referedby: '',
      patientattended: '',
      patientreceivcare: '',
      whydidnotattd: '',
      whydidnotreceivcare: ''
    };
  }

  saveNewFollowing() {
    if (!this.selectedReference || !this.member) return;

    // Créer le nouveau suivi
    const newFollowing: Following = {
      id: `fol-${Date.now()}`,
      // workerId: `fol-${Date.now()}`,
      patientid: this.member.id,
      patientReferenceId: this.selectedReference.id || '',
      workerId: this.member.workerId || '',
      status: true,
      daterefered: this.newFollowingForm.daterefered || new Date(),
      referedwhere: this.newFollowingForm.referedwhere || '',
      referedby: this.newFollowingForm.referedby || '',
      patientattended: this.newFollowingForm.patientattended || '',
      patientreceivcare: this.newFollowingForm.patientreceivcare || '',
      whydidnotattd: this.newFollowingForm.whydidnotattd || '',
      whydidnotreceivcare: this.newFollowingForm.whydidnotreceivcare || '',
      createdat: new Date()
    };

    // Ajouter le suivi à la référence
    this.selectedReference.followings ??= [];
    this.selectedReference.followings.push(newFollowing);

    // Mettre à jour le statut de la référence si nécessaire
    if (this.newFollowingForm.patientattended === 'Oui' && this.newFollowingForm.patientreceivcare === 'Oui') {
      this.selectedReference.status = 'Complété';
    } else if (this.newFollowingForm.patientattended === 'Oui') {
      this.selectedReference.status = 'En cours';
    }

    console.log('Nouveau suivi ajouté:', newFollowing);
    this.closeNewFollowingModal();
  }

  // Vérifier si le formulaire est valide
  isNewFollowingFormValid(): boolean {
    return !!(this.newFollowingForm.daterefered &&
      this.newFollowingForm.referedwhere &&
      this.newFollowingForm.patientattended);
  }

  newReference() {
    console.log('Nouvelle référence pour:', this.member?.id);
  }

  getTotalReferences(): number {
    return this.member?.references?.length || 0;
  }

  getTotalFollowings(): number {
    let total = 0;
    this.member?.references?.forEach(ref => {
      total += ref.followings?.length || 0;
    });
    return total;
  }

  getReferenceStatusSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (!status) return 'secondary';
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'Complété': 'success',
      'En cours': 'info',
      'En attente': 'warn',
      'Annulé': 'danger'
    };
    return severities[status] || 'secondary';
  }

  getReferenceTypeIcon(type: string | undefined): string {
    if (!type) return 'pi-file';
    const icons: Record<string, string> = {
      'Confirmation': 'pi-check-circle',
      'Urgence': 'pi-exclamation-triangle',
      'Consultation': 'pi-calendar',
      'Suivi': 'pi-clock'
    };
    return icons[type] || 'pi-file';
  }

  getFollowingStatusLabel(attended: string | undefined, receivedCare: string | undefined): string {
    if (attended === 'Oui' && receivedCare === 'Oui') {
      return 'Soins reçus';
    }
    if (attended === 'Oui' && receivedCare !== 'Oui') {
      return 'Présent sans soins';
    }
    if (attended !== 'Oui') {
      return 'Non présenté';
    }
    return 'En attente';
  }

  getFollowingStatusSeverity(attended: string | undefined, receivedCare: string | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
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
}

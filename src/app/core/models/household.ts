export interface Household {
  id: string;
  typeOfWater?: string;
  typeLatrine?: string;
  headOfHouseHoldContact?: string;
  location?: string;
  commune?: string;
  district?: string;
  dailyExpenditure?: string;
  hasGarbageCollectionService?: boolean;
  timeToNearestHealthCenterMinutes?: string;
  lastDoctorVisitDate?: Date | string;
  doctorVisitsLast12Months?: string;

  // Relations (à compléter selon les besoins)
  members?: HouseholdMember[];

  // Champs calculés pour l'affichage
  totalMembers?: number;
  membersScreened?: number;
  membersAtRisk?: number;
  workerId?: string;
  workerName?: string;
}

export interface HouseholdMember {
  id: string;
  householdid?: string;
  pvh?: string;
  phoneNumber?: string;
  matrimonialStatus?: string;
  lastDoctorVisitDate?: Date | string;
  registrationDate?: Date | string;
  doctorVisitsLast12Months?: number;
  workerId?: string;
  filledAwarenessForm?: boolean;
  filledScreeningForm?: boolean;

  // Informations personnelles (à récupérer depuis patient ou autre collection)
  firstName?: string;
  lastName?: string;
  age?: number;
  sex?: 'M' | 'F';
  dateOfBirth?: Date | string;
  relationshipToHead?: string;

  // Santé
  medicalHistory?: string[];
  allergies?: string[];
  weight?: number;
  height?: number;
  bmi?: number;

  // Statut de dépistage
  screened?: boolean;
  firstScreeningDate?: Date | string;
  htaClassification?: 'normale' | 'elevee';
  diabetesClassification?: 'normale' | 'elevee';
  followUpStatus?: 'actif' | 'stable' | 'risque' | 'urgent';

  // Dernières mesures
  lastBloodPressure?: string;
  lastGlycemia?: number;
  lastVisitDate?: Date | string;

  // ACS assigné
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;

  // Données associées - Les 3 examens
  riskTests?: RiskTest[];           // Prédépistage
  screeningsHTA?: ScreeningHTA[];   // Dépistage HTA
  screeningsDiabete?: ScreeningDiabete[]; // Dépistage Diabète

  // Références et suivis
  references?: PatientReference[];  // Références du patient
  followings?: Following[];         // Tous les suivis du patient
}

// Prédépistage - Table risktest
export interface RiskTest {
  id: string;
  patientid?: string;
  workerid?: string;

  // Informations du test
  testdate?: string; // Date du test (format texte)
  testtype?: string; // 'Diabete' ou 'Hypertension'
  testresult?: string; // JSON string avec les facteurs de risque
  risklevel?: number; // Score de risque (valeur numérique)

  // Métadonnées
  isactive?: boolean;
  createdat?: Date | string;
  updatedat?: Date | string;
}

// Dépistage HTA - Table screening
export interface ScreeningHTA {
  id: string;
  patientid?: string;
  workerid?: string;
  type?: string; // 'Hypertension' ou 'Diabetes'
  didhavethedisease?: string; // 'Oui', 'Non', 'Yes', 'No'

  // Mesures de tension artérielle
  armrightsystol?: string; // Tension systolique bras droit
  armleftsystol?: string;  // Tension systolique bras gauche
  armrightdiastol?: string; // Tension diastolique bras droit
  armleftdiastol?: string;  // Tension diastolique bras gauche

  // Moyennes calculées
  sys_avarage?: string; // Moyenne systolique
  dias_avarage?: string; // Moyenne diastolique

  // Métadonnées
  flag?: number; // 0 = normal, 2 = élevé
  grade?: string; // Grade de classification
  isactive?: boolean;
  createdat?: Date | string;
  updatedat?: Date | string;
  registrationdate?: Date | string;
}

// Dépistage Diabète - Table screeningdiabete
export interface ScreeningDiabete {
  id: string;
  patientid?: string;
  workerid?: string;
  workerId?: string; // Note: deux champs différents dans la DB
  type?: string; // 'Diabetes'

  // Mesure de glycémie
  glucose_level?: string; // Niveau de glucose (g/L)
  eatornot?: string; // 'Oui', 'Non', 'Yes', 'No' - À jeun ou non
  didhavethedisease?: string; // 'Oui', 'Non', 'Yes', 'No'

  // Métadonnées
  flag?: number; // 0 = normal, 2 = élevé
  grade?: string; // 'Normal' ou autre classification
  isactive?: boolean;
  createdat?: Date | string;
  updatedat?: Date | string;
  registrationdate?: Date | string;
}

// Référence patient - Table patientreference
export interface PatientReference {
  id: string;
  householdmemberid?: string;
  workerId?: string;

  // Informations de référence
  reference_type?: string; // Type de référence
  status?: string; // Statut de la référence
  referedby?: string; // Référé par qui
  referedcenter?: string; // Centre de référence
  referenceillness?: string; // Maladie de référence (HTA, Diabète, etc.)
  referencedate?: Date | string; // Date de référence

  // Métadonnées
  createdat?: Date | string;
  updatedat?: Date | string;

  // Relation - Suivis associés
  followings?: Following[];
}

// Suivi de référence - Table following
export interface Following {
  id: string;
  patientid?: string;
  patientReferenceId?: string;
  workerId?: string;
  workerIdReferedTo?: string;

  // Informations de suivi
  status?: boolean; // Statut du suivi
  referedby?: string; // Référé par
  referedwhere?: string; // Référé où
  daterefered?: Date | string; // Date de référence

  // Résultat du suivi
  patientattended?: string; // Le patient s'est-il présenté ? (Oui/Non)
  patientreceivcare?: string; // Le patient a-t-il reçu des soins ? (Oui/Non)
  whydidnotattd?: string; // Raison de non-présentation
  whydidnotreceivcare?: string; // Raison de non-soins

  // Métadonnées
  createdat?: Date | string;
  updatedat?: Date | string;
}

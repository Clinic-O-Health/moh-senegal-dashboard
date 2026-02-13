// Interface correspondant exactement aux champs de la table household dans Directus
export interface Household {
  id: string;

  // Informations de localisation
  location?: string;
  commune?: string;
  district?: string;
  villageid?: string; // FK vers village
  coordinates?: string; // Coordonnées GPS
  householdlocalid?: string; // ID local du ménage

  // Contact du chef de ménage (2 champs dans la DB pour compatibilité)
  headOfHouseHoldContact?: string; // camelCase version
  headofhouseholdcontact?: string; // lowercase version

  // Conditions de vie
  typeOfWater?: string;
  typeLatrine?: string;
  dailyExpenditure?: string;
  hasGarbageCollectionService?: boolean;
  timeToNearestHealthCenterMinutes?: string;
  functionallatrine?: boolean; // Latrine fonctionnelle
  accesstowater?: boolean; // Accès à l'eau

  // Suivi médical
  lastDoctorVisitDate?: Date | string;
  doctorVisitsLast12Months?: string;

  // Métadonnées
  createdat?: Date | string;
  updatedat?: Date | string;

  // Relations (expandable via Directus)
  members?: HouseholdMember[]; // householdmember[] via householdid FK
  villageid_data?: Village; // Village expandé

  // Champs calculés pour l'affichage (non DB)
  totalMembers?: number;
  membersScreened?: number;
  membersAtRisk?: number;
  workerId?: string;
  workerName?: string;
}

// Interface Village (si nécessaire)
export interface Village {
  id: string;
  name?: string;
  commune?: string;
  district?: string;
  region?: string;
}

// Interface correspondant exactement aux champs de la table householdmember dans Directus
export interface HouseholdMember {
  // Identifiant
  id: string;

  // Informations personnelles (casse exacte de la DB)
  firstname?: string; // Prénom
  lastname?: string; // Nom
  gender?: string; // Sexe: 'Male', 'Female', 'M', 'F'
  dateofbirth?: Date | string; // Date de naissance
  isheadofhousehold?: boolean; // Chef de ménage

  // Contact
  phoneNumber?: string; // Numéro de téléphone
  pvh?: string; // PVH

  // Statut personnel
  matrimonialStatus?: string; // Statut matrimonial
  education_level?: string; // Niveau d'éducation

  // Grossesse (pour les femmes)
  pregnant?: string; // Enceinte: 'Oui', 'Non'
  pregnancyage?: string; // Âge de la grossesse

  // Santé
  vaccinestatus?: string; // Statut vaccinal
  lastDoctorVisitDate?: Date | string; // Dernière visite médicale
  doctorVisitsLast12Months?: number; // Visites médicales derniers 12 mois

  // Dates d'enregistrement
  registrationDate?: Date | string; // Date d'inscription (camelCase)
  registrationdate?: Date | string; // Date d'inscription (lowercase)

  // Relations
  householdid?: string | Household; // FK vers household (peut être l'objet si expanded)
  workerId?: string | Worker; // FK vers directus_users (ACS assigné)

  // Formulaires remplis
  filledAwarenessForm?: boolean; // Formulaire de sensibilisation rempli
  filledScreeningForm?: boolean; // Formulaire de dépistage rempli

  // Métadonnées
  createdat?: Date | string;
  updatedat?: Date | string;

  // ============================================
  // Champs calculés / pour l'affichage (non DB)
  // ============================================
  age?: number; // Calculé depuis dateofbirth
  sex?: 'M' | 'F'; // Alias normalisé pour gender

  // Statut de dépistage (calculé depuis les examens)
  screened?: boolean;
  firstScreeningDate?: Date | string;
  htaClassification?: 'normale' | 'elevee';
  diabetesClassification?: 'normale' | 'elevee';
  followUpStatus?: 'actif' | 'stable' | 'risque' | 'urgent';

  // Dernières mesures (calculé depuis les examens)
  lastBloodPressure?: string;
  lastGlycemia?: number;
  lastVisitDate?: Date | string;

  // ACS assigné (calculé depuis workerId expanded)
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;

  // Santé additionnelle
  medicalHistory?: string[];
  allergies?: string[];
  weight?: number;
  height?: number;
  bmi?: number;
  relationshipToHead?: string;

  // Données associées - Les 3 examens
  preScreenings?: PreScreeningAnswer[]; // Prédépistage (nouveau)
  riskTests?: RiskTest[]; // Prédépistage (deprecated)
  screeningsHTA?: ScreeningHTA[]; // Dépistage HTA
  screeningsDiabete?: ScreeningDiabete[]; // Dépistage Diabète

  // Références et suivis
  references?: PatientReference[]; // Références du patient
  followings?: Following[]; // Tous les suivis du patient

  // Sensibilisation
  awarenessRecords?: Awareness[]; // Enregistrements de sensibilisation
  patientName?: string;
  patientAge?: number;
  patientSex?: 'M' | 'F';
  workerName?: string;
  riskLevel?: number;
  riskLevelLabel?: string;
}

// Interface Worker (directus_users simplifié)
export interface Worker {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  region?: string;
  district?: string;
  community?: string;
  health_center?: string;
}

// Prédépistage - Table prescreeninganswers
export interface PreScreeningAnswer {
  id: string;
  householdMemberId?: string; // FK vers householdmember
  workerId?: string; // FK vers directus_users

  // Informations du test
  disease?: string; // 'Diabete' ou 'Hypertension'
  answers?: any; // JSON object avec les réponses du questionnaire
  createdAt?: Date | string;

  // Métadonnées calculées
  riskLevel?: number; // Score de risque calculé depuis answers
  riskLevelLabel?: string; // 'Faible', 'Modéré', 'Élevé'
  patientName?: string;
  patientAge?: number;
  patientSex?: 'M' | 'F';
  workerName?: string;
}

// Interface pour compatibilité (deprecated - sera supprimée)
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
  armleftsystol?: string; // Tension systolique bras gauche
  armrightdiastol?: string; // Tension diastolique bras droit
  armleftdiastol?: string; // Tension diastolique bras gauche

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
  workerId?: any;

  // Informations de référence
  reference_type?: string; // Type de référence
  status?: string; // Statut de la référence
  referedby?: string; // Référé par qui
  referedcenter?: string; // Centre de référence
  referenceillness?: string; // Maladie de référence (HTA, Diabète, etc.)
  referencedate?: Date | string; // Date de référence
  appointment_date?: Date | string; // Date de rendez-vous

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
  patientReferenceId?: any;
  workerId?: string;
  workerIdReferedTo?: any;

  // Informations de suivi
  status?: boolean; // Statut du suivi
  referedby?: any; // Référé par
  referedwhere?: string; // Référé où
  type?: string; // Référé où
  daterefered?: Date | string; // Date de référence

  // Résultat du suivi
  patientattended?: string; // Le patient s'est-il présenté ? (Oui/Non)
  patientreceivcare?: string; // Le patient a-t-il reçu des soins ? (Oui/Non)
  whydidnotattd?: string; // Raison de non-présentation
  whydidnotreceivcare?: string; // Raison de non-soins
  proposedTreatment: string; // Traitement proposé
  refReason?: string; // Raison de référence
  refType?: string; // Type de référence
  appointment_date?: Date | string; // Date de rendez-vous
  refPreviousActions?: string; // Actions précédentes de référence
  // Métadonnées
  createdat?: Date | string;
  updatedat?: Date | string;
}

// Awareness - Table awareness
export interface Awareness {
  id: string;
  registrationDate?: Date | string;
  householdMemberId?: string;
  workerId?: string;

  // Connaissances sur l'hypertension
  hypertension_knowledge?: string; // Oui, ils savent ce que c'est | Oui, ils en savent un peu | Non, ils ne savent rien
  hypertension_symptoms?: string; // Oui, ils peuvent fournir plus de trois symptômes | Oui, ils peuvent fournir un à trois symptômes | Non
  hypertension_action?: string; // Oui, je sais quoi faire | Non, je ne sais pas

  // Connaissances sur le diabète
  diabetes_knowledge?: string; // Oui, je sais ce que c'est | Oui, j'en sais un peu | Non, je ne sais rien
  diabetes_signs?: string; // Oui, je sais ce que c'est | Oui, j'en sais un peu | Non, je ne sais rien
  diabetes_action?: string; // Oui, je sais quoi faire | Non, je ne sais pas

  // Métadonnées
  createdAt?: Date | string;
  updatedAt?: Date | string;

  // Scores calculés pour l'affichage
  hypertensionKnowledgeScore?: number; // 0-3 basé sur les réponses
  diabetesKnowledgeScore?: number; // 0-3 basé sur les réponses
  overallKnowledgeLevel?: 'bas' | 'moyen' | 'bon'; // Niveau global de connaissance

  patientName?: string; // Nom du patient pour l'affichage
  patientAge?: string;
  patientSex?: string;
  workerName?: string;
  // hypertensionKnowledgeScore?: number;
  // diabetesKnowledgeScore?: number;
  // overallKnowledgeLevel?: 'bas' | 'moyen' | 'bon';
}

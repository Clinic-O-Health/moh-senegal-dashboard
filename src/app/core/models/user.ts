// Interface pour les utilisateurs Directus (directus_users)
export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  location?: string;
  title?: string;
  description?: string;
  tags?: string[];
  avatar?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  status?: 'active' | 'invited' | 'draft' | 'suspended' | 'archived' | 'uninvited' | 'unverified';
  role?: string | Role;
  token?: string;
  last_access?: Date | string;
  last_page?: string;
  provider?: string;
  external_identifier?: string;
  email_notifications?: boolean;

  // Champs personnalisés pour MOH Dashboard
  phone_number?: string;
  supervisor_id?: string;
  supervisor?: User; // Relation vers le superviseur
  region?: string;
  community?: string;
  district?: string;
  health_center?: string;
  verification_token?: string;

  // Métadonnées
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Interface pour les rôles
export interface Role {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  ip_access?: string[];
  enforce_tfa?: boolean;
  admin_access?: boolean;
  app_access?: boolean;
}

// Types de rôles dans l'application
export type UserRole = 'admin' | 'supervisor' | 'medecin' | 'infirmier' | 'acs' | 'guest';

// Interface étendue pour l'affichage
export interface UserDisplay extends User {
  fullName?: string;
  roleLabel?: string;
  statusLabel?: string;
  supervisorName?: string;
  householdsCount?: number;
  patientsCount?: number;
  screeningsCount?: number;
  lastActivityFormatted?: string;
}

// Options de statut pour les filtres
export const USER_STATUS_OPTIONS = [
  { label: 'Actif', value: 'active' },
  { label: 'Invité', value: 'invited' },
  { label: 'Brouillon', value: 'draft' },
  { label: 'Suspendu', value: 'suspended' },
  { label: 'Archivé', value: 'archived' },
];

// Options de rôles pour les filtres
export const USER_ROLE_OPTIONS = [
  { label: 'Administrateur', value: 'admin' },
  { label: 'Superviseur', value: 'supervisor' },
  { label: 'Médecin', value: 'medecin' },
  { label: 'Infirmier', value: 'infirmier' },
  { label: 'Agent Communautaire (ACS)', value: 'acs' },
];

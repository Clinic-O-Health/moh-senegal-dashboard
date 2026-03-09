import { DashboardComponent } from '@pages/admin/dashboard/dashboard.component';
import { PatientsListComponent } from '@pages/admin/patients-list/patients-list.component';
import { AdminComponent } from './admin.component';
import { Routes } from '@angular/router';
import { WorkersComponent } from './workers/workers.component';
import { ScreeningsComponent } from './screenings/screenings.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { HouseholdsComponent } from './households/households.component';
import { HouseholdDetailsComponent } from './household-details/household-details.component';
import { PreScreeningsComponent } from './pre-screenings/pre-screenings.component';
import { SupervisedUsersComponent } from './supervised-users/supervised-users.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'patients',
        component: PatientsListComponent,
      },

      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'workers',
        component: WorkersComponent,
      },
      {
        path: 'screenings',
        component: ScreeningsComponent,
      },
      {
        path: 'pre-screenings',
        component: PreScreeningsComponent,
      },
      {
        path: 'supervised-users',
        component: SupervisedUsersComponent,
      },
      {
        path: 'households',
        component: HouseholdsComponent,
      },
      {
        path: 'household-details/:id',
        component: HouseholdDetailsComponent,
      },
      {
        path: 'patient/:id',
        component: PatientDetailsComponent,
      },
    ],
  },
];

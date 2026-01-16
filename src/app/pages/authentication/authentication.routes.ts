import { Route } from '@angular/router';
import { ForgottenPasswordComponent } from './forgotten-password/forgotten-password.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ValidateAccountComponent } from './validate-account/validate-account.component';
import { ValidateForgottenPasswordComponent } from './validate-forgotten-password/validate-forgotten-password.component';

export const AUTHENTICATION_ROUTES: Route[] = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'registration',
    component: RegisterComponent,
  },
  {
    path: 'forgotten-password',
    component: ForgottenPasswordComponent,
  },
  {
    path: 'verify-forgotten-password',
    component: ValidateForgottenPasswordComponent,
  },
  {
    path: 'verify-account',
    component: ValidateAccountComponent,
  },
];

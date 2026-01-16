import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/authentication.guard';
import { noAuthGuard } from '@core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: async () =>
      import('./pages/admin/admin.routes').then((module) => module.ADMIN_ROUTES),
  },
  {
    path: 'error',
    loadChildren: async () =>
      import('./pages/error/error.routes').then((module) => module.ERROR_ROUTES),
  },
  {
    path: 'authentication',
    // canActivate: [noAuthGuard],
    loadChildren: async () =>
      import('./pages/authentication/authentication.routes').then(
        (module) => module.AUTHENTICATION_ROUTES
      ),
  },
  { path: '**', redirectTo: 'error', pathMatch: 'full' },
];

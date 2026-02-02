import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';
import { AUTH_SERVICE_PROVIDER } from '@core/providers/auth-service.provider';

/**
 * Application routes configuration.
 * Uses lazy loading for all feature modules.
 * Protected routes require authentication via authGuard.
 * Public routes (auth) use guestGuard to redirect authenticated users.
 */
export const routes: Routes = [
  // Redirect root to dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Main application layout (authenticated - protected by authGuard)
  {
    path: '',
    loadComponent: () =>
      import('@layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    providers: [AUTH_SERVICE_PROVIDER],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
      },
      {
        path: 'vacancies',
        loadChildren: () =>
          import('@features/vacancies/vacancies.routes').then(m => m.VACANCIES_ROUTES),
      },
      {
        path: 'companies',
        loadChildren: () =>
          import('@features/companies/companies.routes').then(m => m.COMPANIES_ROUTES),
      },
    ],
  },

  // Authentication layout (public - guestGuard redirects if already logged in)
  {
    path: 'auth',
    loadComponent: () =>
      import('@layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    canActivate: [guestGuard],
    providers: [AUTH_SERVICE_PROVIDER],
    children: [
      {
        path: '',
        loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES),
      },
    ],
  },

  // Fallback route
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

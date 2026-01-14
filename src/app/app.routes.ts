import { Routes } from '@angular/router';

/**
 * Application routes configuration.
 * Uses lazy loading for all feature modules.
 */
export const routes: Routes = [
  // Redirect root to dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Main application layout (authenticated)
  {
    path: '',
    loadComponent: () =>
      import('@layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
      },
      // Add more feature routes here as needed
      // {
      //   path: 'staffing',
      //   loadChildren: () =>
      //     import('@features/staffing/staffing.routes').then(m => m.STAFFING_ROUTES),
      // },
    ],
  },

  // Authentication layout
  {
    path: 'auth',
    loadComponent: () =>
      import('@layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      // Add auth feature routes here
      // {
      //   path: '',
      //   loadChildren: () =>
      //     import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES),
      // },
    ],
  },

  // Fallback route
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

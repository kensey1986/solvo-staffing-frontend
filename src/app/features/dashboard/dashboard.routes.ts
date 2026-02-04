import { Routes } from '@angular/router';

/**
 * Dashboard feature routes.
 * Lazy-loaded from app.routes.ts.
 */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
  },
];

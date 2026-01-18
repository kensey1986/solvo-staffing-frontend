import { Routes } from '@angular/router';

/**
 * Login feature routes.
 * Lazy-loaded from app.routes.ts.
 */
export const LOGIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/login-page.component').then(m => m.LoginPageComponent),
  },
];

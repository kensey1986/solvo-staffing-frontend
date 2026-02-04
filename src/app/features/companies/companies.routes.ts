import { Routes } from '@angular/router';

/**
 * Companies feature routes.
 * Lazy-loaded from app.routes.ts.
 */
export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/companies-list/companies-list.component').then(m => m.CompaniesListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/company-detail/company-detail.component').then(m => m.CompanyDetailComponent),
  },
];

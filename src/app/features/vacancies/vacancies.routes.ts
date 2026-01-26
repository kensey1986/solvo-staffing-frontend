import { Routes } from '@angular/router';

/**
 * Vacancies feature routes.
 * Lazy-loaded from app.routes.ts.
 */
export const VACANCIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/vacancies-list/vacancies-list.component').then(m => m.VacanciesListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/vacancy-detail/vacancy-detail.component').then(m => m.VacancyDetailComponent),
  },
];

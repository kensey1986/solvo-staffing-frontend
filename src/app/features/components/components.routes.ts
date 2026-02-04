import { Routes } from '@angular/router';

/**
 * Components showcase feature routes.
 * Lazy-loaded from app.routes.ts.
 */
export const COMPONENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/components-showcase-page/components-showcase-page.component').then(
        m => m.ComponentsShowcasePageComponent
      ),
  },
];

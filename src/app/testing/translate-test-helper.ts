/**
 * Testing Utilities for TranslateService
 *
 * Provides TranslateModule configuration and mock for unit tests
 */

import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
  TranslationObject,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

/**
 * Mock TranslateLoader that returns basic translations for tests
 * This allows the TranslatePipe and TranslateService to work in tests
 */
export class TranslateLoaderMock implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    void lang;
    const translations = {
      AUTH: {
        LOGIN_ERROR: 'Error de conexión',
        CLOSE: 'Cerrar',
      },
      THEME: {
        SWITCH_TO_DARK: 'Switch to dark mode',
        SWITCH_TO_LIGHT: 'Switch to light mode',
      },
      NAV: {
        DASHBOARD: 'Dashboard',
        COMPANIES: 'Companies',
        VACANCIES: 'Vacancies',
      },
      DASHBOARD: {
        VACANCY_PIPELINE: 'PIPELINE DE VACANTES',
        COMPANY_PIPELINE: 'PIPELINE DE EMPRESAS',
      },
    };
    return of(translations);
  }
}

/**
 * Returns TranslateModule configured for testing
 * Import this in your test's TestBed.configureTestingModule imports array
 *
 * After compileComponents(), you MUST call initializeTranslations(translateService)
 * to load the mock translations into the service.
 *
 * @example
 * await TestBed.configureTestingModule({
 *   imports: [MyComponent, getTranslateTestingModule()],
 * }).compileComponents();
 *
 * const translateService = TestBed.inject(TranslateService);
 * initializeTranslations(translateService);
 */
export function getTranslateTestingModule() {
  return TranslateModule.forRoot({
    loader: { provide: TranslateLoader, useClass: TranslateLoaderMock },
    fallbackLang: 'en',
  });
}

/**
 * Initialize translations for testing by setting them directly on the TranslateService
 * This ensures instant() calls return actual translations instead of keys
 *
 * @param translateService - The TranslateService instance from TestBed
 */
export function initializeTranslations(translateService: TranslateService): void {
  const translations = {
    AUTH: {
      LOGIN_ERROR: 'Error de conexión',
      CLOSE: 'Cerrar',
    },
    THEME: {
      SWITCH_TO_DARK: 'Switch to dark mode',
      SWITCH_TO_LIGHT: 'Switch to light mode',
    },
    NAV: {
      DASHBOARD: 'Dashboard',
      COMPANIES: 'Companies',
      VACANCIES: 'Vacancies',
    },
    DASHBOARD: {
      VACANCY_PIPELINE: 'Pipeline de Vacantes',
      COMPANY_PIPELINE: 'Pipeline de Empresas',
    },
  };

  translateService.setTranslation('en', translations);
  translateService.use('en');
}

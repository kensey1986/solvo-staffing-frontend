/**
 * Vacancy Service Provider
 *
 * Factory provider that switches between mock and real API service
 * based on environment configuration.
 */

import {
  EnvironmentInjector,
  InjectionToken,
  Provider,
  runInInjectionContext,
} from '@angular/core';
import { ENV } from '../config/env.config';
import { IVacancyService } from '../interfaces/vacancy-service.interface';
import { VacancyApiService } from '../services/vacancy/vacancy-api.service';
import { VacancyMockService } from '../services/vacancy/vacancy-mock.service';

/**
 * Injection token for the vacancy service.
 * Use this token to inject the service in components.
 *
 * @example
 * ```typescript
 * private readonly vacancyService = inject(VACANCY_SERVICE);
 * ```
 */
export const VACANCY_SERVICE = new InjectionToken<IVacancyService>('VacancyService');

/**
 * Factory function that returns the appropriate service implementation
 * based on environment configuration.
 *
 * @param injector - EnvironmentInjector for creating services in injection context
 * @returns IVacancyService implementation (mock or API)
 */
export function vacancyServiceFactory(injector: EnvironmentInjector): IVacancyService {
  if (ENV.useMockServices) {
    console.log('[VacancyService] Using mock service');
    return new VacancyMockService();
  }
  console.log('[VacancyService] Using API service');
  return runInInjectionContext(injector, () => new VacancyApiService());
}

/**
 * Provider configuration for the vacancy service.
 * Add this to the providers array in app.config.ts or component providers.
 */
export const VACANCY_SERVICE_PROVIDER: Provider = {
  provide: VACANCY_SERVICE,
  useFactory: vacancyServiceFactory,
  deps: [EnvironmentInjector],
};

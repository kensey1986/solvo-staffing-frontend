/**
 * Company Service Provider
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
import { ICompanyService } from '../interfaces/company-service.interface';
import { CompanyApiService } from '../services/company/company-api.service';
import { CompanyMockService } from '../services/company/company-mock.service';

/**
 * Injection token for the company service.
 * Use this token to inject the service in components.
 *
 * @example
 * ```typescript
 * private readonly companyService = inject(COMPANY_SERVICE);
 * ```
 */
export const COMPANY_SERVICE = new InjectionToken<ICompanyService>('CompanyService');

/**
 * Factory function that returns the appropriate service implementation
 * based on environment configuration.
 *
 * @param injector - EnvironmentInjector for creating services in injection context
 * @returns ICompanyService implementation (mock or API)
 */
export function companyServiceFactory(injector: EnvironmentInjector): ICompanyService {
  if (ENV.useMockServices) {
    console.log('[CompanyService] Using mock service');
    return new CompanyMockService();
  }
  console.log('[CompanyService] Using API service');
  return runInInjectionContext(injector, () => new CompanyApiService());
}

/**
 * Provider configuration for the company service.
 * Add this to the providers array in component providers.
 */
export const COMPANY_SERVICE_PROVIDER: Provider = {
  provide: COMPANY_SERVICE,
  useFactory: companyServiceFactory,
  deps: [EnvironmentInjector],
};

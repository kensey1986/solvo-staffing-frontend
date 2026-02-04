/**
 * Sales Rep Service Provider
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
import { ISalesRepService } from '../interfaces/sales-rep-service.interface';
import { SalesRepApiService } from '../services/sales-rep/sales-rep-api.service';
import { SalesRepMockService } from '../services/sales-rep/sales-rep-mock.service';

/**
 * Injection token for the sales rep service.
 * Use this token to inject the service in components.
 *
 * @example
 * ```typescript
 * private readonly salesRepService = inject(SALES_REP_SERVICE);
 * ```
 */
export const SALES_REP_SERVICE = new InjectionToken<ISalesRepService>('SalesRepService');

/**
 * Factory function that returns the appropriate service implementation
 * based on environment configuration.
 *
 * @param injector - EnvironmentInjector for creating services in injection context
 * @returns ISalesRepService implementation (mock or API)
 */
export function salesRepServiceFactory(injector: EnvironmentInjector): ISalesRepService {
  if (ENV.useMockServices) {
    console.log('[SalesRepService] Using mock service');
    return new SalesRepMockService();
  }
  console.log('[SalesRepService] Using API service');
  return runInInjectionContext(injector, () => new SalesRepApiService());
}

/**
 * Provider configuration for the sales rep service.
 * Add this to the providers array in component providers.
 */
export const SALES_REP_SERVICE_PROVIDER: Provider = {
  provide: SALES_REP_SERVICE,
  useFactory: salesRepServiceFactory,
  deps: [EnvironmentInjector],
};

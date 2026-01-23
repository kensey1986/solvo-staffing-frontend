/**
 * Dashboard Service Provider
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
import { IDashboardService } from '../interfaces/dashboard-service.interface';
import { DashboardApiService } from '../services/dashboard/dashboard-api.service';
import { DashboardMockService } from '../services/dashboard/dashboard-mock.service';

/**
 * Injection token for the dashboard service.
 */
export const DASHBOARD_SERVICE = new InjectionToken<IDashboardService>('DashboardService');

/**
 * Factory function for creating the dashboard service.
 */
export function dashboardServiceFactory(injector: EnvironmentInjector): IDashboardService {
  if (ENV.useMockServices) {
    console.log('[DashboardService] Using mock service');
    return new DashboardMockService();
  }
  console.log('[DashboardService] Using API service');
  return runInInjectionContext(injector, () => new DashboardApiService());
}

/**
 * Provider configuration for the dashboard service.
 */
export const DASHBOARD_SERVICE_PROVIDER: Provider = {
  provide: DASHBOARD_SERVICE,
  useFactory: dashboardServiceFactory,
  deps: [EnvironmentInjector],
};

/**
 * Auth Service Provider
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
import { IAuthService } from '../interfaces/auth-service.interface';
import { AuthApiService } from '../services/auth/auth-api.service';
import { AuthMockService } from '../services/auth/auth-mock.service';

/**
 * Injection token for the auth service.
 * Use this token to inject the service in components and guards.
 *
 * @example
 * ```typescript
 * private readonly authService = inject(AUTH_SERVICE);
 * ```
 */
export const AUTH_SERVICE = new InjectionToken<IAuthService>('AuthService');

/**
 * Factory function that returns the appropriate service implementation
 * based on environment configuration.
 *
 * @param injector - EnvironmentInjector for creating services in injection context
 * @returns IAuthService implementation (mock or API)
 */
export function authServiceFactory(injector: EnvironmentInjector): IAuthService {
  if (ENV.useMockServices) {
    console.log('[AuthService] Using mock service');
    return new AuthMockService();
  }
  console.log('[AuthService] Using API service');
  return runInInjectionContext(injector, () => new AuthApiService());
}

/**
 * Provider configuration for the auth service.
 * Add this to the providers array in app.config.ts or component providers.
 */
export const AUTH_SERVICE_PROVIDER: Provider = {
  provide: AUTH_SERVICE,
  useFactory: authServiceFactory,
  deps: [EnvironmentInjector],
};

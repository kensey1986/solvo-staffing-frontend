/**
 * Auth Service Provider
 *
 * Factory provider for IAuthService.
 * Switches between mock and real implementations based on environment.
 */

import { EnvironmentInjector, InjectionToken, Provider } from '@angular/core';
import { runInInjectionContext } from '@angular/core';
import { ENV } from '../config/env.config';
import { AuthApiService } from '../services/auth/auth-api.service';
import { AuthMockService } from '../services/auth/auth-mock.service';
import { IAuthService } from '../interfaces/auth-service.interface';

export const AUTH_SERVICE = new InjectionToken<IAuthService>('AuthService');

export function authServiceFactory(injector: EnvironmentInjector): IAuthService {
  if (ENV.useMockServices) {
    return new AuthMockService();
  }
  return runInInjectionContext(injector, () => new AuthApiService());
}

export const AUTH_SERVICE_PROVIDER: Provider = {
  provide: AUTH_SERVICE,
  useFactory: authServiceFactory,
  deps: [EnvironmentInjector],
};

/**
 * Auth Interceptor
 *
 * Functional HTTP interceptor that injects the Bearer token
 * into outgoing requests for authenticated API calls.
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AUTH_SERVICE } from '../providers/auth-service.provider';

/**
 * Injects the Authorization header with Bearer token for authenticated requests.
 * Skips public endpoints like /auth/login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AUTH_SERVICE);

  // Skip authentication for public endpoints
  const publicEndpoints = ['/auth/login', '/auth/microsoft/init', '/auth/microsoft/callback'];
  const isPublicEndpoint = publicEndpoints.some((endpoint) => req.url.includes(endpoint));

  if (isPublicEndpoint) {
    return next(req);
  }

  // Get the access token
  const token = authService.getAccessToken();

  if (token) {
    // Clone the request and add the authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  // No token available, proceed without auth header
  return next(req);
};

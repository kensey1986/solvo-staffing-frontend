/**
 * Auth Guard
 *
 * Protects private routes by checking if the user is authenticated.
 * Redirects to login page if not authenticated.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AUTH_SERVICE } from '../providers/auth-service.provider';

/**
 * Guard that protects routes requiring authentication.
 * Returns true if authenticated, or redirects to /auth/login if not.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AUTH_SERVICE);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  console.log('[AuthGuard] User not authenticated, redirecting to login');
  return router.createUrlTree(['/auth/login']);
};

/**
 * Guest Guard
 *
 * Protects public routes (like login) from authenticated users.
 * Redirects to dashboard if already logged in.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AUTH_SERVICE } from '../providers/auth-service.provider';

/**
 * Guard that prevents authenticated users from accessing guest-only routes.
 * Returns true if not authenticated, or redirects to /dashboard if authenticated.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AUTH_SERVICE);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  console.log('[GuestGuard] User already authenticated, redirecting to dashboard');
  return router.createUrlTree(['/dashboard']);
};

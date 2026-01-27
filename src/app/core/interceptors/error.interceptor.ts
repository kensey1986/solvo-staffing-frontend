/**
 * Error Interceptor
 *
 * Functional HTTP interceptor that handles common HTTP errors
 * like 401 (Unauthorized), 403 (Forbidden), and 500 (Server Error).
 */

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Handles HTTP errors globally:
 * - 401: Redirects to login page (session expired or invalid)
 * - 403: Logs forbidden access attempt
 * - 500+: Logs server errors for debugging
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Unauthorized - session expired or invalid token
          console.warn('[ErrorInterceptor] Unauthorized request, redirecting to login');
          // Clear any stored session data
          localStorage.removeItem('solvo_token');
          localStorage.removeItem('solvo_user');
          // Redirect to login
          router.navigate(['/auth/login']);
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.warn('[ErrorInterceptor] Forbidden access attempt:', req.url);
          break;

        case 404:
          // Not found - resource doesn't exist
          console.warn('[ErrorInterceptor] Resource not found:', req.url);
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error('[ErrorInterceptor] Server error:', error.status, error.message);
          break;

        default:
          // Other errors
          if (error.status >= 400) {
            console.error('[ErrorInterceptor] HTTP error:', error.status, error.message);
          }
      }

      // Re-throw the error so components can handle it if needed
      return throwError(() => error);
    })
  );
};

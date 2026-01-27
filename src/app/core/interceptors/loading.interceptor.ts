/**
 * Loading Interceptor
 *
 * Functional HTTP interceptor that tracks pending HTTP requests
 * and updates the global loading state.
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Tracks HTTP request lifecycle to update global loading state.
 * Increments counter on request start, decrements on completion.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Start loading
  loadingService.startRequest();

  return next(req).pipe(
    finalize(() => {
      // End loading when request completes (success or error)
      loadingService.endRequest();
    })
  );
};

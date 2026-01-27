/**
 * Loading Service
 *
 * Global loading state management using signals.
 * Used by the loading interceptor to track pending HTTP requests.
 */

import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  /** Number of pending HTTP requests */
  private readonly pendingRequests = signal(0);

  /** Whether any HTTP request is in progress */
  readonly isLoading = computed(() => this.pendingRequests() > 0);

  /** Current count of pending requests (for debugging) */
  readonly pendingCount = this.pendingRequests.asReadonly();

  /**
   * Increments the pending request counter.
   * Called when an HTTP request starts.
   */
  startRequest(): void {
    this.pendingRequests.update((count) => count + 1);
  }

  /**
   * Decrements the pending request counter.
   * Called when an HTTP request completes (success or error).
   */
  endRequest(): void {
    this.pendingRequests.update((count) => Math.max(0, count - 1));
  }

  /**
   * Resets the pending request counter to zero.
   * Useful for error recovery or navigation.
   */
  reset(): void {
    this.pendingRequests.set(0);
  }
}

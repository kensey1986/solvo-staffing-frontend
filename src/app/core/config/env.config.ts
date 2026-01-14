/**
 * Environment Configuration
 *
 * Centralizes all environment variables.
 * Note: Angular doesn't use Vite, so import.meta.env won't work.
 * For production, use Angular's environment file replacement or
 * set useMockServices to false.
 */

import { environment } from '../../../environments/environment';

/**
 * Helper function to replace URL parameters (e.g., :id) with actual values.
 */
export function buildUrl(template: string, params: Record<string, string | number>): string {
  let url = template;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, String(value));
  }
  return url;
}

/**
 * API Endpoints configuration.
 */
export const API_ENDPOINTS = environment.apiEndpoints;

/**
 * Environment configuration object.
 *
 * IMPORTANT: Set useMockServices to false when connecting to real backend.
 */
export const ENV = {
  /** Whether the app is running in production mode */
  production: environment.production,

  /** API base URL (e.g., http://localhost:3000/api) */
  apiBaseUrl: environment.apiBaseUrl,

  /** API version (e.g., v1) */
  apiVersion: environment.apiVersion,

  /**
   * Whether to use mock services instead of real API calls.
   * Set to false when backend is available.
   */
  useMockServices: environment.useMockServices,

  /** Complete API URL including version */
  get apiUrl(): string {
    return `${this.apiBaseUrl}/${this.apiVersion}`;
  },
} as const;

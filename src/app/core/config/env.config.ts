/**
 * Environment Configuration
 *
 * Centralizes all environment variables.
 * Note: Angular doesn't use Vite, so import.meta.env won't work.
 * For production, use Angular's environment file replacement or
 * set useMockServices to false.
 */

import { isDevMode } from '@angular/core';

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
export const API_ENDPOINTS = {
  vacancies: {
    list: '/vacancies',
    detail: '/vacancies/:id',
    state: '/vacancies/:id/state',
    history: '/vacancies/:id/history',
  },
} as const;

/**
 * Environment configuration object.
 *
 * IMPORTANT: Set useMockServices to false when connecting to real backend.
 */
export const ENV = {
  /** Whether the app is running in production mode */
  production: !isDevMode(),

  /** API base URL (e.g., http://localhost:3000/api) */
  apiBaseUrl: 'http://localhost:3000/api',

  /** API version (e.g., v1) */
  apiVersion: 'v1',

  /**
   * Whether to use mock services instead of real API calls.
   * Set to false when backend is available.
   */
  useMockServices: true,

  /** Complete API URL including version */
  get apiUrl(): string {
    return `${this.apiBaseUrl}/${this.apiVersion}`;
  },
} as const;

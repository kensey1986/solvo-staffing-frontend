/// <reference types="vite/client" />

/**
 * Type declarations for environment variables loaded via Vite.
 * These values are read from .env files at build time.
 */
interface ImportMetaEnv {
  /** API base URL */
  readonly VITE_API_BASE_URL: string;
  /** API version (e.g., 'v1') */
  readonly VITE_API_VERSION: string;
  /** Whether to use mock services instead of real API */
  readonly VITE_USE_MOCK_SERVICES: string;
  /** Vacancies list endpoint */
  readonly VITE_API_ENDPOINT_VACANCIES: string;
  /** Vacancy detail endpoint (with :id parameter) */
  readonly VITE_API_ENDPOINT_VACANCY_DETAIL: string;
  /** Vacancy state change endpoint (with :id parameter) */
  readonly VITE_API_ENDPOINT_VACANCY_STATE: string;
  /** Vacancy history endpoint (with :id parameter) */
  readonly VITE_API_ENDPOINT_VACANCY_HISTORY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

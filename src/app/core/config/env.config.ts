/**
 * Environment Configuration
 *
 * Centralizes all environment variables.
 * Values are loaded from /assets/env.json at runtime via APP_INITIALIZER.
 * Default values below are fallbacks if env.json fails to load.
 */

export interface VacancyEndpoints {
  list: string;
  detail: string;
  state: string;
  history: string;
}

export interface CompanyEndpoints {
  list: string;
  detail: string;
  state: string;
  history: string;
  vacancies: string;
  research: string;
  contacts: string;
  contactDetail: string;
  investigate: string;
}

export interface AuthEndpoints {
  login: string;
  logout: string;
  me: string;
  refresh: string;
}

export interface ApiEndpoints {
  vacancies: VacancyEndpoints;
  companies: CompanyEndpoints;
  auth: AuthEndpoints;
}

export interface RuntimeEnv {
  production: boolean;
  apiBaseUrl: string;
  apiVersion: string;
  useMockServices: boolean;
  apiEndpoints: ApiEndpoints;
  apiUrl: string;
}

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
 * API Endpoints configuration (defaults, overwritten by env.json).
 */
export const API_ENDPOINTS: ApiEndpoints = {
  vacancies: {
    list: '/vacancies',
    detail: '/vacancies/:id',
    state: '/vacancies/:id/state',
    history: '/vacancies/:id/history',
  },
  companies: {
    list: '/companies',
    detail: '/companies/:id',
    state: '/companies/:id/state',
    history: '/companies/:id/history',
    vacancies: '/companies/:id/vacancies',
    research: '/companies/:id/research',
    contacts: '/companies/:id/contacts',
    contactDetail: '/companies/:companyId/contacts/:contactId',
    investigate: '/companies/investigate',
  },
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
};

/**
 * Environment configuration object (defaults, overwritten by env.json).
 *
 * IMPORTANT: These are fallback values. Actual config comes from /assets/env.json.
 */
export const ENV: RuntimeEnv = {
  /** Whether the app is running in production mode */
  production: false,

  /** API base URL (e.g., http://localhost:3000/api) */
  apiBaseUrl: 'http://localhost:3000/api',

  /** API version (e.g., v1) */
  apiVersion: 'v1',

  /**
   * Whether to use mock services instead of real API calls.
   * Set to false when backend is available.
   */
  useMockServices: true,

  /** API endpoints */
  apiEndpoints: API_ENDPOINTS,

  /** Complete API URL including version */
  get apiUrl(): string {
    return `${this.apiBaseUrl}/${this.apiVersion}`;
  },
};

export function applyRuntimeEnv(runtimeEnv: Partial<RuntimeEnv>): void {
  if (!runtimeEnv) {
    return;
  }

  if (typeof runtimeEnv.production === 'boolean') {
    ENV.production = runtimeEnv.production;
  }

  if (typeof runtimeEnv.apiBaseUrl === 'string' && runtimeEnv.apiBaseUrl) {
    ENV.apiBaseUrl = runtimeEnv.apiBaseUrl;
  }

  if (typeof runtimeEnv.apiVersion === 'string' && runtimeEnv.apiVersion) {
    ENV.apiVersion = runtimeEnv.apiVersion;
  }

  if (typeof runtimeEnv.useMockServices === 'boolean') {
    ENV.useMockServices = runtimeEnv.useMockServices;
  }

  if (runtimeEnv.apiEndpoints?.vacancies) {
    Object.assign(API_ENDPOINTS.vacancies, runtimeEnv.apiEndpoints.vacancies);
  }

  if (runtimeEnv.apiEndpoints?.companies) {
    Object.assign(API_ENDPOINTS.companies, runtimeEnv.apiEndpoints.companies);
  }

  if (runtimeEnv.apiEndpoints?.auth) {
    Object.assign(API_ENDPOINTS.auth, runtimeEnv.apiEndpoints.auth);
  }
}

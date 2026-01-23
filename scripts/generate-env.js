/**
 * Script to generate env.json from environment variables.
 * Run before build: npm run generate-env
 *
 * Environment variables (from Key Vault, pipeline, or local .env):
 * - API_BASE_URL
 * - API_VERSION
 * - USE_MOCK_SERVICES
 * - PRODUCTION
 * - API_ENDPOINT_VACANCIES
 * - API_ENDPOINT_VACANCY_DETAIL
 * - API_ENDPOINT_VACANCY_STATE
 * - API_ENDPOINT_VACANCY_HISTORY
 * - API_ENDPOINT_COMPANIES
 * - API_ENDPOINT_COMPANY_DETAIL
 * - API_ENDPOINT_COMPANY_STATE
 * - API_ENDPOINT_COMPANY_HISTORY
 * - API_ENDPOINT_COMPANY_VACANCIES
 * - API_ENDPOINT_COMPANY_RESEARCH
 * - API_ENDPOINT_COMPANY_CONTACTS
 * - API_ENDPOINT_COMPANY_CONTACT_DETAIL
 * - API_ENDPOINT_COMPANY_INVESTIGATE
 */

const fs = require('fs');
const path = require('path');

// Load .env file for local development
try {
  require('dotenv').config();
} catch {
  console.log('dotenv not installed, using system environment variables only.');
}

const envConfig = {
  production: process.env.PRODUCTION === 'true',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  apiVersion: process.env.API_VERSION || 'v1',
  useMockServices: process.env.USE_MOCK_SERVICES !== 'false',
  apiEndpoints: {
    vacancies: {
      list: process.env.API_ENDPOINT_VACANCIES || '/vacancies',
      detail: process.env.API_ENDPOINT_VACANCY_DETAIL || '/vacancies/:id',
      state: process.env.API_ENDPOINT_VACANCY_STATE || '/vacancies/:id/state',
      history: process.env.API_ENDPOINT_VACANCY_HISTORY || '/vacancies/:id/history',
    },
    companies: {
      list: process.env.API_ENDPOINT_COMPANIES || '/companies',
      detail: process.env.API_ENDPOINT_COMPANY_DETAIL || '/companies/:id',
      state: process.env.API_ENDPOINT_COMPANY_STATE || '/companies/:id/state',
      history: process.env.API_ENDPOINT_COMPANY_HISTORY || '/companies/:id/history',
      vacancies: process.env.API_ENDPOINT_COMPANY_VACANCIES || '/companies/:id/vacancies',
      research: process.env.API_ENDPOINT_COMPANY_RESEARCH || '/companies/:id/research',
      contacts: process.env.API_ENDPOINT_COMPANY_CONTACTS || '/companies/:id/contacts',
      contactDetail: process.env.API_ENDPOINT_COMPANY_CONTACT_DETAIL || '/companies/:companyId/contacts/:contactId',
      investigate: process.env.API_ENDPOINT_COMPANY_INVESTIGATE || '/companies/investigate',
    },
    auth: {
      login: process.env.API_ENDPOINT_AUTH_LOGIN || '/auth/login',
      logout: process.env.API_ENDPOINT_AUTH_LOGOUT || '/auth/logout',
      me: process.env.API_ENDPOINT_AUTH_ME || '/auth/me',
      refresh: process.env.API_ENDPOINT_AUTH_REFRESH || '/auth/refresh',
      microsoftInit: process.env.API_ENDPOINT_AUTH_MICROSOFT_INIT || '/auth/microsoft/init',
      microsoftCallback: process.env.API_ENDPOINT_AUTH_MICROSOFT_CALLBACK || '/auth/microsoft/callback',
    },
  },
};

const outputPath = path.join(__dirname, '..', 'public', 'assets', 'env.json');

// Ensure directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// Write env.json
fs.writeFileSync(outputPath, JSON.stringify(envConfig, null, 2));

console.log('Generated env.json:');
console.log(JSON.stringify(envConfig, null, 2));

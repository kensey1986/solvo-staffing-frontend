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
  },
};

const outputPath = path.join(__dirname, '..', 'public', 'assets', 'env.json');

// Ensure directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// Write env.json
fs.writeFileSync(outputPath, JSON.stringify(envConfig, null, 2));

console.log('Generated env.json:');
console.log(JSON.stringify(envConfig, null, 2));

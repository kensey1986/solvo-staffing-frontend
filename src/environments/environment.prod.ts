export const environment = {
  production: true,
  apiBaseUrl: 'https://api.solvo.com',
  apiVersion: 'v1',
  useMockServices: false,
  apiEndpoints: {
    vacancies: {
      list: '/vacancies',
      detail: '/vacancies/:id',
      state: '/vacancies/:id/state',
      history: '/vacancies/:id/history',
    },
  },
} as const;

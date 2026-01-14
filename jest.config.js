module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: [
        'src/app/**/*.ts',
        '!src/app/**/*.module.ts',
        '!src/app/**/*.routes.ts',
        '!src/app/**/index.ts',
        '!src/main.ts',
        '!src/app/app.config.ts',
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    moduleNameMapper: {
        '^@app/(.*)$': '<rootDir>/src/app/$1',
        '^@core/(.*)$': '<rootDir>/src/app/core/$1',
        '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
        '^@features/(.*)$': '<rootDir>/src/app/features/$1',
        '^@layouts/(.*)$': '<rootDir>/src/app/layouts/$1',
        '^@environments/(.*)$': '<rootDir>/src/environments/$1',
    },
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
    transform: {
        '^.+\\.(ts|js|mjs|html|svg)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@angular)'],
    moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
};

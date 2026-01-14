const { createEsmPreset } = require('jest-preset-angular/presets');

const esmPreset = createEsmPreset();

module.exports = {
    ...esmPreset,
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
        '!src/app/**/*.entity.ts',
        '!src/app/**/*.dto.ts',
        '!src/app/**/*.interface.ts',
        '!src/app/**/*.model.ts',
        '!src/app/**/*.type.ts',
        '!src/app/**/*.enum.ts',
        '!src/app/**/*.constant.ts',
        '!src/app/**/*.config.ts',
        '!src/app/**/*.guard.ts',
        '!src/app/**/*.interceptor.ts',
    ],
    coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
    },
    moduleNameMapper: {
        ...esmPreset.moduleNameMapper,
        '^@app$': '<rootDir>/src/app',
        '^@app/(.*)$': '<rootDir>/src/app/$1',
        '^@core$': '<rootDir>/src/app/core',
        '^@core/(.*)$': '<rootDir>/src/app/core/$1',
        '^@shared$': '<rootDir>/src/app/shared',
        '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
        '^@features$': '<rootDir>/src/app/features',
        '^@features/(.*)$': '<rootDir>/src/app/features/$1',
        '^@layouts$': '<rootDir>/src/app/layouts',
        '^@layouts/(.*)$': '<rootDir>/src/app/layouts/$1',
        '^@environments$': '<rootDir>/src/environments',
        '^@environments/(.*)$': '<rootDir>/src/environments/$1',
        'tslib': 'tslib/tslib.es6.js',
    },
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
    transform: {
        ...esmPreset.transform,
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
                useESM: true,
                isolatedModules: false,
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@angular|@shared|@material|@adobe|rxjs|tslib)'],
    moduleFileExtensions: ['mjs', 'ts', 'html', 'js', 'json'],
};

/**
 * Jest configuration.
 * - preset jest-expo: same Babel/Metro behaviour as the app.
 * - TZ is forced here, in the parent process, so every worker inherits it at startup.
 *   (Assigning process.env.TZ inside setupFiles does not work: Jest sandboxes a copy of
 *   process.env.) Pacific/Kiritimati is UTC+14, far from America/Bogota (UTC-5): any
 *   accidental dependency on the device time zone shifts dates by a day and fails tests.
 */
process.env.TZ = 'Pacific/Kiritimati';

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/Keppri_Espartanos_Prueba_Tecnica_ReactNative/'],
  modulePathIgnorePatterns: ['<rootDir>/Keppri_Espartanos_Prueba_Tecnica_ReactNative/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageReporters: ['text-summary', 'text', 'lcov'],
  // Quality gate (measured: domain/application 100% lines, ≥96% branches). The business core
  // cannot lose coverage; the build fails below these numbers.
  coverageThreshold: {
    global: { statements: 95, branches: 90, functions: 95, lines: 95 },
    './src/domain/': { statements: 100, branches: 95, functions: 100, lines: 100 },
    './src/application/': { statements: 100, branches: 95, functions: 100, lines: 100 },
  },
  clearMocks: true,
  restoreMocks: true,
};

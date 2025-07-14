const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/__tests__/e2e/**/*.test.ts', '**/e2e.test.ts'],
  coverageDirectory: 'coverage/e2e',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.e2e.ts'],
  testTimeout: 60000,
  maxWorkers: 1, // E2E tests should run sequentially
};

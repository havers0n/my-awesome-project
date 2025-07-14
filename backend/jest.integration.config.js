const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/__tests__/integration/**/*.test.ts', '**/integration.test.ts'],
  coverageDirectory: 'coverage/integration',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.integration.ts'],
  testTimeout: 30000,
};

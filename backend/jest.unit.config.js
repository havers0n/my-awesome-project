const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/__tests__/unit/**/*.test.ts', '**/unit.test.ts'],
  coverageDirectory: 'coverage/unit',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.unit.ts'],
};

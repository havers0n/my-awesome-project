import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase test timeout for CI environments
if (process.env.CI) {
  jest.setTimeout(30000);
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.beforeEach(() => {
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connections, clear cache, etc.
  await new Promise(resolve => setTimeout(resolve, 500));
});

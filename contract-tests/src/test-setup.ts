// Test setup
jest.setTimeout(30000); // 30 seconds timeout for async operations

// Environment variables for tests
process.env.PACT_DO_NOT_TRACK = 'true';
process.env.NODE_ENV = 'test';

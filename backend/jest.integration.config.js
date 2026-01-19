/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...require('./jest.config'),
  testMatch: ['**/__tests__/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.integration.ts'],
  testTimeout: 30000,
};

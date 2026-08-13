/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  coverageDirectory: 'coverage',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': '<rootDir>/jest.esbuild-transformer.cjs',
  },
  watchman: false,
};

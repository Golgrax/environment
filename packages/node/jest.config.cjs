module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/__tests__',
    '<rootDir>/source'
  ],
  testMatch: [
    '**/__tests__/**/*.test.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/source/$1'
  }
};

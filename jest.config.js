module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src', // Set rootDir to 'src'
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/$1', // Correct mapping
    },
    testEnvironment: 'node',
  };
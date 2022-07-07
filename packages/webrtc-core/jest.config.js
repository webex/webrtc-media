module.exports = {
  testEnvironment: 'jsdom',
  clearMocks: true,
  rootDir: './src',
  collectCoverage: true,
  coverageReporters: ['lcov', 'cobertura'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage/junit',
        outputName: 'coverage-junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: 'coverage/html',
        filename: 'jest-result.html',
      },
    ],
  ],
  setupFiles: ['<rootDir>/../jest.global.js'],
  setupFilesAfterEnv: ['<rootDir>/../jest.expectExtensions.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testResultsProcessor: 'jest-junit',
};

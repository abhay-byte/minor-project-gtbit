module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!uuid/.*)',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'api/**/*.js',
    '!api/**/__tests__/**',
    '!**/node_modules/**',
 ],
};
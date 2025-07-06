// E2E Test Setup
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs-test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRATION_TIME = '1h';

// Increase timeout for all tests
jest.setTimeout(60000);

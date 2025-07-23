// E2E Test Setup
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs-test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRATION_TIME = '1h';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_REFRESH_EXPIRATION_TIME = '7d';

// Required encryption keys for email handling
process.env.EMAIL_ENCRYPTION_KEY = 'test-encryption-key-32-characters-long';
process.env.EMAIL_BLIND_INDEX_SECRET = 'test-blind-index-secret-32-chars';

// Increase timeout for all tests
jest.setTimeout(60000);

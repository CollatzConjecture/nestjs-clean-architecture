import * as constants from '@constants';

describe('Constants', () => {
  it('should have database constants defined', () => {
    expect(constants.DB_PROVIDER).toBe('DbConnectionToken');
    expect(constants.PROFILE_MODEL_PROVIDER).toBe('ProfileModelProvider');
    expect(constants.AUTH_MODEL_PROVIDER).toBe('AuthModelProvider');
    expect(constants.SERVICE).toBe('DB_MONGO_SERVICE');
    expect(constants.DATABASE_SERVICE).toBeDefined();
  });

  it('should have application constants defined', () => {
    expect(constants.APP_NAME).toBeDefined();
    expect(constants.APP_PORT).toBeDefined();
    expect(constants.APP_HOST).toBeDefined();
    expect(constants.NODE_ENV).toBeDefined();
  });

  it('should have MongoDB constants defined', () => {
    expect(constants.MONGODB_URI).toBeDefined();
    expect(constants.MONGO_PORT).toBeDefined();
  });

  it('should have JWT constants defined', () => {
    expect(constants.JWT_SECRET).toBeDefined();
    expect(constants.JWT_REFRESH_SECRET).toBeDefined();
    expect(constants.JWT_EXPIRATION_TIME).toBeDefined();
    expect(constants.JWT_REFRESH_EXPIRATION_TIME).toBeDefined();
  });

  it('should have encryption constants defined', () => {
    expect(constants.EMAIL_ENCRYPTION_KEY).toBeDefined();
    expect(constants.EMAIL_BLIND_INDEX_SECRET).toBeDefined();
  });

  it('should have Grafana constants defined', () => {
    expect(constants.GRAFANA_USER).toBeDefined();
    expect(constants.GRAFANA_PASSWORD).toBeDefined();
  });

  it('should have Prometheus constants defined', () => {
    expect(constants.PROMETHEUS_PORT).toBeDefined();
    expect(constants.GRAFANA_PORT).toBeDefined();
  });

  it('should have correct default values', () => {
    // Test some default values when env vars are not set
    expect(typeof constants.APP_PORT).toBe('number');
    expect(typeof constants.MONGO_PORT).toBe('number');
    expect(typeof constants.PROMETHEUS_PORT).toBe('number');
    expect(typeof constants.GRAFANA_PORT).toBe('number');
  });
});
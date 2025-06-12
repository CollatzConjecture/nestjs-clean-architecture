import * as dotenv from 'dotenv';
dotenv.config();

// Database Constants
export const DB_PROVIDER = 'DbConnectionToken';
export const USER_MODEL_PROVIDER = 'UserModelProvider';
export const SERVICE = 'DB_MONGO_SERVICE';
export const DATABASE_SERVICE = process.env.DATABASE_SERVICE || 'DATABASE_SERVICE';

// Application Constants
export const APP_NAME = process.env.APP_NAME || 'clean.architecture';
export const APP_PORT = parseInt(process.env.PORT || '4000', 10);
export const APP_HOST = process.env.APP_HOST || '0.0.0.0';
export const NODE_ENV = process.env.NODE_ENV || 'development';

// MongoDB Constants
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs';
export const MONGO_PORT = parseInt(process.env.MONGO_PORT || '27017', 10);

// Grafana Constants
export const GRAFANA_USER = process.env.GRAFANA_USER || 'admin';
export const GRAFANA_PASSWORD = process.env.GRAFANA_PASSWORD || 'admin';

// Prometheus Constants
export const PROMETHEUS_PORT = parseInt(process.env.PROMETHEUS_PORT || '9090', 10);
export const GRAFANA_PORT = parseInt(process.env.GRAFANA_PORT || '3000', 10);
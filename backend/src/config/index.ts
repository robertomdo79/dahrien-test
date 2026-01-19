import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // Application
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiKey: process.env.API_KEY || 'dev-api-key',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/workspace_reservation?schema=public',

  // MQTT
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    clientId: process.env.MQTT_CLIENT_ID || 'workspace-reservation-api',
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    telemetryTopic: process.env.MQTT_TELEMETRY_TOPIC || 'coworking/+/+/telemetry',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',

  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultPageSize: 10,
    maxPageSize: 100,
  },

  // Business rules
  businessRules: {
    maxReservationsPerWeek: 3,
  },
} as const;

export type Config = typeof config;

import { createApp } from './app.js';
import { config } from './config/index.js';
import { getPrismaClient, disconnectPrisma } from './config/database.js';
import { mqttService } from './services/mqtt.service.js';
import { telemetryGeneratorService } from './services/telemetry-generator.service.js';
import { logger } from './utils/logger.js';

/**
 * Main entry point for the Workspace Reservation API
 */
async function main(): Promise<void> {
  try {
    // Initialize database connection
    logger.info('Connecting to database...');
    const prisma = getPrismaClient();
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Create Express application
    const app = createApp();

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📍 Environment: ${config.env}`);
      logger.info(`📋 API available at http://localhost:${config.port}/api`);
      logger.info(`❤️  Health check at http://localhost:${config.port}/health`);
    });

    // Connect to MQTT broker for IoT integration
    if (config.mqtt.brokerUrl) {
      try {
        await mqttService.connect();
        logger.info('📡 MQTT connected for IoT telemetry');
      } catch (error) {
        // MQTT connection is optional, don't fail if it's not available
        logger.warn('Could not connect to MQTT broker. IoT features disabled.', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Start telemetry generator for IoT data simulation
    // This generates realistic sensor data for all spaces every 30 minutes
    logger.info('🔄 Starting telemetry generator (30 minute intervals)...');
    telemetryGeneratorService.start();

    // Graceful shutdown handler
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      // Stop telemetry generator
      telemetryGeneratorService.stop();

      // Close HTTP server
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Disconnect from MQTT
      await mqttService.disconnect();

      // Disconnect from database
      await disconnectPrisma();

      logger.info('Graceful shutdown completed');
      process.exit(0);
    };

    // Register shutdown handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
    });

  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

// Start the application
main();

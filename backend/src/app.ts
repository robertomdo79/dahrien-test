import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { authMiddleware, errorHandler, notFoundHandler } from './middlewares/index.js';
import { logger } from './utils/logger.js';
import { config } from './config/index.js';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: config.env === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') 
      : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware
  app.use((req: Request, _res, next) => {
    logger.debug(`${req.method} ${req.path}`, {
      query: req.query,
      ip: req.ip,
    });
    next();
  });

  // Health check endpoint (public)
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.env,
      },
    });
  });

  // API info endpoint (public)
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        name: 'Workspace Reservation API',
        version: '1.0.0',
        description: 'API for managing reservations in a co-working space',
        documentation: '/api',
        health: '/health',
      },
    });
  });

  // Apply authentication middleware to API routes
  app.use('/api', authMiddleware, routes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp;

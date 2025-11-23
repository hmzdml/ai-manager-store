/**
 * AI Store Manager - Main Entry Point
 * 
 * This file starts the Express server that powers the admin dashboard API.
 * The server handles all API requests for managing the Shopify store automation.
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { logger } from './utils/logger';
import { prisma } from './db/prisma';

// Import routes
import { healthRouter } from './routes/health';
import { configRouter } from './routes/config';
import { automationRouter } from './routes/automation';
import { productsRouter } from './routes/products';
import { categoriesRouter } from './routes/categories';
import { gmcRouter } from './routes/gmc';
import { adsRouter } from './routes/ads';
import { seoRouter } from './routes/seo';
import { socialRouter } from './routes/social';
import { analyticsRouter } from './routes/analytics';
import { logsRouter } from './routes/logs';

const app = express();
const PORT = process.env.PORT || 3001;

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// CORS - allow frontend to connect
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================

app.use('/api/health', healthRouter);
app.use('/api/config', configRouter);
app.use('/api/automation', automationRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/gmc', gmcRouter);
app.use('/api/ads', adsRouter);
app.use('/api/seo', seoRouter);
app.use('/api/social', socialRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/logs', logsRouter);

// ==================== ERROR HANDLING ====================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ==================== START SERVER ====================

const server = createServer(app);

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✓ Database connected');

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`✓ API available at http://localhost:${PORT}/api`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('✓ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('✓ Server closed');
    process.exit(0);
  });
});

startServer();

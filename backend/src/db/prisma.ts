/**
 * Prisma Database Client
 * Single instance to be used throughout the application
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Create Prisma client with logging
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Log database queries in development
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Query ${params.model}.${params.action} took ${after - before}ms`);
  }
  
  return result;
});

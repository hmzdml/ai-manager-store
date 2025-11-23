/**
 * Sync Products Job
 * Synchronizes all products from Shopify to local database
 */

import { syncAllProducts } from '../../services/shopify.service';
import { logger } from '../../utils/logger';
import { prisma } from '../../db/prisma';

export async function syncProductsJob(data: any) {
  const startTime = Date.now();
  
  try {
    logger.info('Syncing products from Shopify...');
    
    const count = await syncAllProducts();
    
    const duration = Date.now() - startTime;
    
    await prisma.activityLog.create({
      data: {
        module: 'shopify',
        action: 'sync_products',
        status: 'success',
        message: `Synced ${count} products from Shopify`,
        duration,
      },
    });
    
    logger.info(`✓ Product sync completed: ${count} products in ${duration}ms`);
    
    return { success: true, count, duration };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('Product sync failed:', error);
    
    await prisma.activityLog.create({
      data: {
        module: 'shopify',
        action: 'sync_products',
        status: 'error',
        message: `Product sync failed: ${error.message}`,
        duration,
      },
    });
    
    throw error;
  }
}

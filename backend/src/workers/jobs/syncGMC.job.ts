/**
 * Sync Google Merchant Center Job
 * Syncs products to GMC and fetches error/warning information
 */

import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';
import { suggestGMCFix, ProductData } from '../../services/ai.service';

export async function syncGMCJob(data: any) {
  const startTime = Date.now();
  
  try {
    logger.info('Starting Google Merchant Center sync...');
    
    // TODO: Implement actual GMC API integration
    // For now, we'll create a mock implementation
    
    // Get active products
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      take: 100,
    });
    
    let processedCount = 0;
    let issuesFound = 0;
    
    for (const product of products) {
      try {
        // Mock: Simulate GMC status check
        // In real implementation, use Google Content API for Shopping
        
        const mockIssues = [];
        
        // Check for common GMC issues
        if (!product.productType) {
          mockIssues.push({
            severity: 'warning',
            description: 'Missing product_type attribute',
          });
        }
        
        if (!product.description || product.description.length < 50) {
          mockIssues.push({
            severity: 'warning',
            description: 'Product description is too short',
          });
        }
        
        const status = mockIssues.length > 0 ? 'warning' : 'approved';
        
        // Save or update GMC status
        await prisma.googleMerchantProduct.upsert({
          where: { productId: product.id },
          create: {
            productId: product.id,
            status,
            issues: mockIssues,
          },
          update: {
            status,
            issues: mockIssues,
          },
        });
        
        // If there are issues, get AI fix suggestion
        if (mockIssues.length > 0 && !product.aiLocked) {
          const productData: ProductData = {
            id: product.id,
            title: product.title,
            description: product.description || undefined,
            productType: product.productType || undefined,
            tags: product.tags,
          };
          
          const fixSuggestion = await suggestGMCFix(productData, mockIssues);
          
          await prisma.googleMerchantProduct.update({
            where: { productId: product.id },
            data: { fixSuggestion },
          });
          
          issuesFound++;
        }
        
        processedCount++;
        
      } catch (error: any) {
        logger.error(`Failed to process GMC status for ${product.id}:`, error);
      }
    }
    
    const duration = Date.now() - startTime;
    
    await prisma.activityLog.create({
      data: {
        module: 'gmc',
        action: 'sync',
        status: 'success',
        message: `Processed ${processedCount} products, found ${issuesFound} with issues`,
        duration,
        metadata: { processedCount, issuesFound },
      },
    });
    
    logger.info(`✓ GMC sync completed: ${processedCount} products in ${duration}ms`);
    
    return { success: true, count: processedCount, issuesFound, duration };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('GMC sync job failed:', error);
    
    await prisma.activityLog.create({
      data: {
        module: 'gmc',
        action: 'sync',
        status: 'error',
        message: `GMC sync failed: ${error.message}`,
        duration,
      },
    });
    
    throw error;
  }
}

/**
 * Improve Content Job
 * Uses AI to improve product titles, descriptions, and SEO metadata
 */

import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';
import { improveProductContent, ProductData } from '../../services/ai.service';
import { updateProduct } from '../../services/shopify.service';

export async function improveContentJob(data: any) {
  const startTime = Date.now();
  const batchSize = parseInt(process.env.AI_BATCH_SIZE || '20');
  
  try {
    logger.info('Starting AI content improvement...');
    
    // Find products that need content improvement
    // Priority: products with short/poor descriptions
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        aiManaged: true,
        aiLocked: false,
        OR: [
          { description: null },
          { description: { contains: '' } },
        ],
      },
      take: batchSize,
    });
    
    if (products.length === 0) {
      logger.info('No products need content improvement');
      return { success: true, count: 0 };
    }
    
    logger.info(`Improving content for ${products.length} products...`);
    
    let improvedCount = 0;
    let autoAppliedCount = 0;
    
    for (const product of products) {
      try {
        const productData: ProductData = {
          id: product.id,
          title: product.title,
          description: product.description || undefined,
          vendor: product.vendor || undefined,
          productType: product.productType || undefined,
          tags: product.tags,
          price: product.price || undefined,
          images: product.images,
        };
        
        // Get AI improvements
        const improved = await improveProductContent(productData);
        
        // Save improvement suggestions
        await prisma.productContentHistory.createMany({
          data: [
            {
              productId: product.id,
              field: 'title',
              originalValue: product.title,
              improvedValue: improved.title,
              aiModel: process.env.OPENAI_MODEL || 'gpt-4',
              aiReasoning: improved.reasoning,
            },
            {
              productId: product.id,
              field: 'description',
              originalValue: product.description || '',
              improvedValue: improved.description,
              aiModel: process.env.OPENAI_MODEL || 'gpt-4',
              aiReasoning: improved.reasoning,
            },
          ],
        });
        
        // Check if auto-apply is enabled
        const config = await prisma.config.findUnique({
          where: { key: 'content_auto_apply' },
        });
        
        const autoApply = config?.value === 'true';
        
        if (autoApply) {
          // Apply improvements to Shopify
          await updateProduct(product.id, {
            title: improved.title,
            body_html: improved.description,
            metafields_global_title_tag: improved.metaTitle,
            metafields_global_description_tag: improved.metaDescription,
          });
          
          // Mark as applied
          await prisma.productContentHistory.updateMany({
            where: {
              productId: product.id,
              applied: false,
            },
            data: {
              applied: true,
              appliedAt: new Date(),
            },
          });
          
          autoAppliedCount++;
        }
        
        improvedCount++;
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error: any) {
        logger.error(`Failed to improve content for ${product.id}:`, error);
      }
    }
    
    const duration = Date.now() - startTime;
    
    await prisma.activityLog.create({
      data: {
        module: 'ai',
        action: 'improve_content',
        status: 'success',
        message: `Improved content for ${improvedCount} products (${autoAppliedCount} auto-applied)`,
        duration,
        metadata: { improvedCount, autoAppliedCount },
      },
    });
    
    logger.info(`✓ Content improvement completed: ${improvedCount} products in ${duration}ms`);
    
    return { success: true, count: improvedCount, autoApplied: autoAppliedCount, duration };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('Content improvement job failed:', error);
    
    await prisma.activityLog.create({
      data: {
        module: 'ai',
        action: 'improve_content',
        status: 'error',
        message: `Content improvement failed: ${error.message}`,
        duration,
      },
    });
    
    throw error;
  }
}

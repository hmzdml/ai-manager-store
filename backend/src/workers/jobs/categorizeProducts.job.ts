/**
 * Categorize Products Job
 * Uses AI to categorize uncategorized or outdated products
 */

import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';
import { categorizeProducts, ProductData } from '../../services/ai.service';
import { createCollection, addProductToCollection } from '../../services/shopify.service';

export async function categorizeProductsJob(data: any) {
  const startTime = Date.now();
  const batchSize = parseInt(process.env.AI_BATCH_SIZE || '30');
  
  try {
    logger.info('Starting AI product categorization...');
    
    // Find products that need categorization
    // - Products without categorization
    // - Products not AI-locked
    // - Active products
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        aiManaged: true,
        aiLocked: false,
        categorization: null,
      },
      take: batchSize,
    });
    
    if (products.length === 0) {
      logger.info('No products need categorization');
      return { success: true, count: 0 };
    }
    
    logger.info(`Categorizing ${products.length} products...`);
    
    // Convert to AI format
    const productData: ProductData[] = products.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description || undefined,
      vendor: p.vendor || undefined,
      productType: p.productType || undefined,
      tags: p.tags,
      price: p.price || undefined,
      images: p.images,
    }));
    
    // Call AI to categorize
    const results = await categorizeProducts(productData);
    
    let categorizedCount = 0;
    const categoriesSeen = new Set<string>();
    
    // Save categorization results
    for (const [productId, result] of results.entries()) {
      if (!result) continue;
      
      try {
        await prisma.productCategory.create({
          data: {
            productId,
            mainCategory: result.mainCategory,
            subCategory: result.subCategory,
            aiTags: result.aiTags,
            googleCategory: result.googleCategory,
            confidence: result.confidence,
            reasoning: result.reasoning,
          },
        });
        
        categoriesSeen.add(result.mainCategory);
        categorizedCount++;
        
      } catch (error: any) {
        logger.error(`Failed to save categorization for ${productId}:`, error);
      }
    }
    
    // Create/update Shopify collections for new categories
    for (const category of categoriesSeen) {
      try {
        // Check if collection exists
        const existing = await prisma.collection.findFirst({
          where: { title: category },
        });
        
        if (!existing) {
          logger.info(`Creating collection for category: ${category}`);
          await createCollection({
            title: category,
            handle: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: `Products in the ${category} category`,
          });
        }
      } catch (error: any) {
        logger.error(`Failed to create collection for ${category}:`, error);
      }
    }
    
    const duration = Date.now() - startTime;
    
    await prisma.activityLog.create({
      data: {
        module: 'ai',
        action: 'categorize_products',
        status: 'success',
        message: `Categorized ${categorizedCount} products`,
        duration,
        metadata: { categorizedCount, uniqueCategories: categoriesSeen.size },
      },
    });
    
    logger.info(`✓ Categorization completed: ${categorizedCount} products in ${duration}ms`);
    
    return { success: true, count: categorizedCount, duration };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('Categorization job failed:', error);
    
    await prisma.activityLog.create({
      data: {
        module: 'ai',
        action: 'categorize_products',
        status: 'error',
        message: `Categorization failed: ${error.message}`,
        duration,
      },
    });
    
    throw error;
  }
}

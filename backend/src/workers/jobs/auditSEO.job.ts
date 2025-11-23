/**
 * SEO Audit Job
 * Audits products and pages for SEO issues and generates improvement suggestions
 */

import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';

export async function auditSEOJob(data: any) {
  const startTime = Date.now();
  
  try {
    logger.info('Starting SEO audit...');
    
    // Audit products
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      take: 200,
    });
    
    let auditedCount = 0;
    let issuesFound = 0;
    
    for (const product of products) {
      try {
        let score = 100;
        let missingTitle = false;
        let missingMetaDesc = false;
        let thinContent = false;
        
        // Check for SEO issues
        if (!product.title || product.title.length < 10) {
          score -= 30;
          missingTitle = true;
        }
        
        if (!product.description || product.description.length < 100) {
          score -= 25;
          thinContent = true;
        }
        
        // Title length check
        if (product.title.length > 70) {
          score -= 10;
        }
        
        // Check for duplicate keywords
        if (product.tags.length === 0) {
          score -= 15;
        }
        
        // Generate suggestions if score is low
        let suggestedTitle = null;
        let suggestedMetaDesc = null;
        
        if (score < 70) {
          // Simple suggestions (in real implementation, use AI)
          if (missingTitle || product.title.length < 20) {
            suggestedTitle = `${product.title} - ${product.vendor || 'Premium'} | Shop Now`;
          }
          
          if (thinContent && product.description) {
            suggestedMetaDesc = product.description.slice(0, 160);
          }
        }
        
        // Save audit result
        await prisma.seoAudit.create({
          data: {
            url: `/products/${product.handle}`,
            type: 'product',
            resourceId: product.id,
            missingTitle,
            missingMetaDesc,
            thinContent,
            score,
            suggestedTitle,
            suggestedMetaDesc,
          },
        });
        
        if (score < 70) issuesFound++;
        auditedCount++;
        
      } catch (error: any) {
        logger.error(`Failed to audit product ${product.id}:`, error);
      }
    }
    
    // Audit collections
    const collections = await prisma.collection.findMany({
      take: 50,
    });
    
    for (const collection of collections) {
      try {
        let score = 100;
        
        if (!collection.description || collection.description.length < 100) {
          score -= 30;
        }
        
        if (collection.title.length > 60) {
          score -= 10;
        }
        
        await prisma.seoAudit.create({
          data: {
            url: `/collections/${collection.handle}`,
            type: 'collection',
            resourceId: collection.id,
            missingMetaDesc: !collection.description,
            score,
          },
        });
        
        auditedCount++;
        
      } catch (error: any) {
        logger.error(`Failed to audit collection ${collection.id}:`, error);
      }
    }
    
    const duration = Date.now() - startTime;
    
    await prisma.activityLog.create({
      data: {
        module: 'seo',
        action: 'audit',
        status: 'success',
        message: `Audited ${auditedCount} resources, found ${issuesFound} with issues`,
        duration,
        metadata: { auditedCount, issuesFound },
      },
    });
    
    logger.info(`✓ SEO audit completed: ${auditedCount} resources in ${duration}ms`);
    
    return { success: true, count: auditedCount, issuesFound, duration };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('SEO audit job failed:', error);
    
    await prisma.activityLog.create({
      data: {
        module: 'seo',
        action: 'audit',
        status: 'error',
        message: `SEO audit failed: ${error.message}`,
        duration,
      },
    });
    
    throw error;
  }
}

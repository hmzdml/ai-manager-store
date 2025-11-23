/**
 * Background Workers System
 * 
 * This file sets up and manages all background jobs for automation:
 * - Product synchronization from Shopify
 * - AI categorization
 * - AI content improvement
 * - Google Merchant Center sync
 * - SEO audits
 * - Social media posting
 * - Ad campaign optimization
 * 
 * Jobs are scheduled using cron expressions and run automatically
 */

import dotenv from 'dotenv';
dotenv.config();

import { Queue, Worker, QueueScheduler } from 'bullmq';
import Redis from 'ioredis';
import { CronJob } from 'cron';
import { logger } from '../utils/logger';
import { prisma } from '../db/prisma';

// Import job processors
import { syncProductsJob } from './jobs/syncProducts.job';
import { categorizeProductsJob } from './jobs/categorizeProducts.job';
import { improveContentJob } from './jobs/improveContent.job';
import { syncGMCJob } from './jobs/syncGMC.job';
import { auditSEOJob } from './jobs/auditSEO.job';
import { postSocialMediaJob } from './jobs/postSocialMedia.job';
import { optimizeAdsJob } from './jobs/optimizeAds.job';

// ==================== REDIS CONNECTION ====================

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redisConnection.on('connect', () => {
  logger.info('✓ Redis connected');
});

// ==================== JOB QUEUES ====================

const queues = {
  syncProducts: new Queue('sync-products', { connection: redisConnection }),
  categorizeProducts: new Queue('categorize-products', { connection: redisConnection }),
  improveContent: new Queue('improve-content', { connection: redisConnection }),
  syncGMC: new Queue('sync-gmc', { connection: redisConnection }),
  auditSEO: new Queue('audit-seo', { connection: redisConnection }),
  postSocialMedia: new Queue('post-social-media', { connection: redisConnection }),
  optimizeAds: new Queue('optimize-ads', { connection: redisConnection }),
};

// ==================== WORKERS ====================

// Sync Products Worker
new Worker('sync-products', async (job) => {
  logger.info('Starting sync products job...');
  return await syncProductsJob(job.data);
}, { connection: redisConnection });

// Categorize Products Worker
new Worker('categorize-products', async (job) => {
  logger.info('Starting categorize products job...');
  return await categorizeProductsJob(job.data);
}, { connection: redisConnection });

// Improve Content Worker
new Worker('improve-content', async (job) => {
  logger.info('Starting improve content job...');
  return await improveContentJob(job.data);
}, { connection: redisConnection });

// Sync GMC Worker
new Worker('sync-gmc', async (job) => {
  logger.info('Starting GMC sync job...');
  return await syncGMCJob(job.data);
}, { connection: redisConnection });

// SEO Audit Worker
new Worker('audit-seo', async (job) => {
  logger.info('Starting SEO audit job...');
  return await auditSEOJob(job.data);
}, { connection: redisConnection });

// Social Media Worker
new Worker('post-social-media', async (job) => {
  logger.info('Starting social media posting job...');
  return await postSocialMediaJob(job.data);
}, { connection: redisConnection });

// Optimize Ads Worker
new Worker('optimize-ads', async (job) => {
  logger.info('Starting ad optimization job...');
  return await optimizeAdsJob(job.data);
}, { connection: redisConnection });

logger.info('✓ All workers started');

// ==================== SCHEDULED JOBS ====================

async function checkAutomationEnabled(): Promise<boolean> {
  const control = await prisma.automationControl.findFirst();
  
  if (!control) return true;
  
  if (!control.masterEnabled) return false;
  
  if (control.pausedUntil && control.pausedUntil > new Date()) {
    return false;
  }
  
  return true;
}

// Sync products every 6 hours (default)
const syncProductsCron = new CronJob(
  process.env.SYNC_PRODUCTS_CRON || '0 */6 * * *',
  async () => {
    const enabled = await checkAutomationEnabled();
    const control = await prisma.automationControl.findFirst();
    
    if (enabled && control?.shopifySync) {
      logger.info('Triggering scheduled product sync...');
      await queues.syncProducts.add('scheduled-sync', {});
    }
  },
  null,
  true,
  'America/New_York'
);

// Categorize products daily at 2 AM (default)
const categorizeProductsCron = new CronJob(
  process.env.CATEGORIZE_PRODUCTS_CRON || '0 2 * * *',
  async () => {
    const enabled = await checkAutomationEnabled();
    const control = await prisma.automationControl.findFirst();
    
    if (enabled && control?.aiCategorization) {
      logger.info('Triggering scheduled product categorization...');
      await queues.categorizeProducts.add('scheduled-categorization', {});
    }
  },
  null,
  true,
  'America/New_York'
);

// Improve content daily at 3 AM (default)
const improveContentCron = new CronJob(
  process.env.IMPROVE_CONTENT_CRON || '0 3 * * *',
  async () => {
    const enabled = await checkAutomationEnabled();
    const control = await prisma.automationControl.findFirst();
    
    if (enabled && control?.aiContentImprovement) {
      logger.info('Triggering scheduled content improvement...');
      await queues.improveContent.add('scheduled-improvement', {});
    }
  },
  null,
  true,
  'America/New_York'
);

// Sync GMC every 4 hours (default)
const syncGMCCron = new CronJob(
  process.env.SYNC_GMC_CRON || '0 */4 * * *',
  async () => {
    const enabled = await checkAutomationEnabled();
    const control = await prisma.automationControl.findFirst();
    
    if (enabled && control?.googleMerchant) {
      logger.info('Triggering scheduled GMC sync...');
      await queues.syncGMC.add('scheduled-gmc-sync', {});
    }
  },
  null,
  true,
  'America/New_York'
);

// SEO audit weekly on Sunday at 4 AM (default)
const auditSEOCron = new CronJob(
  process.env.AUDIT_SEO_CRON || '0 4 * * 0',
  async () => {
    const enabled = await checkAutomationEnabled();
    const control = await prisma.automationControl.findFirst();
    
    if (enabled && control?.seoAutomation) {
      logger.info('Triggering scheduled SEO audit...');
      await queues.auditSEO.add('scheduled-seo-audit', {});
    }
  },
  null,
  true,
  'America/New_York'
);

// Social media posting twice daily (default: 9 AM and 3 PM)
const postSocialMediaCron = new CronJob(
  process.env.POST_SOCIAL_MEDIA_CRON || '0 9,15 * * *',
  async () => {
    const enabled = await checkAutomationEnabled();
    const control = await prisma.automationControl.findFirst();
    
    if (enabled && control?.socialMediaPosting) {
      logger.info('Triggering scheduled social media posting...');
      await queues.postSocialMedia.add('scheduled-social-post', {});
    }
  },
  null,
  true,
  'America/New_York'
);

logger.info('✓ All cron jobs scheduled');

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing workers...');
  
  syncProductsCron.stop();
  categorizeProductsCron.stop();
  improveContentCron.stop();
  syncGMCCron.stop();
  auditSEOCron.stop();
  postSocialMediaCron.stop();
  
  await redisConnection.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing workers...');
  
  syncProductsCron.stop();
  categorizeProductsCron.stop();
  improveContentCron.stop();
  syncGMCCron.stop();
  auditSEOCron.stop();
  postSocialMediaCron.stop();
  
  await redisConnection.quit();
  process.exit(0);
});

// Export queues for manual triggering from API
export { queues };

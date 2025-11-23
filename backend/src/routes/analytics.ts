/**
 * Analytics Routes
 */

import { Router } from 'express';
import { prisma } from '../db/prisma';
import { getOrdersStats } from '../services/shopify.service';

export const analyticsRouter = Router();

// Get dashboard overview
analyticsRouter.get('/dashboard', async (req, res) => {
  try {
    const [
      productsCount,
      categorizedCount,
      activeAdsCount,
      scheduledPostsCount,
      recentLogs,
      aiUsage,
    ] = await Promise.all([
      prisma.product.count({ where: { status: 'active' } }),
      prisma.productCategory.count(),
      prisma.adCampaign.count({ where: { status: 'active' } }),
      prisma.socialPost.count({ where: { status: 'scheduled' } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.aiUsageSummary.findFirst({
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ]);

    // Get Shopify stats
    let shopifyStats;
    try {
      shopifyStats = await getOrdersStats(30);
    } catch (error) {
      shopifyStats = { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
    }

    res.json({
      products: {
        total: productsCount,
        categorized: categorizedCount,
      },
      ads: {
        active: activeAdsCount,
      },
      social: {
        scheduled: scheduledPostsCount,
      },
      shopify: shopifyStats,
      ai: {
        tokensUsedToday: aiUsage?.totalTokens || 0,
        costToday: aiUsage?.totalCost || 0,
      },
      recentActivity: recentLogs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI usage stats
analyticsRouter.get('/ai-usage', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    const usage = await prisma.aiUsageSummary.findMany({
      where: { date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    res.json(usage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

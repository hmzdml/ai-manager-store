/**
 * Advertising Campaigns Routes
 */

import { Router } from 'express';
import { prisma } from '../db/prisma';

export const adsRouter = Router();

// Get all campaigns
adsRouter.get('/campaigns', async (req, res) => {
  try {
    const { platform, status } = req.query;

    const where: any = {};
    if (platform) where.platform = platform;
    if (status) where.status = status;

    const campaigns = await prisma.adCampaign.findMany({
      where,
      include: {
        adSets: {
          include: {
            ads: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get campaign performance overview
adsRouter.get('/overview', async (req, res) => {
  try {
    const campaigns = await prisma.adCampaign.findMany({
      where: { status: 'active' },
    });

    const overview = {
      google: { campaigns: 0, spent: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
      meta: { campaigns: 0, spent: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
      tiktok: { campaigns: 0, spent: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
      microsoft: { campaigns: 0, spent: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
    };

    campaigns.forEach(c => {
      const platform = c.platform as keyof typeof overview;
      if (overview[platform]) {
        overview[platform].campaigns++;
        overview[platform].spent += c.spent;
        overview[platform].impressions += c.impressions;
        overview[platform].clicks += c.clicks;
        overview[platform].conversions += c.conversions;
        overview[platform].revenue += c.revenue;
      }
    });

    res.json(overview);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create campaign
adsRouter.post('/campaigns', async (req, res) => {
  try {
    const campaign = await prisma.adCampaign.create({
      data: req.body,
    });

    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve campaign
adsRouter.post('/campaigns/:id/approve', async (req, res) => {
  try {
    const campaign = await prisma.adCampaign.update({
      where: { id: req.params.id },
      data: { approved: true, approvedAt: new Date(), status: 'active' },
    });

    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pause campaign
adsRouter.post('/campaigns/:id/pause', async (req, res) => {
  try {
    const campaign = await prisma.adCampaign.update({
      where: { id: req.params.id },
      data: { status: 'paused' },
    });

    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

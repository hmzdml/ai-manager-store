/**
 * Automation Control Routes
 * Manage master switch and module-level automation controls
 */

import { Router } from 'express';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';

export const automationRouter = Router();

// Get automation status
automationRouter.get('/status', async (req, res) => {
  try {
    let control = await prisma.automationControl.findFirst();
    
    if (!control) {
      // Create default control settings
      control = await prisma.automationControl.create({
        data: {
          masterEnabled: true,
          shopifySync: true,
          aiCategorization: true,
          aiContentImprovement: true,
          googleMerchant: true,
          googleAds: false,
          metaAds: false,
          tiktokAds: false,
          microsoftAds: false,
          seoAutomation: true,
          socialMediaPosting: true,
        },
      });
    }

    res.json(control);
  } catch (error: any) {
    logger.error('Failed to get automation status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update automation settings
automationRouter.patch('/status', async (req, res) => {
  try {
    const updates = req.body;

    let control = await prisma.automationControl.findFirst();
    
    if (!control) {
      control = await prisma.automationControl.create({
        data: updates,
      });
    } else {
      control = await prisma.automationControl.update({
        where: { id: control.id },
        data: updates,
      });
    }

    logger.info('Automation settings updated:', updates);

    await prisma.activityLog.create({
      data: {
        module: 'automation',
        action: 'update_settings',
        status: 'success',
        message: 'Automation settings updated',
        metadata: updates,
      },
    });

    res.json(control);
  } catch (error: any) {
    logger.error('Failed to update automation status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pause all automations
automationRouter.post('/pause', async (req, res) => {
  try {
    const { duration } = req.body; // 'hours' or ISO date string
    
    let pausedUntil: Date | null = null;
    
    if (duration === 'indefinite') {
      pausedUntil = new Date('2099-12-31');
    } else if (typeof duration === 'number') {
      pausedUntil = new Date();
      pausedUntil.setHours(pausedUntil.getHours() + duration);
    }

    let control = await prisma.automationControl.findFirst();
    
    if (!control) {
      control = await prisma.automationControl.create({
        data: {
          masterEnabled: false,
          pausedUntil,
        },
      });
    } else {
      control = await prisma.automationControl.update({
        where: { id: control.id },
        data: {
          masterEnabled: false,
          pausedUntil,
        },
      });
    }

    logger.info(`Automation paused until ${pausedUntil?.toISOString()}`);

    res.json({ message: 'Automation paused', pausedUntil });
  } catch (error: any) {
    logger.error('Failed to pause automation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resume automations
automationRouter.post('/resume', async (req, res) => {
  try {
    let control = await prisma.automationControl.findFirst();
    
    if (control) {
      control = await prisma.automationControl.update({
        where: { id: control.id },
        data: {
          masterEnabled: true,
          pausedUntil: null,
        },
      });
    }

    logger.info('Automation resumed');

    res.json({ message: 'Automation resumed' });
  } catch (error: any) {
    logger.error('Failed to resume automation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Google Merchant Center Routes
 */

import { Router } from 'express';
import { prisma } from '../db/prisma';

export const gmcRouter = Router();

// Get GMC health overview
gmcRouter.get('/health', async (req, res) => {
  try {
    const stats = await prisma.googleMerchantProduct.groupBy({
      by: ['status'],
      _count: true,
    });

    const health: any = {
      approved: 0,
      disapproved: 0,
      warning: 0,
    };

    stats.forEach(s => {
      health[s.status] = s._count;
    });

    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get products with issues
gmcRouter.get('/issues', async (req, res) => {
  try {
    const products = await prisma.googleMerchantProduct.findMany({
      where: {
        status: { in: ['disapproved', 'warning'] },
      },
      include: {
        product: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Apply fix suggestion
gmcRouter.post('/:id/apply-fix', async (req, res) => {
  try {
    const gmcProduct = await prisma.googleMerchantProduct.findUnique({
      where: { id: req.params.id },
    });

    if (!gmcProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Mark fix as applied
    await prisma.googleMerchantProduct.update({
      where: { id: req.params.id },
      data: { fixApplied: true, lastFixAttempt: new Date() },
    });

    res.json({ message: 'Fix applied' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

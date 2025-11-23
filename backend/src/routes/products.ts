/**
 * Products Routes
 */

import { Router } from 'express';
import { prisma } from '../db/prisma';
import { syncAllProducts, updateProduct } from '../services/shopify.service';
import { logger } from '../utils/logger';

export const productsRouter = Router();

// Get all products with filters
productsRouter.get('/', async (req, res) => {
  try {
    const { status, vendor, category, search, page = 1, limit = 50 } = req.query;

    const where: any = {};
    
    if (status) where.status = status;
    if (vendor) where.vendor = vendor;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      include: {
        categorization: true,
        gmcStatus: true,
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { shopifyUpdatedAt: 'desc' },
    });

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    logger.error('Failed to fetch products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product
productsRouter.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        categorization: true,
        contentHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        gmcStatus: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    logger.error('Failed to fetch product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync products from Shopify
productsRouter.post('/sync', async (req, res) => {
  try {
    const count = await syncAllProducts();
    res.json({ message: `Synced ${count} products`, count });
  } catch (error: any) {
    logger.error('Failed to sync products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product AI lock status
productsRouter.patch('/:id/lock', async (req, res) => {
  try {
    const { aiLocked } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { aiLocked },
    });

    res.json(product);
  } catch (error: any) {
    logger.error('Failed to update product lock:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apply content improvement
productsRouter.post('/:id/apply-content', async (req, res) => {
  try {
    const { historyId } = req.body;

    const history = await prisma.productContentHistory.findUnique({
      where: { id: historyId },
      include: { product: true },
    });

    if (!history) {
      return res.status(404).json({ error: 'Content history not found' });
    }

    // Update in Shopify
    const updates: any = {};
    if (history.field === 'title') updates.title = history.improvedValue;
    if (history.field === 'description') updates.body_html = history.improvedValue;

    if (Object.keys(updates).length > 0) {
      await updateProduct(history.productId, updates);
    }

    // Mark as applied
    await prisma.productContentHistory.update({
      where: { id: historyId },
      data: { applied: true, appliedAt: new Date() },
    });

    res.json({ message: 'Content applied successfully' });
  } catch (error: any) {
    logger.error('Failed to apply content:', error);
    res.status(500).json({ error: error.message });
  }
});

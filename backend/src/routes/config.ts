/**
 * Configuration Routes
 */

import { Router } from 'express';
import { prisma } from '../db/prisma';

export const configRouter = Router();

// Get all config
configRouter.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const where: any = {};
    if (category) where.category = category;

    const configs = await prisma.config.findMany({ where });
    
    // Convert to key-value object
    const configObj: any = {};
    configs.forEach(c => {
      configObj[c.key] = c.value;
    });

    res.json(configObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update config
configRouter.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, category } = req.body;

    const config = await prisma.config.upsert({
      where: { key },
      create: { key, value, category: category || 'general' },
      update: { value },
    });

    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

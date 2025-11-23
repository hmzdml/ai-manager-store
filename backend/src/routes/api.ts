import { Router } from 'express';
import shopifyService from '../services/shopify';
import prisma from '../db/prismaClient';

const router = Router();

// Seed demo products from mock (one-time)
router.post('/seed', async (_req, res) => {
  const products = await shopifyService.listProducts();
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { title: p.title, vendor: p.vendor },
      create: { id: p.id, title: p.title, vendor: p.vendor }
    });
  }
  res.json({ ok: true, count: products.length });
});

router.get('/products', async (_req, res) => {
  const items = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
});

export default router;

/**
 * Categories Routes
 */

import { Router } from 'express';
import { prisma } from '../db/prisma';

export const categoriesRouter = Router();

// Get category tree
categoriesRouter.get('/tree', async (req, res) => {
  try {
    const categories = await prisma.productCategory.groupBy({
      by: ['mainCategory', 'subCategory'],
      _count: true,
    });

    // Build tree structure
    const tree: any = {};
    
    categories.forEach(cat => {
      if (!tree[cat.mainCategory]) {
        tree[cat.mainCategory] = {
          name: cat.mainCategory,
          count: 0,
          subCategories: {},
        };
      }
      
      tree[cat.mainCategory].count += cat._count;
      
      if (cat.subCategory) {
        tree[cat.mainCategory].subCategories[cat.subCategory] = cat._count;
      }
    });

    res.json(tree);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
categoriesRouter.get('/:mainCategory', async (req, res) => {
  try {
    const { mainCategory } = req.params;
    const { subCategory } = req.query;

    const where: any = { mainCategory };
    if (subCategory) where.subCategory = subCategory;

    const categories = await prisma.productCategory.findMany({
      where,
      include: {
        product: true,
      },
    });

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

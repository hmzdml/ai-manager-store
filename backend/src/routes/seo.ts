/**
 * SEO Routes
 */

import { Router } from 'express';
import { prisma } from '../db/prisma';

export const seoRouter = Router();

// Get SEO health overview
seoRouter.get('/health', async (req, res) => {
  try {
    const audits = await prisma.seoAudit.findMany({
      where: { fixed: false },
      orderBy: { score: 'asc' },
      take: 50,
    });

    const stats = {
      totalIssues: audits.length,
      averageScore: audits.reduce((sum, a) => sum + a.score, 0) / (audits.length || 1),
      missingTitles: audits.filter(a => a.missingTitle).length,
      missingDescriptions: audits.filter(a => a.missingMetaDesc).length,
      duplicates: audits.filter(a => a.duplicateTitle).length,
    };

    res.json({ stats, audits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get blog posts
seoRouter.get('/blog-posts', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create blog post
seoRouter.post('/blog-posts', async (req, res) => {
  try {
    const post = await prisma.blogPost.create({
      data: req.body,
    });

    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Apply SEO fix
seoRouter.post('/audits/:id/fix', async (req, res) => {
  try {
    const audit = await prisma.seoAudit.update({
      where: { id: req.params.id },
      data: { fixed: true, fixedAt: new Date() },
    });

    res.json(audit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

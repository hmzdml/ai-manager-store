/**
 * Social Media Routes
 */

import { Router } from 'express';
import { prisma } from '../db/prisma';

export const socialRouter = Router();

// Get scheduled posts
socialRouter.get('/posts', async (req, res) => {
  try {
    const { platform, status } = req.query;

    const where: any = {};
    if (platform) where.platform = platform;
    if (status) where.status = status;

    const posts = await prisma.socialPost.findMany({
      where,
      orderBy: { scheduledFor: 'asc' },
      take: 100,
    });

    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get content calendar
socialRouter.get('/calendar', async (req, res) => {
  try {
    const calendars = await prisma.contentCalendar.findMany();
    res.json(calendars);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update content calendar
socialRouter.put('/calendar/:platform', async (req, res) => {
  try {
    const calendar = await prisma.contentCalendar.upsert({
      where: { platform: req.params.platform },
      create: { platform: req.params.platform, ...req.body },
      update: req.body,
    });

    res.json(calendar);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create social post
socialRouter.post('/posts', async (req, res) => {
  try {
    const post = await prisma.socialPost.create({
      data: req.body,
    });

    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
socialRouter.patch('/posts/:id', async (req, res) => {
  try {
    const post = await prisma.socialPost.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post
socialRouter.delete('/posts/:id', async (req, res) => {
  try {
    await prisma.socialPost.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Post deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

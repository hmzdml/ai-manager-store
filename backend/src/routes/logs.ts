/**
 * Activity Logs Routes
 */

import { Router } from 'express';
import { prisma } from '../db/prisma';

export const logsRouter = Router();

// Get activity logs
logsRouter.get('/', async (req, res) => {
  try {
    const { module, status, page = 1, limit = 50 } = req.query;

    const where: any = {};
    if (module) where.module = module;
    if (status) where.status = status;

    const total = await prisma.activityLog.count({ where });
    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear old logs
logsRouter.delete('/cleanup', async (req, res) => {
  try {
    const { olderThanDays = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    res.json({ message: `Deleted ${result.count} old logs` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

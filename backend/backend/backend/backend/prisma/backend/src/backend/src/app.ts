import express from 'express';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import logger from './logger';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true, service: 'shopbot-starter' }));
app.use('/api', apiRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal error' });
});

export default app;

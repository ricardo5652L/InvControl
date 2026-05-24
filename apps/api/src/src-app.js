import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { router } from './routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'invcontrol-api' });
  });

  app.use('/api', router);

  app.use((req, res) => {
    res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.path}` });
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Error interno' });
  });

  return app;
}

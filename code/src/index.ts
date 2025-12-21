import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { logger } from './utils/logger';
import { initWhatsAppClient } from './wa/client';
import { adminRouter } from './admin/router';
import { gracefulShutdown } from './utils/graceful-shutdown';

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production' ? false : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin routes
app.use('/api/admin', adminRouter);

// Serve admin UI in production
if (process.env['NODE_ENV'] === 'production') {
  app.use(express.static('dist/admin'));
  app.get('*', (_req, res) => {
    res.sendFile('index.html', { root: 'dist/admin' });
  });
}

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env['PORT'] || 8080;

async function startServer() {
  try {
    // Initialize WhatsApp client
    await initWhatsAppClient();
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Admin UI available at http://localhost:${PORT}`);
    });

    // Graceful shutdown
    gracefulShutdown(server);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

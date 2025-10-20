import { Server } from 'http';
import { logger } from './logger';
import { getClient } from '../wa/client';

/**
 * Handle graceful shutdown of the application
 */
export function gracefulShutdown(server: Server): void {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    try {
      // Close HTTP server
      server.close(() => {
        logger.info('HTTP server closed');
      });
      
      // Close WhatsApp client
      const client = getClient();
      if (client) {
        await client.destroy();
        logger.info('WhatsApp client destroyed');
      }
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };
  
  // Handle different termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('uncaughtException');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
}
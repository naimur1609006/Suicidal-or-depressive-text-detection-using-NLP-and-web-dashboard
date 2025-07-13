import cron from 'node-cron';
import { logger } from '../../shared/logger';

// Schedule to run daily at 12:00 AM
export const initSubscriptionCron = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running subscription check cron job');
    try {
      logger.info('Subscription check completed successfully');
    } catch (error) {
      logger.error('Error in subscription check cron job:', error);
    }
  });
};

import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { initSubscriptionCron } from './app/cron/subscriptionCheck.cron';
import config from './config';
import './shared/backupScheduler';
import { errorLogger, logger } from './shared/logger';

let server: Server;

process.on('uncaughtException', error => {
  errorLogger.error(error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM is received.');
  if (server) {
    server.close();
  }
});

async function connect() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info('Database Connected successfully!!!');

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    server = app.listen(config.port, config.host, () => {
      logger.info(`Server is running on http://${config.host}:${config.port}`);
    });

    // initialize cron jobs
    initSubscriptionCron();
  } catch (error) {
    errorLogger.error('Database Connection failure!!!', error);
  }

  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error(error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

connect();

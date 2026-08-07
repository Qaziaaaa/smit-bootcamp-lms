import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import logger from './utils/logger.js';

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.stack}`);
  process.exit(1);
});

const start = async () => {
  await connectDB();

  app.listen(env.port, () => {
    logger.info(`API server running at http://localhost:${env.port} (${env.nodeEnv})`);
  });
};

start();

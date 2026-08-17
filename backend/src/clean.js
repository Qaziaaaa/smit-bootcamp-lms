// Clean script — run with `npm run clean` to drop ALL collections.
// Useful for starting fresh during development. Run `npm run seed` after.
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import logger from './utils/logger.js';

const run = async () => {
  try {
    await connectDB();
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      await mongoose.connection.db.dropCollection(col.name);
      logger.info(`Dropped: ${col.name}`);
    }
    logger.info('Database cleaned. Run "npm run seed" to re-seed admin + batch.');
    process.exit(0);
  } catch (err) {
    logger.error(`Clean failed: ${err.message}`);
    process.exit(1);
  }
};

run();

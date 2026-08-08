import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import env from './config/env.js';
import User from './models/user.model.js';
import logger from './utils/logger.js';

const ADMIN_EMAIL = 'admin@lms.com';
const ADMIN_PASSWORD = 'password123';

const seedAdmin = async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      logger.info('Admin user already exists. Skipping seed.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, env.bcryptRounds);
    await User.create({
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
    });

    logger.info(`Admin user seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    logger.error(`Seed failed: ${err.message}`);
    process.exit(1);
  }
};

seedAdmin();
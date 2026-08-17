import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import env from './config/env.js';
import User from './models/user.model.js';
import Batch from './models/batch.model.js';
import logger from './utils/logger.js';

const ADMIN_EMAIL = 'admin@lms.com';
const ADMIN_PASSWORD = 'admin12345';

const BATCH_NAME = 'Batch 2026';

const seedAdmin = async () => {
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    logger.info('Admin user already exists. Skipping admin seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, env.bcryptRounds);
  await User.create({ email: ADMIN_EMAIL, passwordHash, role: 'admin' });
  logger.info(`Admin user seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
};

const seedBatch = async () => {
  const existing = await Batch.findOne({ name: BATCH_NAME });
  if (existing) {
    logger.info(`Batch "${BATCH_NAME}" already exists. Skipping batch seed.`);
    return;
  }

  await Batch.create({
    name: BATCH_NAME,
    description: 'Saylani Mass IT Training Bootcamp 2026 cohort.',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    status: 'active',
  });
  logger.info(`Batch seeded: ${BATCH_NAME}`);
};

const run = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedBatch();
    logger.info('Seeding complete.');
    process.exit(0);
  } catch (err) {
    logger.error(`Seed failed: ${err.message}`);
    process.exit(1);
  }
};

run();

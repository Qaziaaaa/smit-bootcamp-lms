import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import env from './config/env.js';
import User from './models/user.model.js';
import Student from './models/student.model.js';
import Team from './models/team.model.js';
import Project from './models/project.model.js';
import Task from './models/task.model.js';
import Attendance from './models/attendance.model.js';
import Batch from './models/batch.model.js';
import logger from './utils/logger.js';

const ADMIN_EMAIL = 'admin@lms.com';
const ADMIN_PASSWORD = 'password123';

const DEMO_STUDENT_EMAIL = 'student@lms.com';
const DEMO_PASSWORD = 'password123';

const BATCH_NAME = 'Batch 2026';

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

const seedDemoStudent = async () => {
  const existingUser = await User.findOne({ email: DEMO_STUDENT_EMAIL });
  if (existingUser) {
    logger.info(`Demo student already exists (${DEMO_STUDENT_EMAIL}). Skipping demo seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, env.bcryptRounds);
  const user = await User.create({ email: DEMO_STUDENT_EMAIL, passwordHash, role: 'student' });

  const team = await Team.create({ name: 'Alpha' });
  const project = await Project.create({
    title: 'Bootcamp LMS Web App',
    description:
      'A full-stack Learning Management System for the bootcamp cohort, covering students, attendance, teams, projects, and tasks.',
    teamId: team._id,
    status: 'active',
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });
  await Team.findByIdAndUpdate(team._id, { projectId: project._id });

  const student = await Student.create({
    userId: user._id,
    name: 'Ali Ahmed',
    email: DEMO_STUDENT_EMAIL,
    phone: '+92 300 1234567',
    rollNo: 'ST-001',
    batch: 'Batch 2026',
    teamId: team._id,
    status: 'active',
  });

  const seedTasks = [
    { projectId: project._id, assignedTo: student._id, title: 'Design landing page', description: 'Build the public landing page from the Figma wireframes.', status: 'completed', priority: 'low', deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { projectId: project._id, assignedTo: student._id, title: 'Implement student login', description: 'Wire the login form to the auth API and persist the token.', status: 'completed', priority: 'high', deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { projectId: project._id, assignedTo: student._id, title: 'Build student dashboard UI', description: 'Dashboard with attendance, team, project, and task overview cards.', status: 'in-progress', priority: 'high', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { projectId: project._id, assignedTo: student._id, title: 'Integrate task progress updates', description: 'Allow students to move tasks forward through allowed statuses.', status: 'pending', priority: 'medium', deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    { projectId: project._id, assignedTo: student._id, title: 'Write API documentation', description: 'Keep API_DOCUMENTATION.md in sync with the implemented endpoints.', status: 'pending', priority: 'low', deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) },
  ];
  await Task.insertMany(seedTasks);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const records = [];
  for (let i = 0; i < 20; i++) {
    const day = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const weekday = day.getDay();
    if (weekday === 5 || weekday === 6) continue;
    const absent = i === 1 || i === 8;
    records.push({
      studentId: student._id,
      date: day,
      status: absent ? 'absent' : 'present',
      markedBy: user._id,
    });
  }
  await Attendance.insertMany(records);

  logger.info(`Demo student seeded: ${DEMO_STUDENT_EMAIL} / ${DEMO_PASSWORD}`);
  logger.info(`  - Student: ${student.name} (${student.batch})`);
  logger.info(`  - Team: ${team.name}`);
  logger.info(`  - Project: ${project.title}`);
  logger.info(`  - Tasks: ${seedTasks.length}, Attendance: ${records.length} records`);
};

const run = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedBatch();
    await seedDemoStudent();
    logger.info('Seeding complete.');
    process.exit(0);
  } catch (err) {
    logger.error(`Seed failed: ${err.message}`);
    process.exit(1);
  }
};

run();

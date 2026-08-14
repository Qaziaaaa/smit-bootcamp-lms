import mongoose from 'mongoose';
import env from './config/env.js';
import Student from './models/student.model.js';

async function check() {
  console.log('Connecting to:', env.mongoUri);
  await mongoose.connect(env.mongoUri);
  const student = await Student.findOne({ email: 'du@lms.com' });
  if (student) {
    student.rollNo = '110';
    await student.save();
    console.log(`Updated student ${student.name} (${student.email}) rollNo to: ${student.rollNo}`);
  }
  await mongoose.disconnect();
}

check().catch(console.error);

import mongoose from 'mongoose';
import env from './config/env.js';
import Student from './models/student.model.js';

async function check() {
  console.log('Connecting to:', env.mongoUri);
  await mongoose.connect(env.mongoUri);
  const students = await Student.find({}, 'name email status batch');
  console.log('Total students:', students.length);
  students.forEach(s => {
    console.log(`- ID: ${s._id} | Name: "${s.name}" | Email: "${s.email}" | Status: ${s.status}`);
  });
  await mongoose.disconnect();
}

check().catch(console.error);

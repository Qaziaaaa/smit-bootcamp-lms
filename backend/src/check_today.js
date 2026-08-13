import mongoose from 'mongoose';
import env from './config/env.js';
import Student from './models/student.model.js';
import Attendance from './models/attendance.model.js';

async function check() {
  await mongoose.connect(env.mongoUri);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const totalStudents = await Student.countDocuments({ status: 'active' });
  const todayRecords = await Attendance.find({ date: { $gte: startOfToday, $lt: endOfToday } }).lean();
  const presentRecords = todayRecords.filter(r => r.status === 'present').length;
  const absentRecords = todayRecords.filter(r => r.status === 'absent').length;

  console.log('Total Active Students:', totalStudents);
  console.log('Today Attendance Records Count:', todayRecords.length);
  console.log('Today Present Count:', presentRecords);
  console.log('Today Absent (explicitly marked absent):', absentRecords);
  console.log('Total Unmarked Students Today:', totalStudents - todayRecords.length);
  console.log('Total Not Present (Total - Present):', totalStudents - presentRecords);

  await mongoose.disconnect();
}

check().catch(console.error);

import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/user.model.js';
import Student from './models/student.model.js';
import logger from './utils/logger.js';

const email = (process.argv[2] || '').toLowerCase();
const password = process.argv[3] || '';

const run = async () => {
  await connectDB();

  if (email) {
    const user = await User.findOne({ email });
    const student = await Student.findOne({ email });
    console.log('USER  :', user ? { id: user._id.toString(), email: user.email, role: user.role, passwordHash: user.passwordHash } : 'NOT FOUND');
    console.log('STUDENT:', student ? { id: student._id.toString(), email: student.email, name: student.name, status: student.status } : 'NOT FOUND');
    if (user) {
      if (password) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log('PASSWORD MATCH:', isMatch);
      }
      console.log('HASH PREFIX  :', user.passwordHash.slice(0, 7), '| length:', user.passwordHash.length);
    }
  } else {
    const users = await User.find().lean();
    const students = await Student.find().select('email name userId').lean();
    console.log('ALL USERS  :', users.map((u) => ({ email: u.email, role: u.role })));
    console.log('ALL STUDENTS:', students);
  }

  process.exit(0);
};

run().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});

// Student service — handles all student CRUD operations.
// Key responsibilities:
//   - Create student (auto-generates email, assigns to active batch, hashes password)
//   - List students with search/filter/pagination
//   - Update student (with transaction to keep User + Student in sync)
//   - Delete student (removes from tasks, attendance, and User account)
//   - Bulk import from CSV
//   - Generate next roll number
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import Attendance from '../models/attendance.model.js';
import Task from '../models/task.model.js';
import Batch from '../models/batch.model.js';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const DEFAULT_PASSWORD = 'student123';

// Generates a unique email from student name: "Ahmed Khan" -> "ahmedkhan01@lms.com"
// Uses a MongoDB session to check uniqueness within a transaction (for bulk imports)
const generateEmail = async (name, session = null) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')     // remove non-alpha characters
    .split(/\s+/)
    .join('')                      // join first+last name
    .slice(0, 10);                 // max 10 characters
  let attempt = 1;
  while (attempt < 100) {
    const email = `${base}${String(attempt).padStart(2, '0')}@lms.com`;
    const query = User.findOne({ email });
    if (session) query.session(session);  // check within transaction
    const exists = await query;
    if (!exists) return email;
    attempt++;
  }
  throw new ApiError(500, 'Could not generate unique email.', ['Try a different name.']);
};

// Finds the most recent active batch, falls back to "Batch 2026"
const getActiveBatchName = async () => {
  const batch = await Batch.findOne({ status: 'active' }).sort({ createdAt: -1 }).lean();
  return batch ? batch.name : 'Batch 2026';
};

// Create a new student — creates both a User (for login) and Student (for profile)
// Uses a MongoDB transaction so both documents are created together or neither is
const createStudent = async (data) => {
  const { name, phone, teamId, rollNo, email: providedEmail } = data;

  // Use provided email or auto-generate from name
  const email = providedEmail || await generateEmail(name);

  // Check for duplicate email in both User and Student collections
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'Email already exists.', ['A user with this email already exists.']);
  }
  const existingStudent = await Student.findOne({ email: email.toLowerCase() });
  if (existingStudent) {
    throw new ApiError(409, 'Email already exists.', ['A student with this email already exists.']);
  }

  if (rollNo) {
    const existingRoll = await Student.findOne({ rollNo });
    if (existingRoll) {
      throw new ApiError(409, 'Roll No already exists.', ['A student with this Roll No already exists.']);
    }
  }

  const batch = await getActiveBatchName();
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, env.bcryptRounds);

  // Transaction: both User + Student are created together, or both fail
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{ email: email.toLowerCase(), passwordHash, role: 'student' }], { session });
    const student = await Student.create(
      [{ userId: user[0]._id, name, email: email.toLowerCase(), phone, rollNo, batch, teamId }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return { ...student[0].toObject(), generatedPassword: DEFAULT_PASSWORD };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// List students with optional search, batch, team, status filters and pagination
// Search works on name and rollNo, with prefix-match sorting (names starting with search term come first)
const getStudents = async (filters = {}, pagination = {}) => {
  const { search, batch, teamId, status } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = {};

  if (search) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: `^${escaped}`, $options: 'i' } },
      { rollNo: { $regex: `^${escaped}`, $options: 'i' } },
    ];
  }
  if (batch) query.batch = batch;
  if (teamId) query.teamId = teamId;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  // Fetch all matching students, then sort + paginate in memory
  // This allows the prefix-match sorting that DB-level sort can't do
  let allStudents = await Student.find(query).populate('teamId', 'name').lean();
  const total = allStudents.length;

  if (search) {
    const q = search.trim().toLowerCase();
    allStudents.sort((a, b) => {
      const aStarts = (a.name || '').toLowerCase().startsWith(q);
      const bStarts = (b.name || '').toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  } else {
    allStudents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const students = allStudents.slice(skip, skip + limit);

  return {
    students,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  };
};

const getStudentById = async (id) => {
  const student = await Student.findById(id).populate('teamId', 'name').lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }
  return student;
};

// Update student — keeps User.email in sync with Student.email using a transaction
const updateStudent = async (id, data) => {
  const { email, rollNo, password, ...rest } = data;
  const student = await Student.findById(id);
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  // Check email uniqueness across both Student and User collections
  if (email) {
    const existingStudent = await Student.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
    if (existingStudent) {
      throw new ApiError(409, 'Email already exists.', ['A student with this email already exists.']);
    }
    const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: student.userId } });
    if (existingUser) {
      throw new ApiError(409, 'Email already exists.', ['A user with this email already exists.']);
    }
  }

  if (rollNo) {
    const existingRoll = await Student.findOne({ rollNo, _id: { $ne: id } });
    if (existingRoll) {
      throw new ApiError(409, 'Roll No already exists.', ['A student with this Roll No already exists.']);
    }
  }

  // Transaction: update both Student and User together
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updated = await Student.findByIdAndUpdate(
      id,
      { ...rest, ...(email && { email: email.toLowerCase() }), ...(rollNo && { rollNo }) },
      { new: true, runValidators: true, session }
    ).populate('teamId', 'name');

    const userUpdates = {};
    if (email) userUpdates.email = email.toLowerCase();
    if (password) userUpdates.passwordHash = await bcrypt.hash(password, env.bcryptRounds);
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(student.userId, userUpdates, { session });
    }

    await session.commitTransaction();
    session.endSession();
    return updated;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Delete student — removes from tasks, attendance, and deletes both Student + User documents
const deleteStudent = async (id) => {
  const student = await Student.findById(id);
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Task.updateMany({ assignedTo: id }, { $unset: { assignedTo: '' } }, { session });
    await Student.findByIdAndDelete(id, { session });
    await User.findByIdAndDelete(student.userId, { session });
    await Attendance.deleteMany({ studentId: id }, { session });

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }

  return { success: true };
};

// Get attendance records for a specific student (used in student portal)
const getStudentAttendance = async (studentId) => {
  const records = await Attendance.find({ studentId }).sort({ date: -1, createdAt: -1 }).lean();

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const totalDays = records.length;
  const percentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(2) : 0;

  return {
    records,
    summary: { present: presentCount, absent: absentCount, totalDays, percentage: Number(percentage) },
  };
};

const findStudentByUserId = async (userId) => {
  return Student.findOne({ userId }).populate('teamId', 'name').lean();
};

// Bulk import students from CSV — creates User + Student for each row in a single transaction
const bulkImportStudents = async (students) => {
  const results = { created: 0, skipped: 0, errors: [] };
  const session = await mongoose.startSession();
  session.startTransaction();
  const batchName = await getActiveBatchName();
  let autoIndex = 1;

  try {
    for (let i = 0; i < students.length; i++) {
      const { name, phone, rollNo } = students[i];
      const row = i + 2;  // CSV row number (header is row 1)

      if (!name) {
        results.errors.push(`Row ${row}: Name is required.`);
        results.skipped++;
        continue;
      }

      const email = await generateEmail(name.trim(), session);
      const emailLower = email.toLowerCase();

      const existingUser = await User.findOne({ email: emailLower }).session(session);
      if (existingUser) {
        results.errors.push(`Row ${row}: Email ${emailLower} already exists.`);
        results.skipped++;
        continue;
      }

      if (rollNo) {
        const existingRoll = await Student.findOne({ rollNo: rollNo.trim() }).session(session);
        if (existingRoll) {
          results.errors.push(`Row ${row}: Roll No ${rollNo} already exists.`);
          results.skipped++;
          continue;
        }
      }

      const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, env.bcryptRounds);
      const user = await User.create([{ email: emailLower, passwordHash, role: 'student' }], { session });

      await Student.create(
        [{ userId: user[0]._id, name: name.trim(), email: emailLower, phone: phone?.trim() || undefined, batch: batchName, rollNo: rollNo?.trim() || String(autoIndex).padStart(3, '0') }],
        { session }
      );

      autoIndex++;
      results.created++;
    }

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }

  return results;
};

// Get the next available roll number (e.g. if max is "005", returns "006")
const getNextRollNo = async () => {
  const students = await Student.find({ rollNo: { $exists: true, $ne: null } }).select('rollNo').lean();
  let max = 0;
  for (const s of students) {
    const num = parseInt(String(s.rollNo).replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > max) max = num;
  }
  return String(max + 1).padStart(3, '0');
};

export default {
  createStudent, getStudents, getStudentById, updateStudent, deleteStudent,
  getStudentAttendance, findStudentByUserId, bulkImportStudents, getNextRollNo,
};

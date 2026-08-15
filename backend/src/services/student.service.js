import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import Attendance from '../models/attendance.model.js';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const createStudent = async (data) => {
  const { name, email, password, phone, batch, teamId, rollNo } = data;

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

  const rawPassword = password || 'password123';
  const passwordHash = await bcrypt.hash(rawPassword, env.bcryptRounds);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{ email: email.toLowerCase(), passwordHash, role: 'student' }], { session });

    const student = await Student.create(
      [
        {
          userId: user[0]._id,
          name,
          email: email.toLowerCase(),
          phone,
          rollNo,
          batch,
          teamId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return student[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

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

  if (batch) {
    query.batch = batch;
  }

  if (teamId) {
    query.teamId = teamId;
  }

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

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
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getStudentById = async (id) => {
  const student = await Student.findById(id).populate('teamId', 'name').lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }
  return student;
};

const updateStudent = async (id, data) => {
  const { email, rollNo, ...rest } = data;
  const student = await Student.findById(id);
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  if (email) {
    const existingStudent = await Student.findOne({
      email: email.toLowerCase(),
      _id: { $ne: id },
    });
    if (existingStudent) {
      throw new ApiError(409, 'Email already exists.', ['A student with this email already exists.']);
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: student.userId },
    });
    if (existingUser) {
      throw new ApiError(409, 'Email already exists.', ['A user with this email already exists.']);
    }
  }

  if (rollNo) {
    const existingRoll = await Student.findOne({
      rollNo,
      _id: { $ne: id },
    });
    if (existingRoll) {
      throw new ApiError(409, 'Roll No already exists.', ['A student with this Roll No already exists.']);
    }
  }

  const updated = await Student.findByIdAndUpdate(
    id,
    { ...rest, ...(email && { email: email.toLowerCase() }), ...(rollNo && { rollNo }) },
    { new: true, runValidators: true }
  ).populate('teamId', 'name');

  if (email) {
    await User.findByIdAndUpdate(student.userId, { email: email.toLowerCase() });
  }

  return updated;
};

const deleteStudent = async (id) => {
  const student = await Student.findById(id);
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  await Student.findByIdAndDelete(id);
  await User.findByIdAndDelete(student.userId);
  await Attendance.deleteMany({ studentId: id });

  return { success: true };
};

const getStudentAttendance = async (studentId) => {
  const records = await Attendance.find({ studentId }).sort({ date: 1 }).lean();

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const totalDays = records.length;
  const percentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(2) : 0;

  return {
    records,
    summary: {
      present: presentCount,
      absent: absentCount,
      totalDays,
      percentage: Number(percentage),
    },
  };
};

const findStudentByUserId = async (userId) => {
  return Student.findOne({ userId }).populate('teamId', 'name').lean();
};

export default {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  findStudentByUserId,
};

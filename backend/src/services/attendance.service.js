import Attendance from '../models/attendance.model.js';
import Student from '../models/student.model.js';
import ApiError from '../utils/ApiError.js';

const markAttendance = async ({ studentId, date, status, markedBy }) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOneAndUpdate(
    { studentId, date: attendanceDate },
    { status, markedBy },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate('studentId', 'name email').populate('markedBy', 'email');

  return attendance;
};

const getAttendance = async (filters = {}, pagination = {}) => {
  const { date, batch, status, studentId } = filters;
  const { page = 1, limit = 10 } = pagination;

  let matchStage = {};

  if (studentId) {
    matchStage.studentId = studentId;
  }

  if (date) {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);
    matchStage.date = { $gte: attendanceDate, $lt: nextDay };
  }

  if (status) {
    matchStage.status = status;
  }

  const studentMatch = {};
  if (batch) {
    studentMatch['student.batch'] = batch;
  }

  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
  ];

  if (Object.keys(studentMatch).length > 0) {
    pipeline.push({ $match: studentMatch });
  }

  pipeline.push(
    { $sort: { date: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        studentId: '$student._id',
        studentName: '$student.name',
        studentEmail: '$student.email',
        batch: '$student.batch',
        date: 1,
        status: 1,
        markedBy: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    }
  );

  const countPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
  ];

  if (Object.keys(studentMatch).length > 0) {
    countPipeline.push({ $match: studentMatch });
  }

  countPipeline.push({ $count: 'total' });

  const [records, countResult] = await Promise.all([
    Attendance.aggregate(pipeline),
    Attendance.aggregate(countPipeline),
  ]);

  const total = countResult.length > 0 ? countResult[0].total : 0;

  return {
    records,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const updateAttendance = async (id, status) => {
  const attendance = await Attendance.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
    .populate('studentId', 'name email')
    .populate('markedBy', 'email');

  if (!attendance) {
    throw new ApiError(404, 'Attendance record not found.', ['Attendance record does not exist.']);
  }

  return attendance;
};

const getAttendanceSummary = async (batch) => {
  const studentMatch = { 'student.status': 'active' };
  if (batch) {
    studentMatch['student.batch'] = batch;
  }

  const pipeline = [
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    { $match: studentMatch },
    {
      $group: {
        _id: '$student._id',
        studentName: { $first: '$student.name' },
        studentEmail: { $first: '$student.email' },
        batch: { $first: '$student.batch' },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        totalDays: { $sum: 1 },
      },
    },
    {
      $project: {
        studentId: '$_id',
        studentName: 1,
        studentEmail: 1,
        batch: 1,
        present: 1,
        absent: 1,
        totalDays: 1,
        percentage: {
          $cond: [
            { $gt: ['$totalDays', 0] },
            { $multiply: [{ $divide: ['$present', '$totalDays'] }, 100] },
            0,
          ],
        },
        _id: 0,
      },
    },
    { $sort: { batch: 1, studentName: 1 } },
  ];

  const summary = await Attendance.aggregate(pipeline);

  const totalStudents = summary.length;
  const overallPresent = summary.reduce((sum, s) => sum + s.present, 0);
  const overallAbsent = summary.reduce((sum, s) => sum + s.absent, 0);
  const overallTotalDays = summary.reduce((sum, s) => sum + s.totalDays, 0);
  const overallPercentage = overallTotalDays > 0 ? ((overallPresent / overallTotalDays) * 100).toFixed(2) : 0;

  return {
    students: summary.map((s) => ({
      ...s,
      percentage: Number(s.percentage.toFixed(2)),
    })),
    overall: {
      totalStudents,
      present: overallPresent,
      absent: overallAbsent,
      totalDays: overallTotalDays,
      percentage: Number(overallPercentage),
    },
  };
};

export default {
  markAttendance,
  getAttendance,
  updateAttendance,
  getAttendanceSummary,
};
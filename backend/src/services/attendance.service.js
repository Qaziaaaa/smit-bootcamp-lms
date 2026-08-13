import { Types } from 'mongoose';
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
  const { date, batch, status, studentId, search } = filters;
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  // 1. If a specific date is provided, return all active students with left-joined attendance status for that date.
  if (date) {
    let studentMatch = { status: 'active' };

    if (studentId) {
      studentMatch._id = new Types.ObjectId(studentId);
    }

    if (batch) {
      studentMatch.batch = batch;
    }

    if (search) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      studentMatch.name = { $regex: `^${escaped}`, $options: 'i' };
    }

    let attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const pipeline = [
      { $match: studentMatch },
      {
        $lookup: {
          from: 'attendance',
          let: { studentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$studentId', '$$studentId'] },
                    { $gte: ['$date', attendanceDate] },
                    { $lt: ['$date', nextDay] },
                  ],
                },
              },
            },
          ],
          as: 'attendanceDoc',
        },
      },
      {
        $unwind: {
          path: '$attendanceDoc',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (status) {
      pipeline.push({
        $match: { 'attendanceDoc.status': status },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];

    const summaryPipeline = [
      { $match: { status: 'active', ...(batch ? { batch } : {}) } },
      {
        $lookup: {
          from: 'attendance',
          let: { studentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$studentId', '$$studentId'] },
                    { $gte: ['$date', attendanceDate] },
                    { $lt: ['$date', nextDay] },
                  ],
                },
              },
            },
          ],
          as: 'attendanceDoc',
        },
      },
      {
        $unwind: {
          path: '$attendanceDoc',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: null,
          present: { $sum: { $cond: [{ $eq: ['$attendanceDoc.status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $ne: ['$attendanceDoc.status', 'present'] }, 1, 0] } },
        },
      },
    ];

    pipeline.push(
      { $sort: { name: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: '$attendanceDoc._id',
          studentId: '$_id',
          studentName: '$name',
          studentEmail: '$email',
          batch: '$batch',
          date: { $ifNull: ['$attendanceDoc.date', attendanceDate] },
          status: { $ifNull: ['$attendanceDoc.status', null] },
          markedBy: '$attendanceDoc.markedBy',
          createdAt: '$attendanceDoc.createdAt',
          updatedAt: '$attendanceDoc.updatedAt',
        },
      }
    );

    const [records, countResult, summaryResult] = await Promise.all([
      Student.aggregate(pipeline),
      Student.aggregate(countPipeline),
      Student.aggregate(summaryPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;
    const summary = summaryResult.length > 0
      ? { present: summaryResult[0].present, absent: summaryResult[0].absent }
      : { present: 0, absent: 0 };

    return {
      records,
      summary,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // 2. If NO date parameter is passed (e.g., Recent Attendance on Dashboard or global student search), return students with their latest attendance status
  let studentMatch = { status: 'active' };

  if (studentId) {
    studentMatch._id = new Types.ObjectId(studentId);
  }
  if (batch) {
    studentMatch.batch = batch;
  }
  if (search) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    studentMatch.name = { $regex: `^${escaped}`, $options: 'i' };
  }

  const pipeline = [
    { $match: studentMatch },
    {
      $lookup: {
        from: 'attendance',
        let: { studentId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$studentId', '$$studentId'] },
            },
          },
          { $sort: { updatedAt: -1, date: -1 } },
          { $limit: 1 },
        ],
        as: 'attendanceDoc',
      },
    },
    {
      $unwind: {
        path: '$attendanceDoc',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (status) {
    pipeline.push({
      $match: { 'attendanceDoc.status': status },
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];

  const sortStage = search ? { name: 1 } : { 'attendanceDoc.updatedAt': -1, name: 1 };

  pipeline.push(
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: '$attendanceDoc._id',
        studentId: '$_id',
        studentName: '$name',
        studentEmail: '$email',
        batch: '$batch',
        date: '$attendanceDoc.date',
        status: '$attendanceDoc.status',
        markedBy: '$attendanceDoc.markedBy',
        createdAt: '$attendanceDoc.createdAt',
        updatedAt: '$attendanceDoc.updatedAt',
      },
    }
  );

  const [records, countResult] = await Promise.all([
    Student.aggregate(pipeline),
    Student.aggregate(countPipeline),
  ]);

  const total = countResult.length > 0 ? countResult[0].total : 0;

  return {
    records,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit) || 1,
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
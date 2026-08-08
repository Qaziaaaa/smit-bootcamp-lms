import ApiError from '../utils/ApiError.js';
import Student from '../models/student.model.js';
import Attendance from '../models/attendance.model.js';

const listStudents = async ({ search, batch, teamId, status, page, limit }) => {
  const filter = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }
  if (batch) filter.batch = batch;
  if (teamId) filter.teamId = teamId;
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * pageSize;

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('teamId', 'name')
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Student.countDocuments(filter),
  ]);

  return {
    students,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
};

const getStudentById = async (id) => {
  const student = await Student.findById(id).populate('teamId', 'name').lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.');
  }

  const attendanceCounts = await Attendance.aggregate([
    { $match: { studentId: student._id } },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
      },
    },
  ]);

  const summary = attendanceCounts[0] || { totalDays: 0, present: 0, absent: 0 };
  summary.percentage = summary.totalDays > 0 ? Math.round((summary.present / summary.totalDays) * 100) : 0;

  return { ...student, attendanceSummary: summary };
};

export { listStudents, getStudentById };

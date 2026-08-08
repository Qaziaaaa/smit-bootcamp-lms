import Student from '../models/student.model.js';
import Attendance from '../models/attendance.model.js';
import Team from '../models/team.model.js';
import Task from '../models/task.model.js';
import ApiError from '../utils/ApiError.js';

const getStudentProfile = async (userId) => {
  const student = await Student.findOne({ userId }).populate('teamId', 'name').lean();
  if (!student) {
    throw new ApiError(404, 'Student profile not found.', ['Student does not exist.']);
  }
  return student;
};

const getStudentAttendance = async (userId) => {
  const student = await Student.findOne({ userId }).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  const records = await Attendance.find({ studentId: student._id }).sort({ date: 1 }).lean();

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

const getStudentTeam = async (userId) => {
  const student = await Student.findOne({ userId }).populate('teamId').lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }
  return student.teamId || null;
};

const getStudentTasks = async (userId) => {
  const student = await Student.findOne({ userId }).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  const tasks = await Task.find({ assignedTo: student._id })
    .populate('projectId', 'title')
    .populate('assignedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return tasks;
};

export default {
  getStudentProfile,
  getStudentAttendance,
  getStudentTeam,
  getStudentTasks,
};
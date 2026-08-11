import Student from '../models/student.model.js';
import Attendance from '../models/attendance.model.js';
import Team from '../models/team.model.js';
import Task from '../models/task.model.js';
import Project from '../models/project.model.js';
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
  const student = await Student.findOne({ userId }).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }
  if (!student.teamId) {
    return null;
  }

  const [team, members] = await Promise.all([
    Team.findById(student.teamId).populate('projectId', 'title description status deadline').lean(),
    Student.find({ teamId: student.teamId }).select('name email phone batch').lean(),
  ]);

  return { team, members };
};

const getStudentTasks = async (userId) => {
  const student = await Student.findOne({ userId }).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  const tasks = await Task.find({ assignedTo: student._id })
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .lean();

  return tasks;
};

const TASK_FLOW = {
  pending: ['in-progress', 'completed'],
  'in-progress': ['completed'],
  completed: [],
};

const updateTaskProgress = async (userId, taskId, status) => {
  const student = await Student.findOne({ userId }).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  const task = await Task.findOne({ _id: taskId, assignedTo: student._id });
  if (!task) {
    throw new ApiError(404, 'Task not found.', ['Task does not exist or is not assigned to you.']);
  }

  const allowed = TASK_FLOW[task.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(
      400,
      'Invalid status transition.',
      [`Task status cannot change from "${task.status}" to "${status}".`]
    );
  }

  task.status = status;
  await task.save();

  return task;
};

export default {
  getStudentProfile,
  getStudentAttendance,
  getStudentTeam,
  getStudentTasks,
  updateTaskProgress,
};
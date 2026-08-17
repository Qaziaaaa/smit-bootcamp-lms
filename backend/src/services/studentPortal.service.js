// Student Portal service — read-only endpoints for the student-facing portal.
// Students can view their own profile, attendance, team, projects, and tasks.
// They can also update the status of tasks assigned to them.
// All functions take userId (from JWT) and look up the Student document first.
import Student from '../models/student.model.js';
import Attendance from '../models/attendance.model.js';
import Team from '../models/team.model.js';
import Task from '../models/task.model.js';
import Project from '../models/project.model.js';
import ApiError from '../utils/ApiError.js';

// Get the logged-in student's profile
const getStudentProfile = async (userId) => {
  const student = await Student.findOne({ userId }).populate('teamId', 'name').lean();
  if (!student) {
    throw new ApiError(404, 'Student profile not found.', ['Student does not exist.']);
  }
  return student;
};

// Get all attendance records + summary (present/absent/percentage) for the student
const getStudentAttendance = async (userId) => {
  const student = await Student.findOne({ userId }).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  const records = await Attendance.find({ studentId: student._id }).sort({ date: -1, createdAt: -1 }).lean();

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const totalDays = records.length;
  const percentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(2) : 0;

  return {
    records,
    summary: { present: presentCount, absent: absentCount, totalDays, percentage: Number(percentage) },
  };
};

// Get the student's team info + members + project
const getStudentTeam = async (userId) => {
  const student = await Student.findOne({ userId }).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }
  if (!student.teamId) {
    return null;  // student has no team assigned
  }

  const team = await Team.findById(student.teamId).lean();
  if (!team) {
    return null;  // team was deleted
  }
  const members = await Student.find({ teamId: team._id }).select('name email batch status').sort({ name: 1 }).lean();
  const project = team.projectId ? await Project.findById(team.projectId).lean() : null;

  return { ...team, members, project };
};

// Get tasks assigned to this student
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

// Get projects assigned to the student's team
const getStudentProjects = async (userId) => {
  const student = await Student.findOne({ userId }).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }
  if (!student.teamId) {
    return [];  // no team = no projects
  }

  const [projects, team, memberCount] = await Promise.all([
    Project.find({ teamId: student.teamId }).sort({ createdAt: -1 }).lean(),
    Team.findById(student.teamId).lean(),
    Student.countDocuments({ teamId: student.teamId }),
  ]);

  // Attach team info to each project for display
  return projects.map((project) => ({
    ...project,
    team: team ? { name: team.name, memberCount } : null,
  }));
};

// Get a single project (only if it belongs to the student's team)
const getStudentProjectById = async (userId, projectId) => {
  const student = await Student.findOne({ userId }).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  const project = await Project.findById(projectId).lean();
  if (!project) {
    throw new ApiError(404, 'Project not found.', ['Project does not exist.']);
  }

  // Security: student can only see projects assigned to their team
  if (!student.teamId || !project.teamId || project.teamId.toString() !== student.teamId.toString()) {
    throw new ApiError(403, 'Forbidden.', ['You can only view projects assigned to your team.']);
  }

  // Only show tasks assigned to this student (not other team members' tasks)
  const [tasks, team, memberCount] = await Promise.all([
    Task.find({ projectId: project._id, assignedTo: student._id })
      .select('title description status priority deadline')
      .sort({ createdAt: -1 })
      .lean(),
    Team.findById(student.teamId).lean(),
    Student.countDocuments({ teamId: student.teamId }),
  ]);

  return { ...project, team: team ? { name: team.name, memberCount } : null, tasks };
};

// Update task status — student can only update tasks assigned to them
const updateTaskProgress = async (userId, taskId, data) => {
  const student = await Student.findOne({ userId }).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found.', ['Task does not exist.']);
  }

  // Security: student can only update their own tasks
  if (!task.assignedTo || task.assignedTo.toString() !== student._id.toString()) {
    throw new ApiError(403, 'Forbidden.', ['You can only update your own tasks.']);
  }

  task.status = data.status;
  await task.save();

  return task;
};

export default {
  getStudentProfile, getStudentAttendance, getStudentTeam,
  getStudentTasks, getStudentProjects, getStudentProjectById, updateTaskProgress,
};

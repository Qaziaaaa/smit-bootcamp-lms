// Dashboard service — provides stats for the admin dashboard.
// Returns counts (students, teams, projects, tasks), task status breakdown,
// today's attendance, active batch info, and recent items.
import Student from '../models/student.model.js';
import Team from '../models/team.model.js';
import Task from '../models/task.model.js';
import Attendance from '../models/attendance.model.js';
import Batch from '../models/batch.model.js';

const getDashboardStats = async () => {
  // Get today's date range (midnight to midnight)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  // Run all count queries in parallel for speed
  const [
    totalStudents,
    totalTeams,
    totalProjects,
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    todayAttendance,
    activeBatch,
  ] = await Promise.all([
    Student.countDocuments(),
    Team.countDocuments(),
    // Count distinct teamIds that are assigned to students (only teams with members)
    Student.distinct('teamId').then((ids) => ids.filter(Boolean).length),
    Task.countDocuments(),
    Task.countDocuments({ status: 'pending' }),
    Task.countDocuments({ status: 'in-progress' }),
    Task.countDocuments({ status: 'completed' }),
    // Get today's attendance records to calculate present/absent
    Attendance.find({ date: { $gte: startOfToday, $lt: endOfToday } }).lean(),
    // Get the active batch for "Day X of 90" display
    Batch.findOne({ status: 'active' }).select('name startDate endDate').lean(),
  ]);

  const todayPresent = todayAttendance.filter((a) => a.status === 'present').length;
  const todayAbsent = totalStudents - todayPresent;

  // Get the 5 most recent students and tasks for the dashboard list
  const [recentStudents, recentTasks] = await Promise.all([
    Student.find().sort({ createdAt: -1 }).limit(5).lean(),
    Task.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('projectId', 'title')
      .populate('assignedTo', 'name')
      .lean(),
  ]);

  return {
    counts: { students: totalStudents, teams: totalTeams, projects: totalProjects, tasks: totalTasks },
    taskStatus: { pending: pendingTasks, inProgress: inProgressTasks, completed: completedTasks },
    todayAttendance: { present: todayPresent, absent: todayAbsent },
    activeBatch,
    recentStudents,
    recentTasks,
  };
};

export default { getDashboardStats };

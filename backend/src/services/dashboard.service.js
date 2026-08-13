import Student from '../models/student.model.js';
import Team from '../models/team.model.js';
import Task from '../models/task.model.js';
import Attendance from '../models/attendance.model.js';

const getDashboardStats = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [
    totalStudents,
    totalTeams,
    totalProjects,
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    todayAttendance,
  ] = await Promise.all([
    Student.countDocuments(),
    Team.countDocuments(),
    Student.distinct('teamId').then((ids) => ids.filter(Boolean).length),
    Task.countDocuments(),
    Task.countDocuments({ status: 'pending' }),
    Task.countDocuments({ status: 'in-progress' }),
    Task.countDocuments({ status: 'completed' }),
    Attendance.find({ date: { $gte: startOfToday, $lt: endOfToday } }).lean(),
  ]);

  const todayPresent = todayAttendance.filter((a) => a.status === 'present').length;
  const todayAbsent = totalStudents - todayPresent;

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
    counts: {
      students: totalStudents,
      teams: totalTeams,
      projects: totalProjects,
      tasks: totalTasks,
    },
    taskStatus: {
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completed: completedTasks,
    },
    todayAttendance: {
      present: todayPresent,
      absent: todayAbsent,
    },
    recentStudents,
    recentTasks,
  };
};

export default {
  getDashboardStats,
};

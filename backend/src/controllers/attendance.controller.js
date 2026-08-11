import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import attendanceService from '../services/attendance.service.js';

const markAttendance = asyncHandler(async (req, res) => {
  const { studentId, date, status } = req.body;
  const attendance = await attendanceService.markAttendance({
    studentId,
    date,
    status,
    markedBy: req.user.userId,
  });
  sendSuccess(res, 200, attendance, 'Attendance marked successfully');
});

const getAttendance = asyncHandler(async (req, res) => {
  const { date, batch, status, studentId, search, page, limit } = req.query;
  const result = await attendanceService.getAttendance(
    { date, batch, status, studentId, search },
    { page: Number(page) || 1, limit: Number(limit) || 10 }
  );
  sendSuccess(res, 200, result, 'Attendance retrieved successfully');
});

const updateAttendance = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const attendance = await attendanceService.updateAttendance(req.params.id, status);
  sendSuccess(res, 200, attendance, 'Attendance updated successfully');
});

const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { batch } = req.query;
  const summary = await attendanceService.getAttendanceSummary(batch);
  sendSuccess(res, 200, summary, 'Attendance summary retrieved successfully');
});

export default {
  markAttendance,
  getAttendance,
  updateAttendance,
  getAttendanceSummary,
};
// Attendance controller — handles marking, listing, and updating attendance.
// Supports both single and bulk attendance marking.
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import attendanceService from '../services/attendance.service.js';

// POST /attendance — mark single or bulk attendance
const markAttendance = asyncHandler(async (req, res) => {
  const { records, studentId, date, status } = req.body;

  // Bulk: array of records
  if (records && Array.isArray(records)) {
    const formattedRecords = records.map((r) => ({
      studentId: r.studentId,
      date: r.date,
      status: r.status,
      markedBy: req.user.userId,
    }));
    const results = await attendanceService.markAttendanceBulk(formattedRecords);
    return sendSuccess(res, 200, results, 'Attendance marked successfully');
  }

  // Single: one student
  const attendance = await attendanceService.markAttendance({
    studentId, date, status,
    markedBy: req.user.userId,
  });
  sendSuccess(res, 200, attendance, 'Attendance marked successfully');
});

// GET /attendance — list attendance with filters
const getAttendance = asyncHandler(async (req, res) => {
  const { date, batch, status, studentId, search, page, limit } = req.query;
  const result = await attendanceService.getAttendance(
    { date, batch, status, studentId, search },
    { page: Number(page) || 1, limit: Number(limit) || 10 }
  );
  sendSuccess(res, 200, result, 'Attendance retrieved successfully');
});

// PUT /attendance/:id — update a single record's status
const updateAttendance = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const attendance = await attendanceService.updateAttendance(req.params.id, status);
  sendSuccess(res, 200, attendance, 'Attendance updated successfully');
});

// GET /attendance/summary — aggregated attendance stats
const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { batch } = req.query;
  const summary = await attendanceService.getAttendanceSummary(batch);
  sendSuccess(res, 200, summary, 'Attendance summary retrieved successfully');
});

export default { markAttendance, getAttendance, updateAttendance, getAttendanceSummary };

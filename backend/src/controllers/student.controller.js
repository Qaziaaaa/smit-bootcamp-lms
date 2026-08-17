import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import studentService from '../services/student.service.js';
import { parse } from 'csv-parse/sync';

const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body);
  sendSuccess(res, 201, student, 'Student created successfully');
});

const getStudents = asyncHandler(async (req, res) => {
  const { search, batch, teamId, status, page, limit } = req.query;
  const result = await studentService.getStudents(
    { search, batch, teamId, status },
    { page: Number(page) || 1, limit: Number(limit) || 10 }
  );
  sendSuccess(res, 200, result, 'Students retrieved successfully');
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  sendSuccess(res, 200, student, 'Student retrieved successfully');
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  sendSuccess(res, 200, student, 'Student updated successfully');
});

const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.params.id);
  sendSuccess(res, 200, { deleted: true }, 'Student deleted successfully');
});

const getStudentAttendance = asyncHandler(async (req, res) => {
  const result = await studentService.getStudentAttendance(req.params.id);
  sendSuccess(res, 200, result, 'Student attendance retrieved successfully');
});

const bulkImportStudents = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const csvContent = req.file.buffer.toString('utf-8');
  const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
  const result = await studentService.bulkImportStudents(records);
  sendSuccess(res, 200, result, 'Bulk import completed');
});

const getNextRollNo = asyncHandler(async (req, res) => {
  const rollNo = await studentService.getNextRollNo();
  sendSuccess(res, 200, { rollNo }, 'Next roll number retrieved');
});

export default {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  bulkImportStudents,
  getNextRollNo,
};

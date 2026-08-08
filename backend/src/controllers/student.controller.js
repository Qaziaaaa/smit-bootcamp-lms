import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as studentService from '../services/student.service.js';

const listStudents = asyncHandler(async (req, res) => {
  const result = await studentService.listStudents({
    search: req.query.search,
    batch: req.query.batch,
    teamId: req.query.teamId,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });

  sendSuccess(res, 200, result, 'Students fetched successfully');
});

const getStudentById = asyncHandler(async (req, res) => {
  const result = await studentService.getStudentById(req.params.id);

  sendSuccess(res, 200, result, 'Student fetched successfully');
});

const createStudent = asyncHandler(async (req, res) => {
  const result = await studentService.createStudent(req.body);

  sendSuccess(res, 201, result, 'Student created successfully');
});

export { listStudents, getStudentById, createStudent };

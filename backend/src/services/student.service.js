import Student from '../models/student.model.js';

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

export { listStudents };

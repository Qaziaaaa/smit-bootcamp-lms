// Batch service — manages bootcamp batches (e.g. "Batch 2026").
// Batches have a name, date range, and status (active/inactive/completed).
// Students are linked to batches by the batch name string.
import ApiError from '../utils/ApiError.js';
import escapeRegex from '../utils/escapeRegex.js';
import Batch from '../models/batch.model.js';
import Student from '../models/student.model.js';

// List all batches with student count (uses aggregation to join with students)
const getBatches = async ({ search }) => {
  const match = {};
  if (search) {
    match.name = { $regex: escapeRegex(search), $options: 'i' };
  }

  const batches = await Batch.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'students',
        localField: 'name',       // batch name matches student.batch string
        foreignField: 'batch',
        as: 'students',
      },
    },
    {
      $project: {
        name: 1, description: 1, startDate: 1, endDate: 1, status: 1, createdAt: 1, updatedAt: 1,
        studentCount: { $size: '$students' },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return batches;
};

const getBatchById = async (id) => {
  const batch = await Batch.findById(id).lean();
  if (!batch) {
    throw new ApiError(404, 'Batch not found.', ['Batch does not exist.']);
  }

  // Get all students in this batch
  const students = await Student.find({ batch: batch.name })
    .select('name email rollNo status')
    .sort({ name: 1 })
    .lean();

  return { ...batch, students };
};

const createBatch = async ({ name, description, startDate, endDate, status }) => {
  const existing = await Batch.findOne({ name });
  if (existing) {
    throw new ApiError(409, 'Batch name already exists.', ['A batch with this name already exists.']);
  }

  const batchData = { name };
  if (description) batchData.description = description;
  if (startDate) batchData.startDate = startDate;
  if (endDate) batchData.endDate = endDate;
  if (status) batchData.status = status;

  const batch = await Batch.create(batchData);
  return batch;
};

const updateBatch = async (id, { name, description, startDate, endDate, status }) => {
  const batch = await Batch.findById(id);
  if (!batch) {
    throw new ApiError(404, 'Batch not found.', ['Batch does not exist.']);
  }

  if (name && name !== batch.name) {
    const existing = await Batch.findOne({ name });
    if (existing) {
      throw new ApiError(409, 'Batch name already exists.', ['A batch with this name already exists.']);
    }
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (startDate !== undefined) updateData.startDate = startDate || null;
  if (endDate !== undefined) updateData.endDate = endDate || null;
  if (status) updateData.status = status;

  const updated = await Batch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  return updated;
};

// Delete batch — unlinks students from this batch first
const deleteBatch = async (id) => {
  const batch = await Batch.findById(id);
  if (!batch) {
    throw new ApiError(404, 'Batch not found.', ['Batch does not exist.']);
  }

  // Remove batch reference from all students in this batch
  await Student.updateMany({ batch: batch.name }, { $unset: { batch: '' } });
  await Batch.findByIdAndDelete(id);
  return { success: true };
};

export default { getBatches, getBatchById, createBatch, updateBatch, deleteBatch };

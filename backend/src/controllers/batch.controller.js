// Batch controller — handles CRUD for batch management.
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import batchService from '../services/batch.service.js';

const getBatches = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const batches = await batchService.getBatches({ search });
  sendSuccess(res, 200, { batches }, 'Batches retrieved successfully');
});

const getBatchById = asyncHandler(async (req, res) => {
  const batch = await batchService.getBatchById(req.params.id);
  sendSuccess(res, 200, batch, 'Batch retrieved successfully');
});

const createBatch = asyncHandler(async (req, res) => {
  const batch = await batchService.createBatch(req.body);
  sendSuccess(res, 201, batch, 'Batch created successfully');
});

const updateBatch = asyncHandler(async (req, res) => {
  const batch = await batchService.updateBatch(req.params.id, req.body);
  sendSuccess(res, 200, batch, 'Batch updated successfully');
});

const deleteBatch = asyncHandler(async (req, res) => {
  await batchService.deleteBatch(req.params.id);
  sendSuccess(res, 200, { deleted: true }, 'Batch deleted successfully');
});

export default { getBatches, getBatchById, createBatch, updateBatch, deleteBatch };

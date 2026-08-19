// Batch model — represents a bootcamp cohort (e.g. "Batch 2026").
// Students are linked to batches by the batch name string (not ObjectId).
// Only one batch should have status 'active' at a time.
import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,       // batch names must be unique
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,         // when the batch started (used for "Day X of 90" calculation)
    },
    endDate: {
      type: Date,         // when the batch ends
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Batch', batchSchema);

import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
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

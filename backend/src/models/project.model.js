import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'on-hold'],
      default: 'active',
      index: true,
    },
    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);

// Project model — a capstone project assigned to a team.
// Each project belongs to one team (teamId).
// Status can be: active, completed, or on-hold.
// Tasks are linked to projects via Task.projectId.
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
      ref: 'Team',        // which team owns this project
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'on-hold'],
      default: 'active',
      index: true,        // indexed because we filter by status
    },
    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);

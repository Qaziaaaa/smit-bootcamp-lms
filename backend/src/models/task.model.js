// Task model — a unit of work within a project.
// Each task belongs to one project (projectId) and is optionally assigned to one student (assignedTo).
// Status flow: pending -> in-progress -> in_review -> review_requested -> completed.
// Priority: low, medium, or high.
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',     // which project this task belongs to
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',     // which student is working on this task (null = unassigned)
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'in_review', 'review_requested', 'completed'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);

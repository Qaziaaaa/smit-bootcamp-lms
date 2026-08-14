import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Team', teamSchema);

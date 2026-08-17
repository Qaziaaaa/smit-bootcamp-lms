// Team model — a group of students working on a project.
// name is unique (e.g. "Team Alpha").
// projectId links to the project assigned to this team.
// leader is the student who leads the team.
// Members are tracked via Student.teamId (reverse reference).
import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,       // team names must be unique
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',     // the project assigned to this team
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',     // the team leader (must be a member of this team)
    },
  },
  { timestamps: true }
);

export default mongoose.model('Team', teamSchema);

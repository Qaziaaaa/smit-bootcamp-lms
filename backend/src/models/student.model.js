// Student model — stores student profile info.
// Linked to a User document via userId (for login).
// teamId links to a Team (a student can only be in one team).
// batch is a string like "Batch 2026" (matches a Batch document name).
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',        // points to the User document for this student
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,        // indexed for fast search by name
    },
    email: {
      type: String,
      required: true,
      unique: true,       // each student has a unique email
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    rollNo: {
      type: String,
      required: true,
      unique: true,       // roll number is unique across all students
      trim: true,
    },
    batch: {
      type: String,
      index: true,        // indexed because we filter by batch often
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',        // which team this student belongs to (null = unassigned)
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',  // new students are active by default
    },
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);

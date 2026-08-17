// Attendance model — one record per student per day.
// The unique index on (studentId, date) prevents duplicate marks for the same day.
// markedBy stores which admin/user recorded the attendance.
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent'],   // only two statuses
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',    // the admin who marked this attendance
    },
  },
  { timestamps: true, collection: 'attendance' }
);

// Prevent duplicate attendance for same student on same date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);

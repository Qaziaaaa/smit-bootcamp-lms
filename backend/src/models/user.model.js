// User model — stores login credentials and role.
// Every user has an email + password hash. Roles are 'admin' or 'student'.
// Students also have a separate Student document linked via userId.
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,       // no two users can share an email
      trim: true,
      lowercase: true,    // stored lowercase for consistent lookups
    },
    passwordHash: {
      type: String,
      required: true,     // bcrypt hash of the plain password
    },
    role: {
      type: String,
      enum: ['admin', 'student'],  // only these two roles exist
      default: 'student',
    },
  },
  { timestamps: true }    // adds createdAt and updatedAt automatically
);

export default mongoose.model('User', userSchema);

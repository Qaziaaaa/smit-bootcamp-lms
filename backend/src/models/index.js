// Registers all Mongoose models and re-exports them for easy importing.
import './user.model.js';
import './student.model.js';
import './attendance.model.js';
import './team.model.js';
import './project.model.js';
import './task.model.js';
import './batch.model.js';

export { default as User } from './user.model.js';
export { default as Student } from './student.model.js';
export { default as Attendance } from './attendance.model.js';
export { default as Team } from './team.model.js';
export { default as Project } from './project.model.js';
export { default as Task } from './task.model.js';
export { default as Batch } from './batch.model.js';

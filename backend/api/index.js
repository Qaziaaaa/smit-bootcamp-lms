// Vercel serverless entry point — wraps Express app for serverless execution.
// Caches MongoDB connection across warm invocations to avoid reconnecting every request.
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import '../src/models/index.js';

let isConnected = false;

export default async function handler(req, res) {
  if (req.url === '/' || req.url === '') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}

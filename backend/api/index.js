// Vercel serverless entry point — wraps Express app for serverless execution.
// Caches MongoDB connection across warm invocations to avoid reconnecting every request.
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import '../src/models/index.js';

let isConnected = false;

export default async function handler(req, res) {
  // Health check for root path (Vercel pings this to verify deployment)
  if (req.url === '/' || req.url === '') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ success: true, message: 'LMS API is running' });
  }

  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}

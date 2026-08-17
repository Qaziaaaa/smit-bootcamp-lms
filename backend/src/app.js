// Express app setup — all middleware and routes are attached here.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security & parsing middleware
app.use(helmet());                // sets secure HTTP headers
app.use(cors({                    // allow frontend to call this API
  origin: env.clientOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());          // parse JSON request bodies
app.use(morgan('dev'));           // log each request to console

// All API routes are under /api
app.use('/api', routes);

// 404 handler + error handler (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;

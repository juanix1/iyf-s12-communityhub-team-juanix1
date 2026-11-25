import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { SUGGESTED_ROUTES } from './models/User.js';
import { TRAFFIC_STATUSES } from './models/Post.js';
import { REPORT_REASONS } from './models/Report.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration supporting single or comma-separated CLIENT_URLs
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, mobile apps, tests) or configured origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'test') {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Rate limiting on authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Health & metadata check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'Njia CommunityHub API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    constants: {
      routes: SUGGESTED_ROUTES,
      trafficStatuses: TRAFFIC_STATUSES,
      reportReasons: REPORT_REASONS,
    },
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// 404 and centralised error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

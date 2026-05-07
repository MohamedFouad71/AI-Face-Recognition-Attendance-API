import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

import globalLimiter from '#middlewares/rateLimiters.js';
import sanitizer from '#middlewares/sanitizer.js';
import imageRoutes from '#routes/image.route.js';
import studentRoutes from '#routes/student.route.js';
import attendanceRoutes from '#routes/attendance.routes.js';

const app = express();

app.use(
  cors({
    // the hardcoded frontend is added only to prevent the app from breaking in the pipeline
    // and if the user forgot to add it to the .env
    origin: process.env.FRONTEND_URL || 'localhost://4000',
  })
);
app.use(globalLimiter);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(sanitizer);
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/attendances', attendanceRoutes);

app.get('/api/v1/health', (req: Request, res: Response): void => {
  res.status(200).json({ success: 'ok' });
});

export default app;

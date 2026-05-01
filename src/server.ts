import express from 'express';
import { Request, Response } from 'express';
import morgan from 'morgan';

import connectDb from '#config/db.js';
import redisClient from '#config/redis.js';
import globalLimiter from '#middlewares/rateLimiters.js';
import sanatizer from '#middlewares/sanatizer.js';
import imageRoutes from '#routes/image.route.js';
import studentRoutes from '#routes/student.route.js';

const app = express();
const port = process.env.PORT ?? '5000';

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(globalLimiter);
app.use(sanatizer);
app.use(morgan('short'));

app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/students', studentRoutes);
app.get('/api/v1/health', (req: Request, res: Response): void => {
  res.status(200).json({ success: 'ok' });
});

async function startServer() {
  try {
    await redisClient.connect();
    await connectDb();
    console.log('Databases connected successfully');

    app.listen(port, (): void => {
      console.log(`App is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to databases. Shutting down.', error);
    process.exit(1);
  }
}

await startServer();

import connectDb from '#config/db.js';
import redisClient from '#config/redis.js';

import app from './app.js';

const port = process.env.PORT ?? '3000';

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

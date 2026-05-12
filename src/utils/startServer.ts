import axios from 'axios';

import connectDb from '#config/db.js';
import redisClient from '#config/redis.js';

const connectToDatabases = async () => {
  await redisClient.connect().catch(() => console.log('Error: Redis Connection!!'));
  console.log('Redis Connected Successfully');

  // this function contain the validations inside it
  await connectDb();
};

const checkAIHealth = async () => {
  const aiHealth = await axios.get(
    process.env.AI_HEALTH_CHECK || 'http://localhost:5000/api/v1/health'
  );
  if (aiHealth.status === 200) console.log('AI Service is Running');
};

async function startServer(app: any, host: string, port: string) {
  try {
    await connectToDatabases();
    await checkAIHealth();

    return app.listen(port, (host = '127.0.0.1'), (): void => {
      console.log(`App is running on ${host}:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to databases or AI service. Shutting down.', error);
    process.exit(1);
  }
}

export default startServer;

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
  const aiHealth = await axios.get(process.env.AI_HEALTH_CHECK || 'http://localhost:5000/health');
  if (aiHealth.status === 200) console.log('AI Service is Running');
};

async function startServer(app: any, host: string, port: string) {
  try {
    await connectToDatabases();
    // polling for 2 minutes with 5 seconds interval to check if the AI service is up before starting the server
    let aiServiceUp = false;
    let attempts = 0;
    const maxAttempts = 10; // 2 minutes * 60 seconds / 5 seconds = 24 attempts

    while (!aiServiceUp && attempts < maxAttempts) {
      try {
        await checkAIHealth();
        aiServiceUp = true;
      } catch (error) {
        console.log(
          'AI Service is not available yet. Retrying..., attempt:',
          attempts + 1,
          'of',
          maxAttempts
        );
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
        attempts++;
      }
    }

    if (!aiServiceUp) {
      console.error(
        `Failed to connect to AI service after ${maxAttempts} attempts. Shutting down.`
      );
      process.exit(1);
    }

    return app.listen(port, (host = '127.0.0.1'), (): void => {
      console.log(`App is running on ${host}:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to databases or AI service. Shutting down.', error);
    process.exit(1);
  }
}

export default startServer;

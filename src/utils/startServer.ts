import axios from 'axios';

import connectDb from '#config/db.js';
import connectRedis from '#config/redis.js';

async function startServer(app: any, domain: string, port: string) {
  try {
    await connectRedis();
    await connectDb();

    const aiHealth = await axios.get(
      process.env.AI_HEALTH_CHECK || 'http://localhost:5000/api/v1/health'
    );
    if (aiHealth.status === 200) console.log('AI Service is Running');
    app.listen();
    return app.listen(port, domain, (): void => {
      console.log(`App is running on ${domain}:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to databases or AI service. Shutting down.', error);
    process.exit(1);
  }
}

export default startServer;

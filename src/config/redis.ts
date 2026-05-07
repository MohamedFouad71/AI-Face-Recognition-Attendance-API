import redis from 'redis';

const redisClient = redis.createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379',
});

export default redisClient;

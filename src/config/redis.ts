import redis from 'redis';

const connectRedis = () => {
  return redis
    .createClient({
      url: process.env.REDIS_URI || 'redis://localhost:6379',
    })
    .connect()
    .then(() => {
      console.log('Redis Connencted Succesfully');
    })
    .catch(() => {
      console.log('Unable to Connect to Redis');
      process.exit(-1);
    });
};

export default connectRedis;

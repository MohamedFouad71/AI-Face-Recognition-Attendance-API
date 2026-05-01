import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
  max: 5,
  windowMs: 10 * 60 * 1000,
});

export default globalLimiter;

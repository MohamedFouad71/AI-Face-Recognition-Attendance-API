import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
  max: 1000,
  windowMs: 10 * 60 * 1000,
});

export default globalLimiter;

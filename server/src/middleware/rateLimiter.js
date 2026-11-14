import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for AI Query Synthesis:
 * Limits /api/query to 10 requests per minute per user (or IP)
 */
export const queryRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10,             // limit each user to 10 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Rate limit per authenticated user ID, fallback to IP address
    return req.user?.id || req.ip || 'anonymous';
  },
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded: You can only make 10 synthesis queries per minute per account to prevent AI model abuse.'
  }
});


import rateLimit from "express-rate-limit";

// Example: 10 requests per minute per IP for AI routes.
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: "Too many requests to AI endpoints - please wait a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

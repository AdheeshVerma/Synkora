import { Request, Response, NextFunction } from 'express';

/**
 * Simple in‑memory rate limiting middleware.
 *
 * @param {Object} [options]
 * @param {number} [options.windowMs=900000] - Time frame for which requests are tracked (default 15 minutes).
 * @param {number} [options.max=100] - Max number of requests allowed within the window.
 * @param {string} [options.message='Too many requests, please try again later.'] - Response message when limit is exceeded.
 * @returns {function(Request, Response, NextFunction)} Express middleware.
 */
export default function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests, please try again later.'
  } = options;

  // Store request counters per IP.
  const ipStore = new Map(); // ip -> { count, startTime }

  // Helper to clean up stale entries.
  const cleanup = () => {
    const now = Date.now();
    for (const [ip, data] of ipStore.entries()) {
      if (now - data.startTime > windowMs) {
        ipStore.delete(ip);
      }
    }
  };

  // Periodic cleanup to prevent memory leak.
  const interval = setInterval(cleanup, windowMs).unref();

  // Middleware function.
  return function (req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    if (!ip) {
      // If we cannot determine IP, allow the request.
      return next();
    }

    const now = Date.now();
    const entry = ipStore.get(ip);

    if (entry) {
      if (now - entry.startTime <= windowMs) {
        entry.count += 1;
        if (entry.count > max) {
          res.status(429).send(message);
          return;
        }
        ipStore.set(ip, entry);
      } else {
        // Window has passed, reset counter.
        ipStore.set(ip, { count: 1, startTime: now });
      }
    } else {
      ipStore.set(ip, { count: 1, startTime: now });
    }

    next();
  };
}

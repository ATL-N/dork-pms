// lib/redis.js
import Redis from 'ioredis';

let redis;

function getRedisClient() {
  if (!redis) {
    // Using lazyConnect to prevent the client from connecting automatically.
    // The connection will be established only when a command is issued.
    // This prevents connection attempts during the build phase.
    redis = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: 6379,
      lazyConnect: true,
      connectTimeout: 2000, // Short timeout
    });

    redis.on('error', (err) => {
        // Suppress ECONNREFUSED errors from logging during build
        if (err.code !== 'ECONNREFUSED') {
            console.error('Redis error:', err);
        }
    });
  }
  return redis;
}


/**
 * A generic rate limiter that uses Redis to track and limit actions.
 * @param {string} action - A unique name for the action being limited (e.g., 'login-attempt').
 * @param {string} identifier - A unique identifier for the user/entity (e.g., email or phone number).
 * @param {number} limit - The maximum number of allowed attempts.
 * @param {number} durationInSeconds - The time window for the limit, in seconds.
 * @returns {Promise<{ allowed: boolean, remaining: number }>} - An object indicating if the action is allowed and how many attempts are left.
 */
export async function rateLimiter(action, identifier, limit, durationInSeconds) {
  const key = `rate-limit:${action}:${identifier}`;
  
  try {
    const client = getRedisClient();
    // The .connect() call is not strictly necessary with lazyConnect, 
    // but it makes the intent clear and can help catch connection errors early at runtime.
    await client.connect(); 

    const pipeline = client.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, durationInSeconds);
    const results = await pipeline.exec();

    // ioredis pipeline returns an array of [error, result] for each command
    const count = results[0][1]; 

    if (count > limit) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: limit - count };
  } catch (error) {
    // If Redis fails (e.g., during build or if the service is down), 
    // we default to allowing the request to avoid blocking users.
    if (process.env.NODE_ENV !== 'production' || process.env.CI) {
      // During build or in non-prod, don't log connection errors
    } else {
      console.error("Redis rate limiter error:", error);
    }
    return { allowed: true, remaining: limit };
  }
}

/**
 * Resets the rate limit for a specific action and identifier.
 * This is useful after a successful action, like a correct login.
 * @param {string} action - The action name to reset.
 * @param {string} identifier - The unique identifier to reset.
 */
export async function resetRateLimit(action, identifier) {
    const key = `rate-limit:${action}:${identifier}`;
    try {
        const client = getRedisClient();
        await client.connect();
        await client.del(key);
    } catch (error) {
        if (process.env.NODE_ENV !== 'production' || process.env.CI) {
            // During build or in non-prod, don't log connection errors
        } else {
            console.error("Redis reset limit error:", error);
        }
    }
}

// Keep a default export for compatibility, but it's now a function
export default getRedisClient;

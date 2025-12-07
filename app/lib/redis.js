// lib/redis.js
import Redis from 'ioredis';

// Create a single, reusable Redis instance.
// It will automatically connect to the 'redis' service host because they are on the same Docker network.
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: 6379,
});

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
    const pipeline = redis.pipeline();
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
    console.error("Redis rate limiter error:", error);
    // If Redis fails, we default to allowing the request to avoid blocking users due to a Redis outage.
    // In a more critical system, you might want to fail-closed.
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
        await redis.del(key);
    } catch (error) {
        console.error("Redis reset limit error:", error);
    }
}

export default redis;

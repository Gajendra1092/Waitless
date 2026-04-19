import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL for BullMQ connection options
const redisConnection = {
  host: new URL(REDIS_URL).hostname,
  port: parseInt(new URL(REDIS_URL).port) || 6379,
};

/**
 * Notification Queue
 * Used to offload slow tasks like sending SMS or Emails.
 */
const notificationQueue = new Queue('NotificationQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Automatically retry 3 times if it fails
    backoff: {
      type: 'exponential',
      delay: 1000, // Wait 1s, then 2s, then 4s...
    },
    removeOnComplete: true, // Clean up Redis memory after success
  },
});

export default notificationQueue;

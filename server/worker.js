import { Worker } from 'bullmq';
import 'dotenv/config';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisUrl = new URL(REDIS_URL);
const redisConnection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port) || 6379,
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
};

console.log('🚀 Worker started. Waiting for jobs...');

/**
 * Worker Logic
 * Processes jobs from the NotificationQueue.
 */
const worker = new Worker('NotificationQueue', async (job) => {
  if (job.name === 'send-sms') {
    const { phone, name, tokenNumber } = job.data;
    
    console.log(`[Job ${job.id}] 📱 Sending SMS to ${name} (${phone})...`);
    
    // Simulate a slow external API call (5 seconds)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log(`[Job ${job.id}] ✅ SMS sent successfully to token #${tokenNumber}!`);
  }
}, {
  connection: redisConnection
});

worker.on('failed', (job, err) => {
  console.error(`[Job ${job.id}] ❌ Failed: ${err.message}`);
});

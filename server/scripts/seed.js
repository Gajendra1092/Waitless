import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import 'dotenv/config';
import Queue from '../models/Queue.js';
import Customer from '../models/Customer.js';

const SEED_CONFIG = {
  businesses: 50,
  queuesPerBusiness: 5,
  customersPerQueue: 200, // Total ~50k customers
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Clearing existing data (Queues and Customers)...');
    await Queue.deleteMany({});
    await Customer.deleteMany({});

    const statuses = ['waiting', 'serving', 'completed', 'skipped'];
    const queues = [];

    console.log(`Generating ${SEED_CONFIG.businesses * SEED_CONFIG.queuesPerBusiness} queues...`);
    
    // Using fixed business IDs for testing, including your provided one
    const businessIds = ['69d3d5b4db69c7461b67c3b6']; 
    for(let i=1; i < SEED_CONFIG.businesses; i++) {
        businessIds.push(new mongoose.Types.ObjectId().toString());
    }

    for (const bId of businessIds) {
      for (let i = 0; i < SEED_CONFIG.queuesPerBusiness; i++) {
        queues.push({
          name: faker.company.name() + ' Queue',
          detail: faker.commerce.productDescription(),
          businessId: bId,
          status: 'running',
          category: faker.helpers.arrayElement(['Food', 'Bank', 'Health', 'Retail']),
          avgServiceTime: faker.number.int({ min: 5, max: 20 }),
        });
      }
    }

    const createdQueues = await Queue.insertMany(queues);
    console.log(`Created ${createdQueues.length} queues.`);

    console.log(`Generating approximately ${createdQueues.length * SEED_CONFIG.customersPerQueue} customers...`);
    
    const batchSize = 1000;
    let customersBatch = [];
    let totalCreated = 0;

    for (const q of createdQueues) {
      for (let j = 0; j < SEED_CONFIG.customersPerQueue; j++) {
        const status = faker.helpers.arrayElement(statuses);
        const joinedAt = faker.date.recent({ days: 7 });
        const servedAt = status === 'completed' ? new Date(joinedAt.getTime() + (faker.number.int({min: 5, max: 30}) * 60000)) : null;

        customersBatch.push({
          queueId: q._id,
          name: faker.person.fullName(),
          phone: faker.phone.number(),
          tokenNumber: j + 1,
          position: status === 'waiting' ? j + 1 : 0,
          status: status,
          joinedAt: joinedAt,
          servedAt: servedAt,
          createdAt: joinedAt
        });

        if (customersBatch.length >= batchSize) {
          await Customer.insertMany(customersBatch);
          totalCreated += customersBatch.length;
          process.stdout.write(`\rCreated ${totalCreated} customers...`);
          customersBatch = [];
        }
      }
    }

    if (customersBatch.length > 0) {
      await Customer.insertMany(customersBatch);
      totalCreated += customersBatch.length;
    }

    console.log(`\nSeed complete! Total Customers: ${totalCreated}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();

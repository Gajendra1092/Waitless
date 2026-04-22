import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import 'dotenv/config';
import Queue from '../models/Queue.js';
import Customer from '../models/Customer.js';
import Business from '../models/Business.js';

const SEED_CONFIG = {
  businesses: 5,
  queuesPerBusiness: 3,
  customersPerQueue: 100, 
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Clearing existing data (Businesses, Queues, and Customers)...');
    await Business.deleteMany({});
    await Queue.deleteMany({});
    await Customer.deleteMany({});

    // 1. Create a Default Test Business
    const testBusiness = new Business({
      name: 'Test Business',
      email: 'test@waitless.com',
      password: 'password123',
      phone: '1234567890',
      address: '123 AI Street, Tech City'
    });
    await testBusiness.save();
    console.log('✅ Created Test Business: test@waitless.com / password123');

    const businessIds = [testBusiness._id.toString()];
    for(let i=1; i < SEED_CONFIG.businesses; i++) {
        businessIds.push(new mongoose.Types.ObjectId().toString());
    }

    const statuses = ['waiting', 'serving', 'completed', 'skipped'];
    const queues = [];

    console.log(`Generating queues...`);
    
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

    console.log(`Generating customers...`);
    
    const batchSize = 500;
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

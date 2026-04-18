# Waitless Server Scripts

This directory contains utility scripts for development and maintenance.

## Data Seeding (`seed.js`)

The seeding script is used to populate the MongoDB database with a large amount of realistic data for performance testing and development.

### Usage
```bash
npm run seed
```
*Note: This will clear existing Queues and Customers collections.*

### Logic & Configuration
The script generates a hierarchical dataset:
1. **Businesses:** 50 unique business entities (including the test business ID).
2. **Queues:** 5 queues per business (250 total).
3. **Customers:** 200 customers per queue (50,000 total).

**Key Features:**
- **Batching:** Uses Mongoose `insertMany` with a batch size of 1000 to prevent memory overflows and optimize write speed.
- **Realistic Data:** Uses `@faker-js/faker` for names, phones, and descriptions.
- **Timestamp Distribution:** Distributes `joinedAt` and `servedAt` dates over the previous 7 days to ensure analytics charts show meaningful trends.
- **Status Distribution:** Randomly assigns statuses (`waiting`, `serving`, `completed`, `skipped`) to simulate a live system's state.

### Testing Performance
This script was used in **Phase 2** of the optimization roadmap to prove that Redis caching could handle production-scale loads (50,000 records) with sub-10ms response times.

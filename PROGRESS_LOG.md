# Waitless Project - Phase 1 Optimization Log

## Phase 1: Code & Database Optimization
**Goal:** Improve API response times, reduce server memory usage, and prepare the database for production scale.

---

### Step 1: Database Indexing
**Target:** Reduce query execution time for the most common search patterns.
**Action:** Added compound and single-field indexes to the MongoDB schemas.
**Files Modified:**
- `server/models/Queue.js`: Added indexes for `businessId` and `status`.
- `server/models/Customer.js`: Added indexes for `queueId` and `status`.

**Details:**
- By default, MongoDB performs a "Collection Scan" (searching every document). Indexes allow MongoDB to find data instantly, similar to an index at the back of a book.
- **Queue.js:** Added `businessId: 1` index and a compound index `{ businessId: 1, status: 1 }`. This optimizes fetching all queues for a business or only active ones.
- **Customer.js:** Added `queueId: 1` index and a compound index `{ queueId: 1, status: 1 }`. This makes it much faster to retrieve the current waitlist for any specific queue.

---

### Step 2: Connection Pooling & Compression
**Target:** Improve server stability under high traffic and reduce network bandwidth.
**Action:** Configured Mongoose connection pooling and added Gzip compression middleware.
**Files Modified:**
- `server/index.js`: Added `compression` middleware and `maxPoolSize` to Mongoose.

**Details:**
- **Connection Pooling:** By setting `maxPoolSize: 10`, we allow Node.js to keep 10 database connections open and ready to use. This prevents the "overhead" of opening a new connection for every single user request.
- **Compression:** Using the `compression` library, the server now "zips" JSON responses before sending them. This reduces the size of the data sent over the internet by up to 70%, making the app feel faster on mobile data.

---

### Step 3: Efficient Queries with `.lean()`
**Target:** Reduce server CPU and memory usage during data retrieval.
**Action:** Added `.lean()` to all read-only Mongoose queries in the routes.
**Files Modified:**
- `server/routes/queue.routes.js`
- `server/routes/customer.routes.js`

**Details:**
- Normally, Mongoose returns "Documents" which include many helper methods (like `.save()`). These are heavy objects.
- By adding `.lean()`, we tell Mongoose to return plain JavaScript Objects instead. This is much faster and uses significantly less RAM, which is critical when running on free-tier servers with limited memory.

---

### Step 4: Performance Verification (Load Testing)
**Target:** Quantify the impact of Phase 1 changes and ensure system stability.
**Action:** Ran A/B load tests using `autocannon` (50 concurrent connections).
**Files Modified:**
- `server/PERFORMANCE.md`: Updated with detailed metrics and a case study.

**Details:**
- Measured "Before" (unoptimized) vs "After" (optimized) states.
- **Stability Gain:** Worst-case (Max) latency dropped from **2.1 seconds to 1.1 seconds** (approx. 48% improvement).
- **Tail Latency Gain:** 99th percentile users saw a **46% speed increase** in response times.
- **Consistency:** Standard deviation of response times dropped by ~25%, indicating a much smoother user experience under heavy load.

---

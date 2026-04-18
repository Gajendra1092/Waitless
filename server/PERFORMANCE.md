# Server Performance Tracker

This document tracks the backend and database performance metrics over time. Our primary goals are to minimize API latency and maximize the number of concurrent users the server can handle without degrading.

### Metrics Guide:
- **API Latency (p95):** The time it takes for 95% of requests to complete on our heaviest route.
- **Throughput (RPS):** Requests Per Second the server can handle during a load test.
- **Stability (Max Latency):** The longest response time recorded under load.
- **Tail Latency (p99):** The experience for the slowest 1% of users.

| Date | Commit / Version | Description of Change | API Latency (p95) | Throughput (RPS) | Stability (Max Latency) | Tail Latency (p99) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-04-17 | `phase-1-opt` | DB Indexing, .lean(), Compression, Pooling | 1100ms -> 1085ms | 49.4 -> 50.0 | 2122ms -> 1095ms | 2028ms -> 1091ms |
| 2026-04-17 | `phase-2-redis` | Redis Server-Side Caching (Analytics Route) | 2231ms -> 13ms | 8.2 -> 2586.4 | 2247ms -> 66ms | 2247ms -> 17ms |

## Optimization Case Study: Phase 1 (Database & API Stability)

### The Problem
During initial load testing (50 concurrent connections), we observed significant "jitter" in API response times. While average latency was acceptable, the **Max Latency** frequently spiked over 2 seconds, indicating that under load, some users would experience extreme lag due to "Collection Scans" in MongoDB and heavy Mongoose document overhead.

### The Solution
We implemented compound indexing, Mongoose `.lean()`, connection pooling, and Gzip compression.

### The Results
*   **Tail Latency (p99) Improvement:** Dropped from **2028ms to 1091ms**.
*   **Worst-Case Latency (Max) Improvement:** Reduced from **2122ms to 1095ms**.

---

## Optimization Case Study: Phase 2 (Redis Server-Side Caching)

### The Problem
After scaling our database to 50,000 records via seeding, the `GET /analytics/data` route became a bottleneck. Because it required heavy MongoDB aggregations, throughput dropped to **8.2 RPS** and average latency rose to **1.7 seconds**.

### The Solution
We implemented an in-memory caching layer using **Redis**.
1.  **Caching:** Calculated aggregation results are stored in Redis (`analytics:${businessId}`) for 5 minutes.
2.  **Invalidation:** Whenever a customer is marked as `completed` or `skipped`, the cache for that business is proactively deleted.

### The Results (Benchmarked via Autocannon)
The offloading of heavy reads to Redis resulted in a monumental performance leap:
*   **Throughput (RPS):** Increased from **8.2 to 2,586.4** (A **31,441%** increase).
*   **Average Latency:** Plummeted from **1,691ms to 7.24ms**.
*   **Tail Latency (p99):** Dropped from **2,247ms to 17ms**.

**Why this matters:**
This optimization ensures the application can handle thousands of concurrent administrative users without stressing the primary database. MongoDB's CPU is now preserved for critical write operations (joining the queue).

---

## Optimization Case Study: Phase 3 (WebSocket Horizontal Scaling)

### The Problem
Standard WebSockets are stateful and tied to the memory of a single server. In a multi-server production environment, a user on Server A would not receive live updates triggered by an action on Server B, breaking the "WaitLess" live-tracking experience.

### The Solution
We implemented the **Socket.io Redis Adapter**. This uses a Publisher/Subscriber model where every server instance broadcasts its events to Redis, and Redis ensures those events are echoed to every other server instance in the cluster.

### The Verification (Cross-Instance Test)
We performed a successful simulation of a distributed cluster:
1. **Server A** and **Server B** were started as independent processes.
2. A client connected to **Server A**.
3. An update was triggered on **Server B**.
4. **Result:** The client on Server A received the update via the Redis bridge.

**Why this matters:**
This architectural shift is a prerequisite for high availability. We can now deploy the app to Docker clusters or Kubernetes without losing real-time functionality.


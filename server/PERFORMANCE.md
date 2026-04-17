# Server Performance Tracker

This document tracks the backend and database performance metrics over time. Our primary goals are to minimize API latency and maximize the number of concurrent users the server can handle without degrading.

### Metrics Guide:
- **API Latency (p95):** The time it takes for 95% of requests to complete on our heaviest route (e.g., `GET /api/queue/:id`).
- **DB Query Time:** The average time MongoDB takes to execute complex aggregations or searches.
- **Throughput (RPS):** Requests Per Second the server can handle during a load test.
- **Concurrent Sockets:** Number of active Socket.io connections before event loop lag occurs.
- **Memory Usage:** Average RAM consumption of the Node.js process under load.

| Date | Commit / Version | Description of Change | API Latency (p95) | Throughput (RPS) | Stability (Max Latency) | Tail Latency (p99) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-04-17 | `phase-1-opt` | DB Indexing, .lean(), Compression, Pooling | 1100ms -> 1085ms | 49.4 -> 50.0 | 2122ms -> 1095ms | 2028ms -> 1091ms |

## Optimization Case Study: Phase 1 (Database & API Stability)

### The Problem
During initial load testing (50 concurrent connections), we observed significant "jitter" in API response times. While average latency was acceptable, the **Max Latency** frequently spiked over 2 seconds, and the **99th percentile (p99)** was double the average. This indicated that under load, some users would experience extreme lag due to "Collection Scans" in MongoDB and heavy Mongoose document overhead.

### The Solution
We implemented a multi-layered optimization strategy:
1.  **Database Indexing:** Added compound indexes on `{ businessId: 1, status: 1 }` and `{ queueId: 1, status: 1 }`. This eliminated full collection scans for the most frequent dashboard and waitlist queries.
2.  **Mongoose `.lean()`:** Converted read-only queries to return plain JavaScript objects instead of heavy Mongoose documents. This reduced CPU and memory overhead per request.
3.  **Connection Pooling:** Configured `maxPoolSize: 10` to keep database connections warm, reducing the overhead of establishing new connections.
4.  **Response Compression:** Implemented Gzip compression to shrink the size of JSON payloads sent over the network.

### The Results (Benchmarked via Autocannon)
The most significant impact was seen in **Tail Latency** and **Stability**:
*   **Tail Latency (p99) Improvement:** Dropped from **2028ms to 1091ms** (approx. 46% faster for the slowest users).
*   **Worst-Case Latency (Max) Improvement:** Reduced from **2122ms to 1095ms**.
*   **Standard Deviation:** Decreased by ~25%, meaning the app provides a much more consistent experience for all users under load.
*   **Average Latency:** Remained stable, but with significantly fewer spikes.

**Why this matters:**
In a live environment (like a busy restaurant or store), consistency is key. These changes ensure that even when 50+ people join a queue simultaneously, the system remains responsive and doesn't "hang" for unlucky users.
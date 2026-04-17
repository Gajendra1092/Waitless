# ADR 001: Phase 1 Database Optimizations

## Status
Accepted

## Context
As the Waitless application prepares for production-level traffic, the initial database implementation showed signs of instability under load. Specifically, "tail latency" (the experience for the slowest users) was erratic, and some queries were triggering full collection scans in MongoDB, leading to high CPU usage.

## Decision
We implemented three primary optimizations to stabilize performance:
1.  **Compound Indexing:** Created indexes on frequently queried combinations (e.g., `businessId` + `status`) to ensure $O(1)$ or $O(log n)$ lookup times.
2.  **Mongoose `.lean()`:** Switched read-only queries to return plain JavaScript objects, bypassing the overhead of Mongoose document instantiation (which includes change tracking and helper methods).
3.  **Connection Pooling:** Configured `maxPoolSize: 10` to keep database connections "warm" and prevent the overhead of establishing new connections for every request.
4.  **Response Compression:** Implemented Gzip middleware to reduce network bandwidth.

## Consequences
- **Pros:** 48% reduction in "worst-case" latency; significantly more stable response times under heavy load.
- **Cons:** Indexing increases disk storage usage and adds a slight overhead to write operations (inserts/updates).
- **Trade-off:** We prioritized read speed and system stability over storage costs, as the app is read-heavy.

# ADR 002: Implement Redis Caching

## Status
Accepted

## Context
Heavy aggregation queries, particularly for the Analytics dashboard, require MongoDB to process thousands of records across multiple collections. Running these calculations on every request is inefficient and slows down the dashboard as the database grows.

## Decision
We will implement a server-side caching layer using **Redis**. 
1.  **Scope:** Initially cache the `/analytics/data` route.
2.  **Logic:** Check Redis for a cached JSON string before querying MongoDB.
3.  **Invalidation:** Use a combination of a 5-minute Time-To-Live (TTL) and proactive invalidation (deleting the cache when a customer is marked as `completed` or `skipped`).

## Consequences
- **Pros:** Drastically reduces MongoDB load; analytics responses will take ~1-5ms on cache hits regardless of database size.
- **Cons:** Adds a new infrastructure dependency (Redis). Potential for "stale" data if invalidation logic has bugs.
- **Trade-off:** We chose Redis over in-memory `node-cache` because Redis allows the cache to be shared across multiple server instances (Phase 4), ensuring architectural consistency.

# ADR 006: Codebase Refactoring & Security Hardening

## Status
Accepted

## Context
Over the course of development, business-level operations (calling, completing, and skipping customers) were duplicated across two route files: `customer.routes.js` and `queue.routes.js`. 
- **The Problem:** The versions in `customer.routes.js` were unprotected (missing `verifyToken`) and lacked the Redis cache invalidation logic implemented in Phase 2. This created a security vulnerability and a "stale data" bug on the Analytics dashboard.

## Decision
We refactored the routing structure to enforce a **Single Source of Truth**:
1.  **Deletion:** Removed the duplicate and unprotected routes from `customer.routes.js`.
2.  **Consolidation:** All business actions must now go through `queue.routes.js`, which is protected by JWT authentication and fully integrated with Redis caching.

## Consequences
- **Pros:** Eliminated unauthorized access to business actions. Guaranteed that the Redis cache is correctly invalidated every time a customer state changes. Reduced codebase "noise".
- **Cons:** Any frontend code still pointing to the old `PATCH` routes in `customer.routes.js` will break and must be updated to the `POST` routes in `queue.routes.js`.
- **Trade-off:** We prioritized system security and data integrity over backwards compatibility with temporary prototype routes.

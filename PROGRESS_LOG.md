# Waitless Project - Optimization Progress Log

## Phase 1: Code & Database Optimization
**Status:** Completed
**Goal:** Improve API response times, reduce server memory usage.

- **Step 1:** Database Indexing (Queue & Customer models).
- **Step 2:** Connection Pooling & Compression (maxPoolSize: 10, Gzip).
- **Step 3:** Efficient Queries (.lean() added to read-only routes).
- **Step 4:** Verified gains: 48% improvement in stability under load.

---

## Phase 2: Redis Caching & Large-Scale Testing
**Status:** Completed
**Goal:** Scale the app to handle 50,000+ records and reduce heavy aggregation load.

### Step 1: Architectural Documentation (ADRs)
- Created `docs/adr/` directory.
- Documented Phase 1 database choices and Phase 2 caching architecture.

### Step 2: Data Seeding (Stress Testing)
- **Action:** Created `server/scripts/seed.js` using `@faker-js/faker`.
- **Logic:**
    - Generates **50 Businesses**, **5 Queues per business**, and **200 Customers per queue**.
    - Total Data: **250 Queues** and **50,000 Customers**.
    - **Performance Optimization:** Uses `insertMany` with a batch size of 1000 to minimize database write operations.
    - **Realism:** Distributes customer statuses and timestamps across the last 7 days to provide valid data for the weekly trend analytics charts.
- **Result:** Successfully mimicked a high-traffic production environment, revealing a baseline latency of 1.7s on analytics before caching.

### Step 3: Redis Integration
- **Action:** Configured `redis` client in `server/index.js` and Docker local environment.
- **Infrastructure:** Using Redis for centralized caching, preparing for horizontal scaling.

### Step 4: Analytics Caching & Invalidation
- **Action:** Implemented Redis caching for the `/analytics/data` route (TTL: 5m).
- **Action:** Implemented proactive cache invalidation in `/complete` and `/skip` routes.

### Step 5: Final Verification (The "Big Win")
- **Benchmarking Results:** Throughput increased from **8 RPS to 2,586 RPS**.
- **Latency Gain:** Average dashboard load time dropped from **1.7 seconds to 7 milliseconds**.
- **Impact:** System is now fully capable of handling 50k+ records with zero performance degradation on the analytics dashboard.

---

## Phase 3: WebSocket Scaling
**Status:** Completed
**Goal:** Use Redis Adapter for Socket.io to support multiple server instances.

### Step 1: Implementation
- **Action:** Installed `@socket.io/redis-adapter`.
- **Action:** Updated `server/index.js` to initialize `pubClient` and `subClient`.
- **Action:** Attached the Redis adapter to the Socket.io server instance.

### Step 2: Verification (The "Bridge" Test)
- **File:** `server/test/socket-redis.test.js`.
- **Method:** Simulated two independent server instances (Server A on port 5001, Server B on port 5002) both connected to the same Redis adapter.
- **Test Result:** A client connected to Server A successfully received a real-time event emitted from Server B.
- **Impact:** The application is now "Horizontally Scalable." We can run any number of server instances behind a load balancer, and real-time updates (like "Call Next") will stay perfectly synchronized across all users.

---

## Phase 4: Infrastructure & Orchestration
**Status:** Completed
**Goal:** Containerize the entire application and implement load balancing.

### Step 1: Dockerization
- **Action:** Created `Dockerfile` for both `server` (Node.js) and `client` (React).
- **Technique:** Used a **Multi-stage Build** for the React frontend to keep the image size small (~25MB).

### Step 2: Orchestration (Docker Compose)
- **Action:** Created `docker-compose.yml` to manage MongoDB, Redis, API, and Client containers.
- **Scaling:** Configured the API to run **3 instances** simultaneously.

### Step 3: Load Balancing (Nginx)
- **Action:** Implemented Nginx as a Reverse Proxy to distribute traffic between the 3 API servers.
- **WebSocket Support:** Configured Nginx to handle `Upgrade` and `Connection` headers for real-time Socket.io support.

### Step 4: Bug Fix (SPA Routing)
- **Issue:** Refreshing the browser on non-root paths (like `/display/:id`) caused a 404 error.
- **Fix:** Created a custom `nginx.conf` for the React container using the `try_files` directive to fallback to `index.html`.
- **Learning:** Documented this concept in `docs/learning/05-react-client-routing-nginx.md`.

### Step 5: Bug Fix (WebSocket Cluster Handshake)
- **Issue:** Socket.io handshake failed with a `400 Bad Request` in the Docker cluster.
- **Fix:** Implemented **Sticky Sessions** in Nginx using `ip_hash`.
- **Optimization:** Forced the frontend to use the `websocket` transport directly.
- **Learning:** Documented in `docs/learning/06-sticky-sessions-load-balancing.md`.

---

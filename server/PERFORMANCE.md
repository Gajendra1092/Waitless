# Server Performance Tracker

This document tracks the backend and database performance metrics over time. Our primary goals are to minimize API latency and maximize the number of concurrent users the server can handle without degrading.

### Metrics Guide:
- **API Latency (p95):** The time it takes for 95% of requests to complete on our heaviest route (e.g., `GET /api/queue/:id`).
- **DB Query Time:** The average time MongoDB takes to execute complex aggregations or searches.
- **Throughput (RPS):** Requests Per Second the server can handle during a load test.
- **Concurrent Sockets:** Number of active Socket.io connections before event loop lag occurs.
- **Memory Usage:** Average RAM consumption of the Node.js process under load.

| Date | Commit / Version | Description of Change | API Latency (p95) | DB Query Time | Throughput (RPS) | Concurrent Sockets | Memory Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| YYYY-MM-DD | `baseline` | Initial Baseline | - | - | - | - | - |
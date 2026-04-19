# ADR 005: Implement Message Queue for Asynchronous Tasks

## Status
Accepted

## Context
Currently, the application performs all tasks synchronously within the API request cycle. For example, if we were to send an Email or SMS when a customer joins a queue, the user would have to wait for that external service to respond before receiving their token. This creates a "bottleneck" that increases API latency and makes the system fragile (if the email service is slow, the whole app feels slow).

## Decision
We will implement a Message Queue system using **BullMQ**.
1.  **Technology:** BullMQ (Node.js library) powered by our existing **Redis** instance.
2.  **Pattern:** The API will act as a **Producer** (adding jobs to a queue) and a separate process will act as a **Worker** (processing those jobs).
3.  **Scope:** Initially implement a `NotificationQueue` to handle simulated SMS/Email alerts.

### Why BullMQ?
-   **Resource Efficiency:** We already have Redis in our stack (Phases 2 & 3). Reusing it saves us from adding a heavy dependency like RabbitMQ or Kafka.
-   **Reliability:** It supports automatic retries, job priorities, and delayed execution out of the box.
-   **Performance:** It is capable of handling thousands of jobs per second with very low overhead.

## Consequences
- **Pros:** 
    - **Instant API Responses:** Users get their token in <10ms regardless of how long the notification takes to send.
    - **Fault Tolerance:** If a notification fails, BullMQ can automatically retry it later without bothering the user.
- **Cons:** 
    - **Eventual Consistency:** There is a tiny delay (usually milliseconds) between joining a queue and receiving the SMS.
    - **Infrastructure:** Requires a separate "Worker" process/container to be managed.
- **Trade-off:** We chose "Eventual Consistency" over "High Latency" to ensure the app stays responsive under heavy load.

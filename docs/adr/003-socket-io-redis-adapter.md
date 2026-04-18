# ADR 003: Socket.io Redis Adapter for Horizontal Scaling

## Status
Accepted

## Context
The current Socket.io implementation stores all room and client information in the local RAM of a single Node.js process. When we scale to multiple server instances (Phase 4), a "Call Next" event emitted on Server A will not be received by clients connected to Server B. This breaks the real-time functionality of the application in a production environment.

## Decision
We will implement the **@socket.io/redis-adapter**.
1.  **Mechanism:** We will initialize two dedicated Redis clients (`pubClient` and `subClient`) to handle message broadcasting between server instances.
2.  **Infrastructure:** These clients will share the same Redis instance used for analytics caching.
3.  **Testing:** We will implement a specialized test script in `server/test/` to verify cross-instance event propagation.

## Consequences
- **Pros:** Enables horizontal scaling (running multiple servers behind a load balancer). Ensures real-time consistency across all users regardless of which server they are connected to.
- **Cons:** Slightly increases Redis traffic and network latency for event emissions.
- **Trade-off:** This is a mandatory requirement for distributed systems using WebSockets.

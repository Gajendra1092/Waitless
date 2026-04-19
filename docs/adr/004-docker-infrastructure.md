# ADR 004: Docker Infrastructure & Load Balancing

## Status
Accepted

## Context
As the application scales, running individual services manually (Node, React, MongoDB, Redis) becomes error-prone and difficult to manage. Furthermore, a single Node.js server cannot handle massive traffic spikes. We need a way to orchestrate the entire stack and distribute traffic across multiple server instances.

## Decision
We implemented a containerized architecture using **Docker** and **Docker Compose**.
1.  **Containerization:** Every service (API, Client, DB, Cache) runs in an isolated container.
2.  **Load Balancing:** **Nginx** acts as the primary entry point (port 80), proxying traffic to the backend and frontend.
3.  **Horizontal Scaling:** The API is configured to run **3 replicas**.
4.  **Sticky Sessions:** Implemented `ip_hash` in Nginx to ensure Socket.io clients stay connected to the same server instance to prevent handshake failures.

## Consequences
- **Pros:** Environment consistency (works the same on any machine). Easy scaling of backend instances.
- **Cons:** Increased complexity in networking and configuration. Requires "Sticky Sessions" for stateful protocols like WebSockets.
- **Trade-off:** We accepted the overhead of Nginx and Docker to gain the ability to scale horizontally and achieve high availability.

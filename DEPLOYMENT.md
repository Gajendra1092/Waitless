# WaitLess Deployment Guide

This document outlines the strategies for deploying the WaitLess high-performance queue management system, covering both the **100% Free Tier** (ideal for portfolios/students) and the **Professional Cluster** (ideal for production scale).

---

## 1. Zero-Cost Deployment (The "Deconstructed" Approach)
Since free-tier cloud servers (Render, Heroku) lack the RAM to run our full 8-container Docker cluster, we "deconstruct" the architecture and use specialized free-tier providers for each piece.

### Service Mapping:
| Component | Platform | Why? |
| :--- | :--- | :--- |
| **Frontend (React)** | [Vercel](https://vercel.com/) | Global CDN, Auto-SSL, high speed, always online. |
| **Backend (Node API)** | [Render.com](https://render.com/) | Free Web Service, handles builds from GitHub. |
| **Database (MongoDB)** | [MongoDB Atlas](https://www.mongodb.com/) | Managed free sandbox (512MB), 24/7 availability. |
| **Cache & Queue (Redis)** | [Upstash](https://upstash.com/) | "Serverless" Redis with 10k free requests per day. |
| **Worker (Background)** | [Render.com](https://render.com/) | Separate Background Worker service to keep API fast. |

### Code Configuration for Free Tier:
You don't need to change your actual logic, only your **Environment Variables** in the cloud dashboards:
1.  **`MONGO_URI`**: Use your Atlas connection string.
2.  **`REDIS_URL`**: Use your Upstash connection string (starts with `rediss://`).
3.  **`REACT_APP_SERVER_URL`**: Set this in Vercel to point to your Render API URL.

### The "Free Tier" Catch:
Render's free tier "sleeps" after 15 minutes of inactivity. The first visitor will experience a 30-second delay while the server wakes up. This is standard for free hobby plans.

---

## 2. Professional Deployment (The "Cluster" Approach)
If you decide to move to a paid VPS (DigitalOcean, Hetzner, AWS), you can leverage the full **Docker Compose** architecture we built.

### The Benefits of Paid Hosting:
- **Zero Cold Starts:** Your backend is always awake and ready (No 30-second delay).
- **Horizontal Scaling:** We run **3 identical API instances**. If one crashes, the app stays up.
- **Nginx Load Balancing:** Traffic is distributed intelligently so no single server is overwhelmed.
- **Sticky Sessions:** Guaranteed WebSocket stability for real-time tracking.
- **Dedicated RAM:** Plenty of memory to handle thousands of concurrent users.

### Paid Hosting Setup:
1.  Rent a VPS (e.g., DigitalOcean Droplet with 2GB RAM).
2.  Clone the repository.
3.  Run one command: `docker-compose up -d --build`.
4.  Your entire cluster boots up exactly as it does on your local machine.

---

## 3. Mandatory Environment Variables
Regardless of your platform, ensure these are set in your production environment:

| Key | Description | Example |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Connection String | `mongodb+srv://...` |
| `REDIS_URL` | Redis Connection String | `redis://...` or `rediss://...` |
| `JWT_SECRET` | Secret for Access Tokens | `A-Long-Random-String` |
| `REFRESH_SECRET` | Secret for Refresh Tokens | `Another-Random-String` |
| `CLIENT_URL` | The URL of your Frontend | `https://waitless.vercel.app` |

---

## Technical Architectural Note (For Recruiters)
*"The WaitLess architecture is designed for scale. While hosted on a deconstructed free tier for demonstration, the repository contains a complete Docker Compose orchestration suite, utilizing Nginx as a Load Balancer, a Redis Adapter for cross-server WebSocket synchronization, and BullMQ for resilient background job processing."*

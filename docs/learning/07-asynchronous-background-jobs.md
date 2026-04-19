# Learning Module 07: Asynchronous Background Jobs

## 1. The Concept: Sync vs. Async
- **Synchronous:** I ask for a token -> The server sends an email (5 seconds) -> The server gives me the token. (Total wait: 5 seconds).
- **Asynchronous:** I ask for a token -> The server writes a "To-Do" note for the email service -> The server gives me the token immediately. (Total wait: 5 milliseconds).

## 2. How BullMQ Works
BullMQ uses **Redis** as its data store. It follows a three-part model:
1.  **The Producer (API):** Adds a "Job" (a JSON object) into Redis.
2.  **The Queue (Redis):** A list of jobs waiting to be done.
3.  **The Worker:** A separate Node.js process that watches the list, grabs a job, and executes the actual code (e.g., calling the SMS API).

## 3. The Phase 5 Execution Plan

### Step A: Infrastructure (Re-using Redis)
We don't need a new database. We will use the same Redis instance we used for Caching (Phase 2) and Socket.io (Phase 3). This keeps our Docker cluster simple.

### Step B: The Code (Producer)
We will create a helper in `server/queues/notificationQueue.js` that allows any part of the API to say: `notificationQueue.add('send-sms', { phone, message })`.

### Step C: The Worker (Separate Container)
We will update `docker-compose.yml` to spin up a new service called `worker`. This container will run the *exact same code* as your API, but instead of starting a web server, it will start the BullMQ worker.

### Step D: Verification (The "Slow Job" Test)
We will simulate a "Slow SMS Service" that takes 5 seconds to finish. We will prove that even with this 5-second delay, the user gets their token in the browser in less than 10 milliseconds.

## 4. Technology Trade-offs
| Feature | BullMQ (Chosen) | RabbitMQ | Amazon SQS |
| :--- | :--- | :--- | :--- |
| **Data Store** | Redis | Erlang Node | Cloud-only |
| **Complexity** | Low (Reuses Redis) | High (New Infra) | High (AWS Lock-in) |
| **Speed** | Extremely High | High | Medium |
| **Best for** | Node.js ecosystem | Enterprise / Multi-lang | Serverless |

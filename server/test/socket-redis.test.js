import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { io as Client } from "socket.io-client";

/**
 * PHASE 3 VERIFICATION TEST (Final Fix)
 * Manually adds the join-room logic to simulation servers.
 */

async function runTest() {
  const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
  
  const pubClient = createClient({ url: REDIS_URL });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);

  // Server A
  const httpServerA = createServer();
  const ioA = new Server(httpServerA);
  const pubA = pubClient.duplicate();
  const subA = subClient.duplicate();
  await Promise.all([pubA.connect(), subA.connect()]);
  ioA.adapter(createAdapter(pubA, subA));
  
  // ADD ROOM LOGIC TO SERVER A
  ioA.on("connection", (socket) => {
    socket.on("join-queue-room", (queueId) => {
        socket.join(queueId);
    });
  });
  httpServerA.listen(5001);

  // Server B
  const httpServerB = createServer();
  const ioB = new Server(httpServerB);
  const pubB = pubClient.duplicate();
  const subB = subClient.duplicate();
  await Promise.all([pubB.connect(), subB.connect()]);
  ioB.adapter(createAdapter(pubB, subB));
  httpServerB.listen(5002);

  console.log("Servers A and B started with Redis Adapter.");

  const client = new Client("http://localhost:5001");
  
  client.on("connect", () => {
    console.log("Client connected to Server A.");
    client.emit("join-queue-room", "test-room");
  });

  client.on("cross-server-event", (data) => {
    console.log("SUCCESS: Client on Server A received event emitted from Server B!");
    console.log("Received Data:", data);
    
    client.close();
    httpServerA.close();
    httpServerB.close();
    pubClient.quit();
    subClient.quit();
    pubA.quit();
    subA.quit();
    pubB.quit();
    subB.quit();
    console.log("Test finished successfully.");
    process.exit(0);
  });

  setTimeout(() => {
    console.log("Emitting event from Server B to room 'test-room'...");
    ioB.to("test-room").emit("cross-server-event", { message: "Hello from Server B!" });
  }, 2000);

  setTimeout(() => {
    console.error("Test timed out - cross-server event was not received.");
    process.exit(1);
  }, 10000);
}

runTest().catch(console.error);

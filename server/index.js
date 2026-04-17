import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', err => console.error('Redis Client Error', err));
await redisClient.connect().then(() => console.log('Redis connected')).catch(err => console.log('Redis connection skipped/failed:', err.message));

mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10, // Maintain up to 10 static connections
})
  .then(() => console.log('MongoDB connected with pool size 10'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const app = express();
app.use(compression()); // Compress all responses
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

import queueRoutes from './routes/queue.routes.js';
import customerRoutes from './routes/customer.routes.js';
import businessAuthRoutes from './routes/businessAuth.routes.js';

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use((req, res, next) => {
  req.io = io;
  req.redis = redisClient;
  next();
});

app.use('/api/queue', queueRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/business', businessAuthRoutes);

io.on('connection', (socket) => {
  console.log('client connected:', socket.id);

  socket.on('join-queue-room', (queueId) => {
    socket.join(queueId);
    console.log(`Socket ${socket.id} joined room ${queueId}`);
  });

  socket.on('disconnect', () => {
    console.log('client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the WaitLess server!' });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

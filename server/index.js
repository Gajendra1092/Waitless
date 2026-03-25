import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

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
  console.log(`✅ Server is running on port ${PORT}`);
});

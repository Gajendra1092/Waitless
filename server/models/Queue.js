import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  businessId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  currentNumber: {
    type: Number,
    default: 0,
  },
  avgServiceTime: {
    type: Number,
    default: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Queue = mongoose.model('Queue', queueSchema);

export default Queue;

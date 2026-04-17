import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  detail:{
    type: String,
  },
  businessId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['running', 'no customers', 'paused', 'ended'],
    default: 'running',
  },
  // i can get this by ai / name
  category: {
    type: String,
  },
  currentNumber: {
    type: Number,
    default: 0,
  },
  lastNumber:{
    type:Number,
    default: 0
  },
  //get this by ai
  avgServiceTime: {
    type: Number,
    default: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optimization: Index businessId for fast lookup of queues belonging to a specific business
queueSchema.index({ businessId: 1 });
// Optimization: Compound index for filtering running queues by business
queueSchema.index({ businessId: 1, status: 1 });

const Queue = mongoose.model('Queue', queueSchema);

export default Queue;

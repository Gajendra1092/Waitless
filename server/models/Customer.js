import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  queueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  tokenNumber: {
    type: Number,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'completed', 'skipped'],
    default: 'waiting',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  servedAt: {
    type: Date,
  },
});

// Optimization: Index queueId to quickly find customers in a specific queue
customerSchema.index({ queueId: 1 });
// Optimization: Compound index for fetching active customers (waiting/serving) in a queue
customerSchema.index({ queueId: 1, status: 1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;

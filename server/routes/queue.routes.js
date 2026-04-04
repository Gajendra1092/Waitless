import express from 'express';
import Queue from '../models/Queue.js';
import Customer from '../models/Customer.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { name, businessId } = req.body;
    if (!name || !businessId) {
      return res.status(400).json({ message: 'Name and businessId are required' });
    }
    const newQueue = new Queue({ name, businessId });
    await newQueue.save();
    res.status(201).json(newQueue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:queueId', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }
    const waitingCount = await Customer.countDocuments({
      queueId: req.params.queueId,
      status: 'waiting',
    });
    res.status(200).json({ ...queue.toObject(), waitingCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:queueId/customers', async (req, res) => {
  try {
    const customers = await Customer.find({ queueId: req.params.queueId }).sort({ position: 1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;

import express from 'express';
import Queue from '../models/Queue.js';
import Customer from '../models/Customer.js';
import notificationQueue from '../queues/notificationQueue.js';

const router = express.Router();

router.post('/:queueId/join', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const queue = await Queue.findByIdAndUpdate(
      req.params.queueId,
      { $inc: { currentNumber: 1 } },
      { new: true }
    );

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    const waitingCustomers = await Customer.countDocuments({
        queueId: req.params.queueId,
        status: 'waiting',
    });

    const newCustomer = new Customer({
      queueId: req.params.queueId,
      name,
      phone,
      tokenNumber: queue.currentNumber,
      position: waitingCustomers + 1,
    });

    await newCustomer.save();

    // PHASE 5: Add background job for SMS notification
    // We DON'T await this because we want the response to be instant
    notificationQueue.add('send-sms', {
      phone,
      name,
      tokenNumber: newCustomer.tokenNumber
    }).catch(err => console.error('Failed to add job to queue:', err));

    req.io.to(req.params.queueId).emit('queue-updated');
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:customerId', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId).lean();
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.patch('/:customerId/call', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      { status: 'serving' },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    req.io.to(customer.queueId.toString()).emit('queue-updated');
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
export default router;

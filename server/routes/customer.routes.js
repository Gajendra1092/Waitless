import express from 'express';
import Queue from '../models/Queue.js';
import Customer from '../models/Customer.js';

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

router.patch('/:customerId/complete', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      { status: 'completed', servedAt: new Date() },
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

router.patch('/:customerId/skip', async (req, res) => {
  try {
    const skippedCustomer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      { status: 'skipped' },
      { new: true }
    );

    if (!skippedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Decrement the position of subsequent customers
    await Customer.updateMany(
      {
        queueId: skippedCustomer.queueId,
        position: { $gt: skippedCustomer.position },
      },
      { $inc: { position: -1 } }
    );

    req.io.to(skippedCustomer.queueId.toString()).emit('queue-updated');
    res.status(200).json(skippedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;

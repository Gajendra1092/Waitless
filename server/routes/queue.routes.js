import express from 'express';
import Queue from '../models/Queue.js';
import Customer from '../models/Customer.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

//Protected Routes
router.post('/create',verifyToken, async (req, res) => {
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

router.get('/:queueId/customers',verifyToken, async (req, res) => {
  try {
    const customers = await Customer.find({ queueId: req.params.queueId }).sort({ position: 1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

//Public Routes
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

// router.post('/:queueId/join', async (req, res) => {
//   try {
//     const { name, phone } = req.body;

//     // 1. Find how many customers are already waiting
//     const lastCustomer = await Customer.findOne({ queueId: req.params.queueId })
//       .sort({ position: -1 }); // get the last position

//     const newPosition = lastCustomer ? lastCustomer.position + 1 : 1;

//     // 2. Build the object
//     const newCustomer = new Customer({
//       queueId: req.params.queueId,
//       name,
//       phone,
//       position: newPosition,
//       tokenNumber: newPosition, // or use a counter logic
//       status: 'waiting',
//       joinedAt: new Date(),
//     });

//     // 3. Save to DB
//     const saved = await newCustomer.save();
//     res.status(201).json(saved);

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// });






export default router;

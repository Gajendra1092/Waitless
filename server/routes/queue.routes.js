import express from 'express';
import Queue from '../models/Queue.js';
import Customer from '../models/Customer.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

//Protected Routes
router.post('/create',verifyToken, async (req, res) => {
  try {
    const {name, detail, category }  = req.body;
    const businessId = req.businessId;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required!' });
    }
    const newQueue = new Queue({ name, businessId , detail, category });
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

router.get('/categories', verifyToken, async (req, res) => {
  try {
    const businessId = req.businessId;
    const categories = await Queue.distinct('category', { businessId });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/getqueues', verifyToken, async (req, res) => {
  try {
    const businessId = req.businessId;
    const { page = 1, limit = 5, search, status, category } = req.query;

    // 1. Build the dynamic query object
    const query = { businessId };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    // 2. Pagination variables
    const skip = (Number(page) - 1) * Number(limit);

    // 3. Fetch matched queues and total count
    const queues = await Queue.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Queue.countDocuments(query);

    // 4. Format the response for the frontend Dashboard table
    const formattedQueues = await Promise.all(
      queues.map(async (q) => {
        const customersCount = await Customer.countDocuments({ queueId: q._id, status: 'waiting' });
        return {
          id: q._id,
          name: q.name,
          status: q.status,
          category: q.category,
          customers: customersCount,
        };
      })
    );

    res.status(200).json({ queues: formattedQueues, total, totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/delete/:queueId', verifyToken, async (req, res) => {
  try {
    const businessId = req.businessId;
    const queueId = req.params.queueId;

    // Ensure the queue exists and belongs to the logged-in business
    const queue = await Queue.findOne({ _id: queueId, businessId });
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found or unauthorized' });
    }

    // Delete associated customers to prevent orphaned data
    await Customer.deleteMany({ queueId });
    await Queue.findByIdAndDelete(queueId);

    res.status(200).json({ message: 'Queue and associated customers deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/pause/:queueId', verifyToken, async (req, res) => {
  try {
    const businessId = req.businessId;
    const queueId = req.params.queueId;

    // Ensure the queue exists and belongs to the logged-in business
    const queue = await Queue.findOne({ _id: queueId, businessId });
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found or unauthorized' });
    }

    // Toggle logic based on current status
    if (queue.status === 'paused') {
      // Resume logic: check waiting customers to decide if 'running' or 'No customer'
      const customersCount = await Customer.countDocuments({ queueId: queue._id, status: 'waiting' });
      queue.status = customersCount > 0 ? 'running' : 'No customer';
    } else {
      queue.status = 'paused';
    }

    await queue.save();
    res.status(200).json({ message: `Queue status changed to ${queue.status}`, queue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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

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

router.get('/:queueId/customers', async (req, res) => {
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
      queue.status = customersCount > 0 ? 'running' : 'no customers';
    } else {
      queue.status = 'paused';
    }

    await queue.save();
    res.status(200).json({ message: `Queue status changed to ${queue.status}`, queue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//QueueDetailsPage APIS
router.get('/:queueId/details', verifyToken, async (req, res) => {
  try {
    const queueId = req.params.queueId;
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    const totalWaiting = await Customer.countDocuments({ queueId, status: 'waiting' });
    const currentCustomer = await Customer.findOne({ queueId, status: 'serving' });
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const completedToday = await Customer.countDocuments({
      queueId,
      status: 'completed',
      servedAt: { $gte: startOfDay }
    });

    res.status(200).json({
      queue,
      stats: {
        totalWaiting,
        currentlyServing: currentCustomer,
        avgWait: queue.avgServiceTime || 0,
        completedToday
      },
      currentCustomer
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:queueId/waiting', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const customers = await Customer.find({ queueId: req.params.queueId, status: 'waiting' })
      .sort({ position: 1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Customer.countDocuments({ queueId: req.params.queueId, status: 'waiting' });
    
    res.status(200).json({ customers, total, totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:queueId/skipped', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const customers = await Customer.find({ queueId: req.params.queueId, status: 'skipped' })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Customer.countDocuments({ queueId: req.params.queueId, status: 'skipped' });
    
    res.status(200).json({ customers, total, totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:queueId/completed', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const customers = await Customer.find({ queueId: req.params.queueId, status: 'completed' })
      .sort({ servedAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Customer.countDocuments({ queueId: req.params.queueId, status: 'completed' });
    
    res.status(200).json({ customers, total, totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:queueId/complete', verifyToken, async (req, res) => {
  try {
    const { customerId } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(customerId);
    const query = { queueId: req.params.queueId, ...(isObjectId ? { _id: customerId } : { tokenNumber: customerId }) };
    
    const customer = await Customer.findOne(query);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.status = 'completed';
    customer.servedAt = new Date();
    await customer.save();

    req.io.to(req.params.queueId).emit('queue-updated');

    res.status(200).json({ message: 'Marked as completed', customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:queueId/skip-current', verifyToken, async (req, res) => {
  try {
    const { customerId } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(customerId);
    const query = { queueId: req.params.queueId, ...(isObjectId ? { _id: customerId } : { tokenNumber: customerId }) };
    
    const customer = await Customer.findOne(query);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.status = 'skipped';
    await customer.save();

    req.io.to(req.params.queueId).emit('queue-updated');

    res.status(200).json({ message: 'Current customer skipped', customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:queueId/skip', verifyToken, async (req, res) => {
  try {
    const { customerId } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(customerId);
    const query = { queueId: req.params.queueId, ...(isObjectId ? { _id: customerId } : { tokenNumber: customerId }) };
    
    const customer = await Customer.findOne(query);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.status = 'skipped';
    await customer.save();

    // Decrement position of subsequent waiting customers
    await Customer.updateMany(
      {
        queueId: req.params.queueId,
        status: 'waiting',
        position: { $gt: customer.position },
      },
      { $inc: { position: -1 } }
    );

    req.io.to(req.params.queueId).emit('queue-updated');

    res.status(200).json({ message: 'Customer skipped', customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:queueId/undo-skip', verifyToken, async (req, res) => {
  try {
    const { customerId } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(customerId);
    const query = { queueId: req.params.queueId, ...(isObjectId ? { _id: customerId } : { tokenNumber: customerId }) };
    
    const customer = await Customer.findOne(query);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Append them back to the end of the queue
    const lastCustomer = await Customer.findOne({ queueId: req.params.queueId, status: 'waiting' }).sort({ position: -1 });
    const newPosition = lastCustomer ? lastCustomer.position + 1 : 1;

    customer.status = 'waiting';
    customer.position = newPosition;
    await customer.save();

    req.io.to(req.params.queueId).emit('queue-updated');

    res.status(200).json({ message: 'Undo skip successful', customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Display Routes



//Public Routes
router.get('/:queueId', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId).lean();
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }
    const waitingCount = await Customer.countDocuments({
      queueId: req.params.queueId,
      status: 'waiting',
    });
    res.status(200).json({ ...queue, waitingCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


// ========================
// ANALYTICS ROUTES
// ========================
router.get('/analytics/data', verifyToken, async (req, res) => {
  try {
    const businessId = req.businessId;
    
    // 1. Get all queues for this business
    const queues = await Queue.find({ businessId }).lean();
    const queueIds = queues.map(q => q._id);

    if (queueIds.length === 0) {
      return res.status(200).json({ totalCompleted: 0, totalSkipped: 0, avgWait: 0, weeklyTrend: [], queueDistribution: [] });
    }

    // 2. Today's Stats
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const totalCompleted = await Customer.countDocuments({ queueId: { $in: queueIds }, status: 'completed', servedAt: { $gte: startOfDay } });
    const totalSkipped = await Customer.countDocuments({ queueId: { $in: queueIds }, status: 'skipped', updatedAt: { $gte: startOfDay } });
    
    // Calculate Average Wait Time for today (Difference between joinedAt and servedAt)
    const completedToday = await Customer.find({ queueId: { $in: queueIds }, status: 'completed', servedAt: { $gte: startOfDay } }).lean();
    let totalWaitTimeMs = 0;
    completedToday.forEach(c => {
      if (c.createdAt && c.servedAt) {
        totalWaitTimeMs += (new Date(c.servedAt) - new Date(c.createdAt));
      }
    });
    const avgWait = completedToday.length > 0 ? Math.round(totalWaitTimeMs / completedToday.length / 60000) : 0;

    // 3. Weekly Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyTrendRaw = await Customer.aggregate([
      { $match: { queueId: { $in: queueIds }, status: 'completed', servedAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%m-%d", date: "$servedAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // 4. Queue Distribution (Pie Chart)
    const queueDistribution = await Promise.all(queues.map(async (q) => {
        const count = await Customer.countDocuments({ queueId: q._id, status: 'completed', servedAt: { $gte: sevenDaysAgo }});
        return { name: q.name, value: count };
    }));

    res.status(200).json({ totalCompleted, totalSkipped, avgWait, weeklyTrend: weeklyTrendRaw.map(w => ({ date: w._id, customers: w.count })), queueDistribution: queueDistribution.filter(q => q.value > 0) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

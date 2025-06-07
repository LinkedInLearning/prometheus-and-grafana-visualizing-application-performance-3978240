import express from 'express';
import db from './database.js';
import { metrics } from './metrics.js';

const router = express.Router();

// Create a new order
router.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    const newOrder = await db.createOrder(orderData);
    
    metrics.trackOrderOperation('create');
    res.status(201).json(newOrder);
  } catch (err) {
    metrics.trackOrderOperation('create', false);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    
    metrics.trackOrderOperation('list');
    res.json(orders);
  } catch (err) {
    metrics.trackOrderOperation('list', false);
    res.status(500).json({ error: 'Failed to retrieve orders', details: err.message });
  }
});

// Update an order
router.put('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderData = req.body;
    
    const updatedOrder = await db.updateOrder(orderId, orderData);
    
    metrics.trackOrderOperation('update');
    res.json(updatedOrder);
  } catch (err) {
    metrics.trackOrderOperation('update', false);
    if (err.message === 'Order not found') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
});

// Delete an order
router.delete('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const deleted = await db.deleteOrder(orderId);
    
    if (!deleted) {
      metrics.trackOrderOperation('delete', false);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    metrics.trackOrderOperation('delete');
    res.status(204).send();
  } catch (err) {
    metrics.trackOrderOperation('delete', false);
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
});

export default router;
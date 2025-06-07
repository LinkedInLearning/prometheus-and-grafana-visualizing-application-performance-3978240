import * as redis from 'redis';
import { v4 as uuidv4 } from 'uuid';

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

// Error handling
client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Connect to Redis with detailed logging
const connectRedis = async () => {
  try {
    console.log('Attempting to connect to Redis...');
    await client.connect();
    console.log('Connected to Redis successfully');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    console.error('Redis connection error details:', err.message, err.stack);
    throw err;
  }
};

// Initialize connection with more logging
const initializeDatabase = async () => {
  try {
    await connectRedis();
  } catch (err) {
    console.error('Database initialization failed', err);
    process.exit(1);
  }
};

// Initialize on module load
initializeDatabase();

// Separate function for getting order by ID
const getOrderById = async (id) => {
  const orderKey = `order:${id}`;
  
  const orderData = await client.hGetAll(orderKey);
  
  if (Object.keys(orderData).length === 0) {
    return null;
  }

  // Parse stringified values
  return Object.keys(orderData).reduce((acc, k) => {
    try {
      acc[k] = JSON.parse(orderData[k]);
    } catch {
      acc[k] = orderData[k];
    }
    return acc;
  }, {});
};

// Order operations
export default {
  // Create a new order
  createOrder: async (order) => {
    const orderId = uuidv4();
    const orderKey = `order:${orderId}`;
    
    const fullOrder = {
      ...order,
      id: orderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await client.hSet(orderKey, Object.entries(fullOrder).reduce((acc, [key, value]) => {
      acc[key] = JSON.stringify(value);
      return acc;
    }, {}));

    await client.sAdd('orders', orderKey);

    return fullOrder;
  },

  // Get all orders
  getAllOrders: async () => {
    const orderKeys = await client.sMembers('orders');
    
    const orders = await Promise.all(
      orderKeys.map(async (key) => {
        const orderData = await client.hGetAll(key);
        
        return Object.keys(orderData).reduce((acc, k) => {
          try {
            acc[k] = JSON.parse(orderData[k]);
          } catch {
            acc[k] = orderData[k];
          }
          return acc;
        }, {});
      })
    );

    return orders.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  },

  // Update an order
  updateOrder: async (id, orderUpdates) => {
    const orderKey = `order:${id}`;
    
    // Verify order exists
    const exists = await client.sIsMember('orders', orderKey);
    if (!exists) {
      throw new Error('Order not found');
    }

    // Get existing order
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Update order data
    const updatedOrder = {
      ...existingOrder,
      ...orderUpdates,
      updated_at: new Date().toISOString()
    };

    // Store updated order
    await client.hSet(orderKey, Object.entries(updatedOrder).reduce((acc, [key, value]) => {
      acc[key] = JSON.stringify(value);
      return acc;
    }, {}));

    return updatedOrder;
  },

  // Get a specific order by ID
  getOrderById,

  // Delete an order
  deleteOrder: async (id) => {
    const orderKey = `order:${id}`;
    
    // Remove from orders set
    await client.sRem('orders', orderKey);
    
    // Delete the order hash
    const deletedCount = await client.del(orderKey);

    return deletedCount > 0;
  },

  // Expose client for potential direct use or testing
  _client: client
};
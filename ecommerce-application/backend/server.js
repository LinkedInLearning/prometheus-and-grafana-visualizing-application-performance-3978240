import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { metrics } from './metrics.js';
import orderRoutes from './routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(metrics.requestMetricsMiddleware);

// Routes
app.use('/api', orderRoutes);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  // // Simulate latency for testing alerts
  // await new Promise(resolve => setTimeout(resolve, 1000));
  res.set('Content-Type', metrics.register.contentType);
  res.end(await metrics.register.metrics());
});

// Serve static frontend files
app.use(express.static('../frontend'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
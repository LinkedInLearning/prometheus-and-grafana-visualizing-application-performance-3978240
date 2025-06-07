import * as client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Create metrics for RED (Request, Error, Duration) and USE (Utilization, Saturation, Errors) principles
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestsDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10]
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const orderOperationsTotal = new client.Counter({
  name: 'order_operations_total',
  help: 'Total number of order operations',
  labelNames: ['operation']
});

const orderOperationErrors = new client.Counter({
  name: 'order_operation_errors_total',
  help: 'Total number of order operation errors',
  labelNames: ['operation']
});

// Register metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestsDuration);
register.registerMetric(activeConnections);
register.registerMetric(orderOperationsTotal);
register.registerMetric(orderOperationErrors);

// Default metrics collection
client.collectDefaultMetrics({ register });

export const metrics = {
  register,
  
  httpRequestsTotal,
  httpRequestsDuration,
  activeConnections,
  orderOperationsTotal,
  orderOperationErrors,
  
  // Middleware for tracking request metrics
  requestMetricsMiddleware: (req, res, next) => {
    const end = httpRequestsDuration.startTimer({
      method: req.method,
      route: req.path
    });

    activeConnections.inc();

    res.on('finish', () => {
      end();
      activeConnections.dec();

      httpRequestsTotal.inc({
        method: req.method,
        route: req.path,
        status: res.statusCode
      });
    });

    next();
  },

  // Helper to track order operation metrics
  trackOrderOperation: (operation, success = true) => {
    orderOperationsTotal.inc({ operation });
    if (!success) {
      orderOperationErrors.inc({ operation });
    }
  }
};
# Ecommerce Order Management Application

## Overview

A modern, scalable order management system built with:
- Node.js Express backend
- Redis database
- Vanilla JavaScript frontend
- Nginx reverse proxy
- Prometheus metrics support
- Docker containerization

## Key Features
- Create, Read, Update, Delete (CRUD) operations for orders
- Responsive single-page application
- Metrics and observability
- Easy deployment with Docker
- Microservices architecture

## Prerequisites
- Docker
- Docker Compose
- Git

## Architecture
```
┌───────────┐     ┌───────────┐     ┌───────────┐
│  Nginx    │ ←→  │  Backend  │ ←→  │   Redis   │
│  (Web)    │     │ (Express) │     │  (Store)  │
└───────────┘     └───────────┘     └───────────┘
       ↑                ↑
       │                │
       └─── Prometheus  │
```

## Quick Start

### Installation

1. Clone the repository
```bash
git clone https://github.com/LinkedInLearning/prometheus-and-grafana-visualizing-application-performance-3978240.git
cd ecommerce-application
```

2. Build and start the application
```bash
docker-compose up --build
```

3. Access the application
- Frontend: http://localhost:3001
- API Endpoint: http://localhost:3000/api/orders
- Metrics: http://localhost:3000/metrics
- Prometheus Dashboard: http://localhost:9090
- Grafana: http://localhost:3500

## Development

### Backend Development
- Language: Node.js with ES Modules
- Database: Redis
- Framework: Express.js

### Frontend
- Vanilla JavaScript
- Single-page application
- No external libraries

## API Endpoints

### Orders

- `GET /api/orders`: List all orders
- `POST /api/orders`: Create a new order
- `PUT /api/orders/:id`: Update an existing order
- `DELETE /api/orders/:id`: Delete an order

## Monitoring and Metrics

The application exposes Prometheus metrics covering:

### RED Metrics (Request, Error, Duration)
- `http_requests_total`: Total number of HTTP requests
- `http_request_duration_seconds`: Request duration

### USE Metrics (Utilization, Saturation, Errors)
- `active_connections`: Number of active connections
- `order_operations_total`: Total order operations
- `order_operation_errors_total`: Order operation errors

## Environment Variables

- `PORT`: Backend server port (default: 3000)
- `REDIS_URL`: Redis connection URL

## Deployment

### Production Considerations
- Use a production-ready Redis instance
- Configure proper network security
- Set up SSL/TLS
- Implement proper authentication

## Troubleshooting

### Common Issues
- Ensure Docker and Docker Compose are installed
- Check network connectivity
- Verify Redis is running
- Review container logs with `docker-compose logs`

## Technologies
- Backend: Node.js, Express
- Database: Redis
- Frontend: Vanilla JavaScript
- Proxy: Nginx
- Observability: Prometheus
- Containerization: Docker
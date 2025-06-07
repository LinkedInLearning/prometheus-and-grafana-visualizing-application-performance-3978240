# Backend Dockerfile
FROM --platform=linux/arm64 node:18-alpine

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    build-base

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY backend/package*.json ./

# Install dependencies with verbose output
RUN npm install --verbose

# Copy backend source code
COPY backend/ .

# Create data directory
RUN mkdir -p /usr/src/app/data

# Verify installation
RUN npm list redis || echo "Redis module not found"

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
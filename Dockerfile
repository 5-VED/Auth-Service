# Development Dockerfile with hot reloading support
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

ENV ENV=development \
    PORT=3000 \
    MEMORY_USAGE_TIMEOUT=300000 \
    MONGO_URI=mongodb://localhost:27017/paymentsvc \
    REDIS_HOST=host.docker.internal \
    REDIS_PORT=6379 \
    REDIS_PASSWORD= \
    REDIS_DB=0 \
    REDIS_TLS=false \
    JWT_SECRET_KEY=b4e6d0f9b9e14fbe8b64d2a9f7c3b2a0d8f1e6a7c9b0d4e3f7a6b5c8d1f2a3e4 \
    JWT_EXPIRES_IN=24h

# Expose ports
EXPOSE 3000

# Start with nodemon for hot reloading
CMD ["npm", "run", "start:dev"]

# Multi-stage build for YoungHouse Web Application

# Stage 1: Build frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup backend
FROM node:18-alpine as backend-setup
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Stage 3: Final production image
FROM node:18-alpine
WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy backend files
COPY --from=backend-setup /app/backend ./backend
COPY --from=backend-setup /app/backend/node_modules ./backend/node_modules

# Copy built frontend files
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Create uploads directory with proper permissions
RUN mkdir -p /app/backend/uploads && chown -R node:node /app/backend/uploads

# Copy root package.json if exists
COPY package*.json ./

# Expose port
EXPOSE 5000

# Switch to non-root user
USER node

# Start the application
CMD ["pm2-runtime", "start", "backend/server.js", "--name", "younghouse-api"]
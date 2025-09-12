# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install adapter-node for containerized deployment
RUN npm install @sveltejs/adapter-node

# Copy source files
COPY . .

# Accept DATABASE_URL as build argument
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/build ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
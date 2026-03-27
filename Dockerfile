# Base stage with common dependencies
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Development stage
FROM base AS development

# Install dev dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Command for development (hot reload)
CMD ["npm", "run", "start:dev"]

# Production stage
FROM base AS production

# Install all dependencies for production build
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production command
CMD ["npm", "run", "start:prod"]
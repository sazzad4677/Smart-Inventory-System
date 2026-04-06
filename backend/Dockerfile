# Stage 1: Build
FROM node:20-alpine AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/

# Install all dependencies (needed for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm --filter backend build

# Deploy the backend to a standalone folder for production
RUN pnpm --filter backend --prod deploy /usr/src/app/deployed --legacy

# Stage 2: Production
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy the deployed standalone folder from builder
COPY --from=builder /usr/src/app/deployed ./

# Expose backend port
EXPOSE 5000

# Set environment variable for production
ENV NODE_ENV=production

# Run the production server
CMD ["node", "dist/index.js"]
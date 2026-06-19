# Stage 1: Base
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

# Stage 2: Deps
FROM base AS deps
WORKDIR /usr/src/app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 3: Development
FROM deps AS development
WORKDIR /usr/src/app
COPY backend/prisma ./backend/prisma
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db" pnpm --filter backend exec prisma generate
COPY . .

# Stage 4: Builder (Production build)
FROM development AS builder
RUN pnpm --filter backend build

# Deploy only the backend and its prod dependencies to a separate folder
RUN pnpm --filter backend --prod deploy /usr/src/app/deployed --legacy

# Stage 5: Production
FROM node:20-alpine AS production
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Copy deployed files from builder
COPY --from=builder /usr/src/app/deployed ./

# Create logs directory
RUN mkdir -p logs && chown node:node logs

USER node
EXPOSE 5000
CMD ["node", "dist/index.js"]
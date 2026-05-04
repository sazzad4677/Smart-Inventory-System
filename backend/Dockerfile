# Stage 1: Base
FROM node:20-alpine AS base
RUN npm install -g pnpm

# Stage 2: Deps
FROM base AS deps
WORKDIR /usr/src/app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile

# Stage 3: Development
FROM deps AS development
WORKDIR /usr/src/app
# Copy the rest of the files for Prisma generation (need schema.prisma)
COPY . .
RUN pnpm --filter backend exec prisma generate

# Stage 4: Builder (Production build)
FROM development AS builder
RUN pnpm --filter backend build
RUN pnpm --filter backend --prod deploy /usr/src/app/deployed --legacy

# Stage 5: Production
FROM node:20-alpine AS production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/deployed ./
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
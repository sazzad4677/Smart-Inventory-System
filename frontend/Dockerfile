# Stage 1: Deps
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy workspace and lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/frontend/node_modules ./frontend/node_modules
COPY . .

# Build the application
RUN pnpm --filter frontend build

# Step 4: Runner
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from builder
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/frontend/.next/standalone ./

# Copy static assets to the correct package subfolder
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/frontend/.next/static ./frontend/.next/static

# Set the correct permission for prerender cache
RUN mkdir -p frontend/.next
RUN chown nextjs:nodejs frontend/.next

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "frontend/server.js"]
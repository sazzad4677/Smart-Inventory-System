# Stage 1: Base
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
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
COPY . .

# Stage 4: Builder
FROM development AS builder
RUN pnpm --filter frontend build

# Stage 5: Runner
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/frontend/.next/static ./frontend/.next/static
RUN mkdir -p frontend/.next
RUN chown nextjs:nodejs frontend/.next
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "frontend/server.js"]
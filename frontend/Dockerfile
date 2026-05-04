# Stage 1: Base
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

# Stage 2: Deps
FROM base AS deps
WORKDIR /usr/src/app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile

# Stage 3: Builder
FROM deps AS builder
WORKDIR /usr/src/app
# Copy the whole repo but build will only focus on frontend
COPY . .
# Next.js build needs these env vars often if they are baked in, 
# but here we use them at runtime mostly. 
# However, during build, NEXT_PUBLIC_ vars might be needed.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter frontend build

# Stage 4: Runner
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/frontend/.next/static ./frontend/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "frontend/server.js"]
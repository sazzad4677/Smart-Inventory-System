# 🚀 Deployment & Infrastructure Guide

This guide provides technical details on the architecture, scaling strategies, and automated pipelines required to move the Smart Inventory System from a local development environment to a production-ready cloud infrastructure.

---

## 🏗️ 1. PostgreSQL Transactions

Our system relies on **Prisma Transactions** (e.g., during order creation where we must update stock and create activity logs simultaneously). PostgreSQL natively supports these ACID transactions.

### 💻 Development Setup

In local development, we use a PostgreSQL container automatically initiated via `docker-compose.yml`:

```yaml
# docker-compose.yml snippet
image: postgres:15-alpine
environment:
  POSTGRES_DB: smart_inventory
```

### ☁️ Production Recommendation

For production, use a managed database service.

- **Recommended**: [Neon](https://neon.tech/) or [Supabase](https://supabase.com/) (Managed Service).
- **Self-hosting**: Ensure you configure high availability and regular backups.
- **Connection String**: Ensure your `DATABASE_URL` is set to the correct PostgreSQL connection string.

---

## 📉 2. Scaling Redis & Rate Limiting

We use Redis through the `rate-limit-redis` middleware to ensure rate limiting is consistent across multiple backend instances.

### 🛡️ Shared State

When you scale your backend to multiple containers (e.g., behind a Load Balancer), local memory rate limiting fails because users might hit different instances.

- By using a centralized **Redis instance**, all backend nodes share the same "request counters."

### 🚀 Production Scaling

- **Redis Cluster**: For massive scale, use a Redis Cluster.
- **Managed Services**: Use [Redis Cloud](https://redislabs.com/redis-enterprise-cloud/) or [AWS ElastiCache](https://aws.amazon.com/elasticache/redis/).
- **Persistence**: While rate limiting is transient, consider enabling **AOF (Append Only File)** persistence if you start using Redis for caching critical application state.

---

## 🔄 3. CI/CD Pipeline (GitHub Actions)

The project includes a robust automated pipeline located in `.github/workflows/ci.yml`.

### The "Road to Production" Workflow

1. **Build & Verify**:
   - **Linting**: Checks code style and conventional commits.
   - **Unit/Integration Tests**: Runs the full Jest suite (Auth, Orders, Products, etc.).
   - **Coverage Check**: Ensures coverage meets the defined thresholds (>95% lines).
2. **Compilation Check**:
   - Verifies both Backend (TypeScript) and Frontend (Next.js) compile without errors.
3. **Docker Validation**:
   - Runs `docker compose build` to ensure the production images are valid.
4. **Automated Deployment**:
   - **PR Review**: Only runs build/tests.
   - **Push to Main**: Once tests pass, it triggers **Deploy Hooks**:
     - **Vercel**: Triggers frontend redeploy.
     - **Render**: Triggers backend redeploy.

---

## 🛡️ 4. Production Security Checklist

Before a live launch, ensure the following are configured:

- [ ] **Secrets Management**: Move all `.env` variables to a secure Vault (GitHub Secrets, Vercel Env, etc.).
- [ ] **CORS Policy**: Restrict `CORS_ORIGIN` to your specific production domain.
- [ ] **Rate Limiting**: Adjust `MAX_REQUESTS` based on expected traffic.
- [ ] **Monitoring**: Set up **Winston Daily Rotate File** or a cloud logging service (e.g., Loggly / Datadog).
- [ ] **Database Backups**: Enable automated daily backups for PostgreSQL.

---

> [!TIP]
> For detailed API usage, refer to the [Interactive Swagger Docs](http://localhost:5000/api-docs) or the live deployment link in the root README.

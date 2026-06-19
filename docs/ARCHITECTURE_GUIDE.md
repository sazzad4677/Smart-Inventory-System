# 🏛️ Technical Architecture & Design Guide

This document provides a deep dive into the architectural decisions, design patterns, and "Smart" logic that powers the **Smart Inventory Management System**. It is intended for developers, architects, and recruiters looking to understand the system's technical depth.

---

## 🧩 1. System Philosophy: The Service-Controller Pattern

The codebase follows a strictly decoupled **Service-Controller** architecture. This ensures that business logic is isolated from the HTTP layer (Express), making the system highly testable and maintainable.

- **Controllers**: Handle request validation, parameter parsing, and sending unified responses.
- **Services**: Contain the core business logic, database transactions, and integrations with external services (AI, Socket.io).
- **Builders**: A custom approach using Prisma handles complex filtering, sorting, and pagination across all modules.

---

## 🤖 2. AI-Driven Intelligence (Gemini Integration)

One of the system's core "Smart" features is the **AI Insights Engine**.

### 🛠️ Implementation

Located in [`ai.service.ts`](../backend/src/services/ai.service.ts), the engine uses the `google-generative-ai` SDK to interface with **Gemini 1.5 Flash**.

### 🔄 The Insight Loop

1. **Data Aggregation**: The dashboard service collects real-time stats: revenue trends, inventory levels, and category distributions.
2. **Contextual Prompting**: A structured prompt is generated, treating the AI as an "Expert Inventory Analyst."
3. **Magic Tips**: The AI returns 3 concise, actionable "Magic Tips" (e.g., "⚠️ Warning: Electronics stock is dropping 20% faster than average—consider restocking today.").

---

## ⚡ 3. Real-Time Event Engine (Socket.io)

Consistency is critical in inventory management. When a staff member processes an order, everyone else's dashboard should update instantly.

### 📡 Event Broadcasting

- **Global Updates**: Critical actions like `Order Creation`, `Product Updates`, and `Restock Status` triggers are broadcasted via `io.emit`.
- **Activity Feed**: The **Live Activity Audit** uses Socket.io to stream system logs to the frontend as they happen, eliminating the need for page refreshes.
- **Service Integration**: Services call the `app.get('io')` instance to trigger events after successful database commits.

---

## 💾 4. Transaction & Data Integrity

We utilize **Prisma Transactions** to ensure ACID compliance during complex operations.

### 🏦 The Order Lifecycle

During order creation ([`order.service.ts`](../backend/src/services/order.service.ts)):

1. **Start Transaction**: A Prisma transaction is initiated.
2. **Atomic Updates**:
   - Stock for each product is deducted.
   - Restock flags are set if thresholds are hit.
   - An Order document is created.
   - OrderItem child documents are linked.
   - An Activity Log entry is generated.
3. **Commit/Abort**: If any step fails (e.g., a product goes out of stock mid-transaction), the entire operation rolls back.

> [!NOTE]
> This utilizes PostgreSQL's native transaction handling to ensure atomicity.

---

## 🔐 5. Security & Session Management

Beyond basic RBAC, the system implements enterprise-grade session control.

### 🛡️ Invite-Only Registration

To prevent unauthorized access, user enrollment is strictly **invite-only**:

1. Admin sends a secure invitation token via email.
2. The token is cryptographically verified.
3. Upon signup, the token is permanently consumed to prevent reuse.

### 🔄 JWT Rotation & Redis

- **Refresh Token Rotation**: Each time an access token expires, the client uses a refresh token which is then invalidated and replaced by a new one (rotation).
- **Remote Session Revocation**: Valid sessions are tracked in a `sessions` collection. Admins can instantly revoke all sessions for a specific user, effectively "kicking" them out globally by deleting their session records from the database/cache.

---

## 📦 6. Smart Restock Logic

The **Restock Queue** uses an intelligent prioritization algorithm:

- **🔴 High Priority**: Stock is exactly `0`.
- **🟡 Medium Priority**: Stock is at or below `50%` of the `min_threshold`.
- **🟢 Low Priority**: Stock is below the `min_threshold` but above 50%.

This logic ensures managers focus on the most critical shortages first.

---

## 📈 7. Scalability Patterns

1. **Redis Caching**: Used for global API rate limiting to prevent brute-force attacks.
2. **Optimized Skeletons**: The UI uses custom React loading skeletons that understand the data structure, providing a perceived performance boost.
3. **URL State Sync**: All filters and table states are synced with the browser URL, allowing for shareable "searched" views between staff members.

---

## 🛠️ Advanced Development (Folder Map)

```text
src/
├── builders/     # High-level Query abstraction
├── config/       # Environment & Connection logic
├── controllers/  # HTTP Handlers
├── middlewares/  # Security, Logging, Rate Limiting
├── prisma/       # Prisma Schema and Migrations
├── routes/       # API Endpoint Definitions
├── services/     # THE BRAIN: Dedicated Business Logic
└── utils/        # Shared Helper Functions
```

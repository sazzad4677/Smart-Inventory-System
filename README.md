# 🚀 Smart Inventory Management System

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Latest-DC382D?logo=redis)](https://redis.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A high-performance, enterprise-grade inventory management solution designed for real-time tracking, automated restock management, and comprehensive order analytics. This system is built for speed, scalability, and developer experience.

---

## 🌐 Live Deployment

| Service               | URL                                                                                                  |
| :-------------------- | :--------------------------------------------------------------------------------------------------- |
| **Frontend**          | [https://smart-inventory.sazzad.dev](https://smart-inventory.sazzad.dev)                             |
| **API Documentation** | [https://api.smart-inventory.sazzad.dev/api-docs/](https://api.smart-inventory.sazzad.dev/api-docs/) |

### 🔑 Demo Credentials

| Role        | Email              | Password     |
| :---------- | :----------------- | :----------- |
| **Admin**   | `admin@demo.com`   | `admin123`   |
| **Manager** | `manager@demo.com` | `manager123` |

---

## ✨ Features

### 🛡️ Advanced Security

- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admin, Manager, and Staff roles.
- **Invite-Only Enrollment**: Advanced membership security—new users can only register via authenticated email invitations with expiring secure tokens.
- **NextAuth 5 (Beta)**: Secure, modern authentication with JWT rotation and "Refresh Lock" mechanisms.
- **Rate Limiting**: Redis-backed protection against brute-force and API abuse.
- **Validation**: Strict schema validation using Zod on both frontend and backend.

### 📊 Intelligence & Monitoring

- **Real-time Synchronization**: Live updates for Activity Logs and Order Tables via Socket.io, ensuring all staff see changes instantly.
- **Real-time Dashboard**: Live updates on stock levels and system metrics.
- **Remote Session Revocation**: Admins can instantly monitor and terminate any active user session across all devices.
- **Automated Restock Queue**: Intelligent identification of low-stock items with a dedicated resolution workflow.
- **Activity Audit**: Persistent, real-time logging of all critical system actions with **Undo/Redo** support for product deletions.

### 📦 Operational Excellence

- **Inventory Management**: Comprehensive CRUD for products with multi-attribute tracking, image support, and bulk operations.
- **Deletion Safeguards**: Intelligent business logic prevents the deletion of products that are linked to existing order history.
- **Order Lifecycle**: End-to-end tracking from pending to delivery with automated stock adjustments and real-time status updates.
- **Swagger UI**: Interactive API documentation for seamless integration.

### 🎨 Modern UI/UX

- **Skeleton Loading States**: Professional, content-aware loading skeletons (including specialized table skeletons) replace global spinners.
- **Component-Driven Tables**: Reusable, modular `DataTable` and `FilterBar` logic with URL-synced state management.
- **Glassmorphic Action Modals**: Custom-themed confirmation dialogs replacing native browser popups for a premium, unified look.
- **Tailwind CSS 4**: Utilizing the latest CSS capabilities for a blazing-fast, modern interface.
- **Shadcn UI**: High-quality, accessible components for a premium look and feel.
- **Mobile First**: Fully responsive design optimized for all device sizes.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **State Management**: Zustand
- **Auth**: NextAuth.js v5 (Beta)
- **Styling**: Tailwind CSS 4, Lucide Icons, Shadcn UI
- **Real-time**: Socket.io-client
- **Hooks/Forms**: React Hook Form, Sonner (Toasts)

### Backend

- **Runtime**: Node.js 22 (CommonJS/TypeScript)
- **Framework**: Express 5.2.x
- **Database**: MongoDB 6.0 (Mongoose) with Replica Set support for transactions.
- **Caching/Rate Limit**: Redis
- **Docs**: Swagger UI (OpenAPI 3.0)
- **Logging**: Winston, Morgan
- **Real-time**: Socket.io
- **Validation**: Zod (Shared schemas)

---

## 📐 Architecture & Workflow

### 🏙️ High-Level Architecture (Infrastructure)

Shows the Docker service orchestration, internal networking, and the relationship between the Frontend, Backend, Redis, and MongoDB Replica Set.

![Architecture Diagram](./docs/media/architecture_diagram.png)

### 🗄️ Entity Relationship Diagram (ERD)

The database schema is designed for high data integrity and efficient auditing. It features a normalized structure for products and categories with a robust link to activity logs for real-time auditing.

![ERD Diagram](./docs/media/erd_diagram.png)

### 🔄 System Flow Chart

The application follows a clean, event-driven architecture using Socket.io for real-time updates and a modern "Auth-Proxy" layer for secure session management.

![Flow Chart](./docs/media/flow_chart.png)

### 🔐 Authentication & Token Rotation

A detailed sequence showing how the Next.js Middleware and Auth Proxy layer handle JWT rotation and session persistence securely.

![Auth Sequence](./docs/media/auth_sequence.png)

### 👥 Role-Based Access Control (RBAC)

Visualizes the permission hierarchy (Staff → Manager → Admin) and the specific system actions available to each user role.

![Use Case Diagram](./docs/media/use-case-diagram.png)

---

## 🧪 Testing Architecture

The project maintains a rigorous quality standard with a comprehensive suite of unit and integration tests powered by **Jest**.

### 🛠️ Coverage Metrics

- **Statements**: >95%
- **Branches**: >80%
- **Functions**: >90%
- **Lines**: >95%

### 📂 Test Suites

The backend includes over **30 specialized test files** covering:

- **Controllers**: Unit tests for Auth, Product, Order, Category, and Dashboard logic.
- **Services**: Business logic validation including Undo/Redo state management and staff permission guards.
- **Integrations**: Full API flow validation for Authentication, Inventory, and Order workflows.
- **Auditing**: Verification of real-time event broadcasting and activity logging accuracy.

### 🚀 Running Tests

```bash
cd backend
pnpm test          # Run all tests
pnpm run test:watch  # Watch mode
pnpm run test:coverage # Generate coverage report
```

---

## ⚙️ Local Development

### 📋 Prerequisites

- **Node.js**: v18+
- **pnpm**: v9+ (Highly recommended)
- **Docker**: For running MongoDB/Redis easily

### 1. Repository Setup

```bash
git clone https://github.com/sazzad4677/Smart-Inventory-System.git
cd Smart-Inventory-System
pnpm install
```

### 2. Environment Configuration

Initialize your environment variables from the templates:

```bash
# Backend
cp backend/.env.example backend/.env.local

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 3. Database Seeding

Populate your database with high-quality sample data:

```bash
cd backend
pnpm run seed
```

### 4. Running the App

From the root directory:

```bash
pnpm dev
```

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5000`
- **API Docs**: `http://localhost:5000/api-docs`

---

## 🐳 Docker Architecture

The project leverages a multi-container Docker architecture to ensure environment consistency across development and production.

### 📦 Services Orchestration

- **`frontend`**: Next.js 15 app running in a Node environment.
- **`backend`**: Express API server with hot-reloading enabled via volume mapping.
- **`mongodb`**: Primary persistent database with volume storage.
- **`redis`**: High-performance key-value store for session caching and rate limiting.

### 🚀 Deployment Commands

From the root directory, spin up the entire ecosystem:

```bash
docker compose up --build
```

### 🛡️ Technical Details

- **Networking**: All services communicate over an internal virtual network, isolating them from unauthorized external access.
- **Persistence**: Database state is kept across container restarts using the `mongodb_data` named volume.
- **Performance**: Multi-stage builds are used in the `Dockerfile`s to minimize image sizes for production.

---

## 🚀 Deployment & Infrastructure

For a detailed guide on moving this project to production, covering **MongoDB Replica Sets**, **Redis Scaling**, and **CI/CD Pipelines**, please refer to our:

👉 **[Deployment & Infrastructure Guide](./docs/DEPLOYMENT.md)**

---

## 🧪 Quality Standards

- **TypeScript**: 100% type safety across the monorepo.
- **Commits**: Conventional Commits enforced via **Husky** & **Commitlint**.
- **Linting**: ESLint & Prettier for consistent code style.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

# 🚀 Smart Inventory Management System

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
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

- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admin and Manager roles.
- **NextAuth 5 (Beta)**: Secure, modern authentication with JWT rotation.
- **Rate Limiting**: Redis-backed protection against brute-force and API abuse.
- **Validation**: Strict schema validation using Zod on both frontend and backend.

### 📊 Intelligence & Monitoring

- **Real-time Dashboard**: Live updates on stock levels, order status, and system activity via Socket.io.
- **Automated Restock Queue**: Intelligent identification of low-stock items with a dedicated resolution workflow.
- **Health Monitoring**: Public `/health` endpoint for uptime, memory usage, and service state (DB/Redis).
- **Analytics Engine**: Tracking for API response times and client-side engagement metrics.

### 📦 Operational Excellence

- **Inventory Management**: Comprehensive CRUD for products with multi-attribute tracking and image support.
- **Order Lifecycle**: End-to-end tracking from pending to delivery with automated stock adjustments.
- **Activity Audit**: Persistent logging of all critical system actions for compliance and debugging.
- **Swagger UI**: Interactive API documentation for seamless integration.

### 🎨 Modern UI/UX

- **Tailwind CSS 4**: Utilizing the latest CSS capabilities for a blazing-fast, modern interface.
- **Shadcn UI**: High-quality, accessible components for a premium look and feel.
- **Mobile First**: Fully responsive design optimized for all device sizes.
- **Dark Mode Native**: Seamless theme switching with system preference detection.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **State Management**: Zustand
- **Auth**: NextAuth.js v5 (Beta)
- **Styling**: Tailwind CSS 4, Lucide Icons, Shadcn UI
- **Real-time**: Socket.io-client
- **Hooks/Forms**: React Hook Form, Sonner (Toasts)

### Backend

- **Runtime**: Node.js 22 (CommonJS/TypeScript)
- **Framework**: Express 5.2.x
- **Database**: MongoDB 6.0 (Mongoose)
- **Caching/Rate Limit**: Redis
- **Docs**: Swagger UI (OpenAPI 3.0)
- **Logging**: Winston, Morgan
- **Real-time**: Socket.io

---

## 🧪 Testing Architecture

The project maintains a high-quality codebase through a comprehensive suite of unit and integration tests powered by **Jest**.

### 🛠️ Testing Tools

- **Framework**: [Jest](https://jestjs.io/)
- **API Testing**: [Supertest](https://github.com/ladjs/supertest)
- **Database Mocking**: [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server) for isolated integration tests.
- **Assertions**: Custom matchers and Zod schema validation.

### 📂 Test Suites

The backend includes over 12 specialized test suites covering:

- **Controllers**: Unit tests for Auth, Product, Order, Category, and Dashboard logic.
- **Integrations**: Full API flow validation for Authentication and Inventory workflows.
- **System**: Health check and middleware performance testing.

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
cp backend/.env.example backend/.env

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

## 🧪 Quality Standards

- **TypeScript**: 100% type safety across the monorepo.
- **Commits**: Conventional Commits enforced via **Husky** & **Commitlint**.
- **Linting**: ESLint & Prettier for consistent code style.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

# 🌐 Smart Inventory System - Backend

This is the backend server for the Smart Inventory Management System, providing a robust RESTful API for inventory tracking, order processing, and user management.

## 🛠️ Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Security**: Helmet, CORS, BcryptJS

## 📂 Folder Structure

```text
src/
├── builders/     # Query builders for complex filtering
├── config/       # App configuration and env variables
├── controllers/  # Request handlers
├── middlewares/  # Auth, validation, and error middlewares
├── models/       # Mongoose schemas and types
├── routes/       # API route definitions
├── scripts/      # Seeding and utility scripts
├── services/     # Business logic layer
├── types/        # TypeScript interfaces and enums
├── utils/        # General helpers
└── validators/   # Zod validation schemas
```

## 🚀 Getting Started

### 1. Installation

```bash
pnpm install
```

### 2. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### 3. Database Seeding

To populate the database with demo users, products, and categories:

```bash
pnpm ts-node src/scripts/seed.ts
```

### 4. Running the Server

```bash
# Development mode
pnpm dev

# Production build
pnpm build
```

## 📡 API Endpoints

| Route            | Description                           |
| :--------------- | :------------------------------------ |
| `/api/auth`      | Login, Registration, and User profile |
| `/api/product`   | Product CRUD and inventory management |
| `/api/category`  | Category management                   |
| `/api/order`     | Order processing and tracking         |
| `/api/dashboard` | Statistics and activity logs          |

---

## 🔒 Security

- **JWT Auth**: Most routes require a valid token passed via Cookies or Authorization header.
- **RBAC**: Certain actions (like adding products or deleting orders) are restricted to `Admin` users.

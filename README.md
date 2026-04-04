# 🚀 Smart Inventory Management System

A high-performance, full-stack inventory management solution designed for real-time tracking, stock management, and comprehensive order analytics. Built with **Next.js 15**, **Node.js**, and **MongoDB**, this system provides a seamless experience for both administrators and managers to maintain accurate inventory levels.

---

## 🌐 Live Demo

- **Frontend URL**: [https://smart-inventory-system-sazzad.vercel.app/](https://smart-inventory-system-sazzad.vercel.app/)
- **Backend API URL**: [https://smart-inventory-system-o2pv.onrender.com/api](https://smart-inventory-system-o2pv.onrender.com/api)

### 🔑 Demo Credentials

| Role    | Email              | Password     |
| :------ | :----------------- | :----------- |
| Admin   | `admin@demo.com`   | `admin123`   |
| Manager | `manager@demo.com` | `manager123` |

---

## ✨ Features

- **🛡️ Secure Authentication**: Role-based Access Control (RBAC) for Admin and Manager roles.
- **📊 Real-time Dashboard**: Overview of total products, categories, and low-stock alerts.
- **📦 Inventory Management**: Full CRUD operations for products with category-wise filtering.
- **📂 Category Management**: Organize and manage product categories efficiently.
- **🛒 Order Tracking**: Comprehensive order management with status updates (Pending, Processing, Shipped, Delivered, Cancelled).
- **📝 Activity Logging**: Track all system activities for better auditability.
- **📱 Responsive UI**: Fully optimized for mobile, tablet, and desktop views.
- **🌓 Dark Mode**: Modern aesthetic with native dark mode support.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Forms**: React Hook Form, Zod (Validation)
- **State Management**: React Server Actions & Client-side hooks

### Backend

- **Runtime**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- **Language**: TypeScript
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Auth**: [JWT (JSON Web Tokens)](https://jwt.io/), [BcryptJS](https://www.npmjs.com/package/bcryptjs)
- **Security**: Helmet, CORS, Cookie-Parser
- **Validation**: [Zod](https://zod.dev/)

---

## ⚙️ Local Setup Instructions

Follow these steps to set up the project locally.

### 📋 Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (Recommended) or npm/yarn
- **MongoDB** (Local or Atlas instance)

### 1. Clone the Repository

```bash
git clone https://github.com/sazzad4677/Smart-Inventory-System.git
cd Smart-Inventory-System
```

### 2. Install Dependencies

This project is a monorepo. Use pnpm to install all dependencies for both frontend and backend.

```bash
pnpm install
```

### 3. Environment Variables Setup

You can quickly set up your environment files by running these commands from the **root** of the project:

```bash
# Backend setup
cp backend/.env.example backend/.env

# Frontend setup
cp frontend/.env.example frontend/.env.local
```

Alternatively, create the files manually and copy the settings below:

#### 📁 Backend (`backend/.env`)

> [!TIP]
> Copy the block below and save it as `backend/.env`

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/smart_inventory

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# CORS (Frontend URL)
CLIENT_URL=http://localhost:3000
```

#### 📁 Frontend (`frontend/.env.local`)

> [!TIP]
> Copy the block below and save it as `frontend/.env.local`

```env
# API URL (Backend endpoint)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Database Seeding (Optional but Recommended)

To populate your local database with sample products, categories, and users (Admin/Manager):

```bash
cd backend
pnpm ts-node src/scripts/seed.ts
```

### 5. Running the Application

Return to the root directory and run:

```bash
pnpm dev
```

- **Frontend** will run on: `http://localhost:3000`
- **Backend** will run on: `http://localhost:5000`

---

## 🧪 Testing

- Standardized Git commits using **Commitlint** and **Husky**.
- Form validation ensured by **Zod**.
- Type safety across the stack with **TypeScript**.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

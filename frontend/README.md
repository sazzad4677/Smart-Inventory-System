# 📈 Smart Inventory System - Frontend

A modern, responsive, and data-driven dashboard for the Smart Inventory Management System. Built with **Next.js 15**, **React 19**, and **Tailwind CSS 4**, this interface provides real-time access to stock tracking, order management, and detailed analytics.

## 🛠️ Technologies

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Library**: React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form, Zod
- **Notifications**: Sonner (Toast)

## 📂 Project Structure

```text
src/
├── actions/      # Next.js Server Actions for API communication
├── app/          # App Router pages and layouts
│   ├── (auth)/     # Authentication routes (Login/Signup)
│   ├── (dashboard)/# Main application dashboard and management pages
│   └── layout.tsx  # Global layout and theme provider
├── components/   # Reusable UI and layout components
├── hooks/        # Custom React hooks
├── lib/          # Utilities and shared configurations
└── proxy.ts      # API proxy configuration
```

## 🚀 Getting Started

### 1. Installation

```bash
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

### 3. Running the Application

```bash
# Development mode
pnpm dev

# Production build
pnpm build
```

## ✨ Features

- **🔐 Auth Flow**: Secure login and signup with server-side validation.
- **📊 Analytics Dashboard**: Live metrics for products, categories, and inventory status.
- **📦 Inventory Tracker**: Manage products with low-stock alerts and category filters.
- **🛒 Order History**: Track order lifecycle from pending to delivered.
- **🌓 Theme Support**: Built-in dark and light mode for better accessibility.

---

## 🎨 UI/UX Design

- **shadcn/ui**: High-quality, accessible components for a premium feel.
- **Lucide Icons**: Consistent and modern iconography throughout the app.
- **Responsive Layout**: Optimized for seamless use across desktop and mobile devices.

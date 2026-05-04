import { UserRole, OrderStatus, ActivityType, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding with Prisma...');

    // 1. Clear existing data
    // Use raw query for truncation or individual deleteMany
    await prisma.activityLog.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.session.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.user.deleteMany();
    await prisma.idSequence.deleteMany();

    console.log('🧹 Database cleared');

    const passwordHash = await bcrypt.hash('admin123', 10);

    // 2. Seed Users
    const admin = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        password_hash: passwordHash,
        role: UserRole.Admin,
      },
    });
    const manager = await prisma.user.create({
      data: {
        email: 'manager@demo.com',
        password_hash: passwordHash,
        role: UserRole.Manager,
      },
    });
    const staff = await prisma.user.create({
      data: {
        email: 'staff@demo.com',
        password_hash: passwordHash,
        role: UserRole.Staff,
      },
    });
    const users = [admin, manager, staff];
    console.log('👤 Seeded Demo Users');

    // 3. Seed Categories
    const catNames = ['Electronics', 'Furniture', 'Groceries', 'Apparel', 'Books', 'Toys'];
    const categories = [];
    for (const name of catNames) {
      const cat = await prisma.category.create({
        data: { name, created_by: admin.id },
      });
      categories.push(cat);
    }
    console.log(`📂 Seeded ${categories.length} Categories`);

    // 4. Seed 60 Products
    const products = [];
    for (let i = 1; i <= 60; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]!;
      const price = parseFloat((Math.random() * (1000 - 5) + 5).toFixed(2));
      const stock = Math.floor(Math.random() * 150);
      const threshold = 20;
      const creator = users[i % users.length] || users[0]!;

      const product = await prisma.product.create({
        data: {
          product_id: `PRD-${1000 + i}`,
          name: `Product SKU-${1000 + i}`,
          category_id: category.id,
          price,
          stock_quantity: stock,
          min_threshold: threshold,
          status: stock <= 0 ? ProductStatus.OutOfStock : ProductStatus.Active,
          is_restock_required: stock <= threshold,
          created_by: creator.id,
        },
      });
      products.push(product);
    }
    console.log(`📦 Seeded ${products.length} Products`);

    // 5. Seed 25 Orders
    const statuses = Object.values(OrderStatus);
    for (let i = 1; i <= 25; i++) {
      const orderDate = new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000);
      const itemsCount = Math.floor(Math.random() * 3) + 1;

      const orderItemsData = [];
      let total = 0;
      for (let j = 0; j < itemsCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)]!;
        const qty = Math.floor(Math.random() * 3) + 1;
        const unitPrice = product.price;
        total += unitPrice * qty;

        orderItemsData.push({
          product_id: product.id,
          quantity: qty,
          unit_price: unitPrice,
        });
      }

      await prisma.order.create({
        data: {
          order_id: `ORD-${1000 + i}`,
          customer_name: `Customer ${String.fromCharCode(65 + (i % 26))}`,
          total_price: total,
          status: statuses[Math.floor(Math.random() * statuses.length)]!,
          createdAt: orderDate,
          orderItems: {
            create: orderItemsData,
          },
        },
      });
    }
    console.log(`🛒 Seeded 25 Orders with Items`);

    // 6. Activity Logs
    for (let i = 0; i < 15; i++) {
      await prisma.activityLog.create({
        data: {
          action_text: `User performed action #${i + 1}`,
          user_id: i % 2 === 0 ? admin.id : manager.id,
          type: ActivityType.CREATE,
          resource: 'PRODUCT',
          timestamp: new Date(),
        },
      });
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();

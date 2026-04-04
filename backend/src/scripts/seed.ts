import mongoose from 'mongoose';
import { config } from '../config/config';
import User from '../models/user.model';
import Category from '../models/category.model';
import Product from '../models/product.model';
import Order from '../models/order.model';
import OrderItem from '../models/order-item.model';
import ActivityLog from '../models/activity-log.model';
import { UserRole, OrderStatus } from '../types';

const seed = async () => {
  try {
    console.log('🌱 Starting large-scale database seeding...');
    await mongoose.connect(config.db.uri);

    // 1. Clear existing data
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
    console.log('🧹 Database cleared');

    // 2. Seed Users
    const admin = await User.create({
      email: 'admin@demo.com',
      password_hash: 'admin123',
      role: UserRole.Admin,
    });
    const manager = await User.create({
      email: 'manager@demo.com',
      password_hash: 'manager123',
      role: UserRole.Manager,
    });

    // 3. Seed Categories
    const catNames = ['Electronics', 'Furniture', 'Groceries', 'Apparel', 'Books', 'Toys'];
    const categories = await Category.insertMany(catNames.map((name) => ({ name })));
    console.log(`📂 Seeded ${categories.length} Categories`);

    // 4. Seed 50+ Products
    const productsData = [];
    for (let i = 1; i <= 60; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const price = parseFloat((Math.random() * (1000 - 5) + 5).toFixed(2));
      const stock = Math.floor(Math.random() * 150);
      const threshold = 20;

      productsData.push({
        name: `Product SKU-${1000 + i}`,
        category_id: (category as any)._id,
        price,
        stock_quantity: stock,
        min_threshold: threshold,
        description: `High-quality item from our ${category?.name || `Random-${1000 + i}`} collection.`,
      });
    }
    const products = await Product.insertMany(productsData);
    console.log(`📦 Seeded ${products.length} Products`);

    // 5. Seed 20+ Orders with diverse statuses
    const statuses = Object.values(OrderStatus);
    const ordersData = [];
    for (let i = 1; i <= 25; i++) {
      ordersData.push({
        customer_name: `Customer ${String.fromCharCode(65 + (i % 26))}`,
        total_price: 0, // Will update after items
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created_at: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000),
      });
    }
    const orders = await Order.insertMany(ordersData);
    console.log(`🛒 Seeded ${orders.length} Orders`);

    // 6. Seed Order Items (Linking Orders and Products)
    console.log('🔗 Linking items to orders...');
    for (const order of orders) {
      let orderTotal = 0;
      const itemsToCreate = Math.floor(Math.random() * 3) + 1; // 1-4 items per order

      for (let j = 0; j < itemsToCreate; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 3) + 1;

        await OrderItem.create({
          order_id: (order as any)._id,
          product_id: (product as any)._id,
          quantity: qty,
          unit_price: product?.price || 0,
        });
        orderTotal += (product?.price || 0) * qty;
      }
      // Update the order with the calculated total
      await Order.findByIdAndUpdate(order._id, { total_price: orderTotal.toFixed(2) });
    }

    // 7. Activity Logs
    const logs = Array.from({ length: 15 }).map((_, i) => ({
      action_text: `User performed action #${i + 1}`,
      user_id: i % 2 === 0 ? admin._id : manager._id,
      timestamp: new Date(),
    }));
    await ActivityLog.insertMany(logs);

    console.log('✅ Seeding completed successfully with 100+ total records!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();

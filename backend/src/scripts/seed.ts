import mongoose from 'mongoose';
import { config } from '../config/config';
import User from '../models/user.model';
import Category from '../models/category.model';
import Product from '../models/product.model';
import Order from '../models/order.model';
import OrderItem from '../models/order-item.model';
import ActivityLog from '../models/activity-log.model';
import { UserRole, ProductStatus, OrderStatus } from '../types';

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await mongoose.connect(config.db.uri);
    console.log('🔌 Connected to MongoDB');

    // 1. Clear existing data
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (const collection of collections) {
        await collection.deleteMany({});
        console.log(`🧹 Cleared collection: ${collection.collectionName}`);
      }
    }

    // 2. Seed Admin User
    const admin = await User.create({
      email: 'admin@demo.com',
      password_hash: 'admin123', // Will be hashed by pre-save hook
      role: UserRole.Admin,
    });
    console.log('👤 Seeded Admin User: admin@demo.com / admin123');

    // 3. Seed Categories
    const categoriesData = [{ name: 'Electronics' }, { name: 'Furniture' }, { name: 'Groceries' }];
    const categories = await Category.insertMany(categoriesData);
    console.log('📂 Seeded 3 Categories');

    const electronicsId = (categories[0] as any)._id;
    const furnitureId = (categories[1] as any)._id;
    const groceriesId = (categories[2] as any)._id;

    // 4. Seed Products (10 total)
    const productsData = [
      // Electronics
      {
        name: 'Smartphone X',
        category_id: electronicsId,
        price: 699,
        stock_quantity: 50,
        min_threshold: 10,
      },
      {
        name: 'Laptop Pro',
        category_id: electronicsId,
        price: 1299,
        stock_quantity: 5,
        min_threshold: 10,
      }, // Low stock
      {
        name: 'Wireless Earbuds',
        category_id: electronicsId,
        price: 149,
        stock_quantity: 100,
        min_threshold: 20,
      },
      {
        name: 'Smartwatch',
        category_id: electronicsId,
        price: 299,
        stock_quantity: 0,
        min_threshold: 5,
      }, // Out of stock

      // Furniture
      {
        name: 'Ergonomic Chair',
        category_id: furnitureId,
        price: 199,
        stock_quantity: 15,
        min_threshold: 5,
      },
      {
        name: 'Office Desk',
        category_id: furnitureId,
        price: 349,
        stock_quantity: 3,
        min_threshold: 10,
      }, // Low stock
      {
        name: 'Bookshelf',
        category_id: furnitureId,
        price: 89,
        stock_quantity: 25,
        min_threshold: 5,
      },

      // Groceries
      {
        name: 'Organic Coffee',
        category_id: groceriesId,
        price: 12.99,
        stock_quantity: 200,
        min_threshold: 50,
      },
      {
        name: 'Premium Tea',
        category_id: groceriesId,
        price: 8.5,
        stock_quantity: 40,
        min_threshold: 50,
      }, // Low stock
      {
        name: 'Avo Toast Kit',
        category_id: groceriesId,
        price: 15.0,
        stock_quantity: 12,
        min_threshold: 5,
      },
    ];

    const products = await Product.insertMany(productsData);
    console.log('📦 Seeded 10 Products');

    // 5. Seed Orders (3 total)
    const ordersData = [
      {
        customer_name: 'John Doe',
        total_price: 699,
        status: OrderStatus.Pending,
        created_at: new Date(),
      },
      {
        customer_name: 'Jane Smith',
        total_price: 349.5,
        status: OrderStatus.Confirmed,
        created_at: new Date(),
      },
      {
        customer_name: 'Bob Wilson',
        total_price: 25.98,
        status: OrderStatus.Delivered,
        created_at: new Date(),
      },
    ];

    const orders = await Order.create(ordersData);
    console.log('🛒 Seeded 3 Orders');

    // Seed some corresponding OrderItems for the first order
    await OrderItem.create([
      {
        order_id: (orders[0] as any)._id,
        product_id: (products[0] as any)._id,
        quantity: 1,
        unit_price: 699,
      },
    ]);

    // Seed some activity logs
    await ActivityLog.create([
      { action_text: 'System populated with seed data', user_id: admin._id, timestamp: new Date() },
      { action_text: 'Admin logged in', user_id: admin._id, timestamp: new Date() },
    ]);

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();

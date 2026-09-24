import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Banner from './models/Banner.js';
import Quote from './models/Quote.js';

dotenv.config();

const seedData = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/designopack');
    console.log(`[Seed]: Connected to ${conn.connection.host}`);

    // Clean existing data
    await Admin.deleteMany();
    await Category.deleteMany();
    await Banner.deleteMany();
    await Product.deleteMany();
    await Quote.deleteMany();

    console.log('[Seed]: Cleared existing collections');

    // Seed Admin
    const admin = await Admin.create({
      name: process.env.ADMIN_NAME || 'DesignOPack Admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
      role: 'admin',
    });
    console.log(`[Seed]: Created Admin account: ${admin.email}`);

    // Seed Categories
    const categories = await Category.insertMany([
      { name: 'IN-ROOM ACCESSORIES', description: 'Accessories for hotel rooms and guest areas', displayOrder: 1 },
      { name: 'DESK ACCESSORIES', description: 'Professional desk and office accessories', displayOrder: 2 },
      { name: 'NIGHTSTAND ACCESSORIES', description: 'Bedside and nightstand accessories', displayOrder: 3 },
      { name: 'MINI BAR TABLETOP ACCESSORIES', description: 'Mini bar and tabletop accessories', displayOrder: 4 },
      { name: 'RESTAURANT & BAR ACCESSORIES', description: 'Restaurant and bar service accessories', displayOrder: 5 },
      { name: 'BATHROOM ACCESSORIES', description: 'Luxury bathroom accessories and amenities', displayOrder: 6 },
      { name: 'GIFTING', description: 'Gift packaging and presentation solutions', displayOrder: 7 },
      { name: 'FOOD PACKAGING', description: 'Food and beverage packaging solutions', displayOrder: 8 },
    ]);
    console.log(`[Seed]: Inserted ${categories.length} categories`);

    // Seed Banners
    const banners = await Banner.insertMany([
      {
        title: 'Premium Packaging Solutions',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
        isActive: true,
        order: 1,
      },
      {
        title: 'Luxury Hotel Amenities',
        imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80',
        isActive: true,
        order: 2,
      },
      {
        title: 'Custom Branding Solutions',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1600&q=80',
        isActive: true,
        order: 3,
      },
      {
        title: 'End-to-End Service',
        imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1600&q=80',
        isActive: true,
        order: 4,
      },
    ]);
    console.log(`[Seed]: Inserted ${banners.length} banners`);

    // Seed Sample Products
    const products = await Product.insertMany([
      {
        name: 'Luxury Leather Tissue Box Cover',
        categories: ['IN-ROOM ACCESSORIES', 'DESK ACCESSORIES'],
        description: 'Handcrafted premium faux leather tissue box cover with embossed finish.',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
        media: [
          { imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80', description: 'Front view' }
        ],
        displayOrder: 1,
        inStock: true,
      },
      {
        name: 'Executive Desk Blotter & Pad',
        categories: ['DESK ACCESSORIES'],
        description: 'Elegant dual-tone desk pad designed for 5-star hotel work suites.',
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
        media: [
          { imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', description: 'Angled layout' }
        ],
        displayOrder: 2,
        inStock: true,
      },
      {
        name: 'Resin Bathroom Amenities Tray',
        categories: ['BATHROOM ACCESSORIES'],
        description: 'Waterproof marble-effect resin vanity tray for hotel guest bathrooms.',
        imageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80',
        media: [
          { imageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80', description: 'Countertop setting' }
        ],
        displayOrder: 1,
        inStock: true,
      }
    ]);
    console.log(`[Seed]: Inserted ${products.length} sample products`);

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();

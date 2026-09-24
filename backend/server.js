import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import Admin from './models/Admin.js';
import Category from './models/Category.js';
import Banner from './models/Banner.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// Connect to Database
await connectDB();

// Initialize default admin and data if database is fresh
const autoSeedDefaults = async () => {
  try {
    const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const defaultPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const defaultName = process.env.ADMIN_NAME || 'DesignOPack Admin';

    let admin = await Admin.findOne({ email: defaultEmail });
    if (!admin) {
      await Admin.create({
        name: defaultName,
        email: defaultEmail,
        password: defaultPassword,
        role: 'admin',
      });
      console.log(`[Auto-Seed]: Created admin account: ${defaultEmail}`);
    } else {
      admin.password = defaultPassword;
      admin.name = defaultName;
      await admin.save();
      console.log(`[Auto-Seed]: Updated admin credentials for: ${defaultEmail}`);
    }

    // Default categories seed
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'IN-ROOM ACCESSORIES', description: 'Accessories for hotel rooms and guest areas', displayOrder: 1 },
        { name: 'DESK ACCESSORIES', description: 'Professional desk and office accessories', displayOrder: 2 },
        { name: 'NIGHTSTAND ACCESSORIES', description: 'Bedside and nightstand accessories', displayOrder: 3 },
        { name: 'MINI BAR TABLETOP ACCESSORIES', description: 'Mini bar and tabletop accessories', displayOrder: 4 },
        { name: 'RESTAURANT & BAR ACCESSORIES', description: 'Restaurant and bar service accessories', displayOrder: 5 },
        { name: 'BATHROOM ACCESSORIES', description: 'Luxury bathroom accessories and amenities', displayOrder: 6 },
        { name: 'GIFTING', description: 'Gift packaging and presentation solutions', displayOrder: 7 },
        { name: 'FOOD PACKAGING', description: 'Food and beverage packaging solutions', displayOrder: 8 },
      ];
      await Category.insertMany(defaultCategories);
      console.log('[Auto-Seed]: Created default categories');
    }

    // Default banners seed
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      const defaultBanners = [
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
      ];
      await Banner.insertMany(defaultBanners);
      console.log('[Auto-Seed]: Created default banners');
    }
  } catch (err) {
    console.error('[Auto-Seed Error]:', err.message);
  }
};

await autoSeedDefaults();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Body parsing with 50MB limit to handle WebP base64 images and PDFs
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'DesignOPack REST API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/banners', bannerRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[DesignOPack API Server]: Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

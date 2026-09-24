import express from 'express';
import {
  loginAdmin,
  getAdminProfile,
  registerAdmin,
  forgotPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', protect, getAdminProfile);
router.post('/register', registerAdmin);
router.post('/forgot-password', forgotPassword);

export default router;

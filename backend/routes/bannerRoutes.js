import express from 'express';
import {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  initializeDefaultBanners,
} from '../controllers/bannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getBanners)
  .post(protect, createBanner);

router.get('/active', getActiveBanners);
router.post('/initialize', initializeDefaultBanners);

router.route('/:id')
  .put(protect, updateBanner)
  .delete(protect, deleteBanner);

export default router;

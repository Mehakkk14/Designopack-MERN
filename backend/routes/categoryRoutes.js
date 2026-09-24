import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  initializeDefaultCategories,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, createCategory);

router.post('/initialize', initializeDefaultCategories);

router.route('/:id')
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;

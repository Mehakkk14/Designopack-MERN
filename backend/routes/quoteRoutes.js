import express from 'express';
import {
  createQuote,
  getQuotes,
  updateQuoteStatus,
  deleteQuote,
} from '../controllers/quoteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(createQuote)
  .get(protect, getQuotes);

router.route('/:id/status')
  .patch(protect, updateQuoteStatus);

router.route('/:id')
  .delete(protect, deleteQuote);

export default router;

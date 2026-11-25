import { Router } from 'express';
import {
  submitPayment,
  getClientPayments,
  getAllPayments,
  verifyPayment,
} from '../controllers/paymentController';
import { requireAuth, requireAdmin } from '../middlewares/auth';

const router = Router();

// Client submits payment record
router.post('/submit', requireAuth, submitPayment);
router.get('/client/my', requireAuth, getClientPayments);

// Admin verifies payments
router.get('/admin/all', requireAdmin, getAllPayments);
router.patch('/admin/:id/verify', requireAdmin, verifyPayment);

export default router;

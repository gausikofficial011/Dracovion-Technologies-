import { Router } from 'express';
import {
  createQuotation,
  getAllQuotations,
  getClientQuotations,
  getQuotationById,
  negotiateQuotation,
  acceptQuotation,
  rejectQuotation,
} from '../controllers/quotationController';
import { requireAuth, requireAdmin } from '../middlewares/auth';

const router = Router();

// Admin creates quotation
router.post('/admin', requireAdmin, createQuotation);
router.get('/admin/all', requireAdmin, getAllQuotations);

// Client lists own quotations
router.get('/client/my', requireAuth, getClientQuotations);

// Single quotation detail with authorization check
router.get('/:id', requireAuth, getQuotationById);

// Client negotiation & acceptance
router.post('/:id/negotiate', requireAuth, negotiateQuotation);
router.post('/:id/accept', requireAuth, acceptQuotation);
router.post('/:id/reject', requireAuth, rejectQuotation);

export default router;

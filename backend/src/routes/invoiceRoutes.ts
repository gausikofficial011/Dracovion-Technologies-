import { Router } from 'express';
import {
  createInvoice,
  getClientInvoices,
  getAllInvoices,
  getInvoiceById,
} from '../controllers/invoiceController';
import { requireAuth, requireAdmin } from '../middlewares/auth';

const router = Router();

// Admin creates invoice
router.post('/admin', requireAdmin, createInvoice);
router.get('/admin/all', requireAdmin, getAllInvoices);

// Client views invoices
router.get('/client/my', requireAuth, getClientInvoices);

// Single invoice detail
router.get('/:id', requireAuth, getInvoiceById);

export default router;

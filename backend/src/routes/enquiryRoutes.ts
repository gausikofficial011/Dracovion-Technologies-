import { Router } from 'express';
import { submitEnquiry, getAllEnquiries, getEnquiryById, updateEnquiryStatus } from '../controllers/enquiryController';
import { requireAdmin } from '../middlewares/auth';

const router = Router();

// Public lead submission
router.post('/', submitEnquiry);

// Admin enquiry triage
router.get('/admin/all', requireAdmin, getAllEnquiries);
router.get('/admin/:id', requireAdmin, getEnquiryById);
router.patch('/admin/:id', requireAdmin, updateEnquiryStatus);

export default router;

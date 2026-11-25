import { Router } from 'express';
import {
  getActiveAnnouncement,
  getAllAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController';
import { requireAuth, requireRoles } from '../middlewares/auth';

const router = Router();

// ==============================================================
// 1. PUBLIC ENDPOINT (NO AUTH) — ACCESSIBLE TO EVERY VISITOR
// ==============================================================
router.get('/active', getActiveAnnouncement);

// ==============================================================
// 2. PRESIDENT & EXECUTIVE GOVERNANCE ENDPOINTS
// ==============================================================
router.get('/admin/all', requireAuth, requireRoles('owner', 'super_admin', 'ceo', 'admin'), getAllAnnouncements);
router.post('/admin', requireAuth, requireRoles('owner', 'super_admin', 'ceo', 'admin'), createAnnouncement);
router.patch('/admin/:id/toggle', requireAuth, requireRoles('owner', 'super_admin', 'ceo', 'admin'), toggleAnnouncement);
router.put('/admin/:id', requireAuth, requireRoles('owner', 'super_admin', 'ceo', 'admin'), updateAnnouncement);
router.delete('/admin/:id', requireAuth, requireRoles('owner', 'super_admin', 'ceo', 'admin'), deleteAnnouncement);

export default router;


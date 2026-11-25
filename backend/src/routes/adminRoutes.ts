import { Router } from 'express';
import {
  getDashboardMetrics,
  getUsers,
  updateUserRole,
  updateUserStatus,
  getAuditLogs,
  getSettings,
} from '../controllers/adminController';
import { requireAdmin, requireRoles } from '../middlewares/auth';

const router = Router();

// Metrics & Reports
router.get('/dashboard-metrics', requireAdmin, getDashboardMetrics);

// Users Management & Fraud Control
router.get('/users', requireAdmin, getUsers);
router.patch('/users/:id/role', requireRoles('owner'), updateUserRole); // Owner-only elevation
router.patch('/users/:id/status', requireRoles('owner', 'super_admin', 'ceo'), updateUserStatus); // President, Super Admin & CEO fraud activation/disablement

// Audit Logs
router.get('/audit-logs', requireAdmin, getAuditLogs);

// System Settings
router.get('/settings', requireAdmin, getSettings);

export default router;

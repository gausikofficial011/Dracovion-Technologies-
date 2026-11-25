import { Router } from 'express';
import {
  getServices,
  getServiceBySlug,
  getPortfolio,
  getPortfolioBySlug,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/catalogController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Public Catalog endpoints
router.get('/services', getServices);
router.get('/services/:slug', getServiceBySlug);
router.get('/portfolio', getPortfolio);
router.get('/portfolio/:slug', getPortfolioBySlug);

// User Notifications endpoints
router.get('/notifications', requireAuth, getNotifications);
router.patch('/notifications/:id/read', requireAuth, markNotificationRead);
router.post('/notifications/mark-all-read', requireAuth, markAllNotificationsRead);

export default router;

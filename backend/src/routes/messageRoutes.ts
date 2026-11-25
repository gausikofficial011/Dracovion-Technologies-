import { Router } from 'express';
import {
  getClientChannels,
  getClientDirectMessages,
  sendClientDirectMessage,
  getAdminConversations,
  getAdminClientMessages,
  sendAdminDirectMessage,
  getProjectMessages,
  sendProjectMessage,
  getOrderMessages,
  sendOrderMessage,
} from '../controllers/messageController';
import { requireAuth, requireRoles } from '../middlewares/auth';

const router = Router();

// Client Channel discovery & Direct Support line
router.get('/channels', requireAuth, getClientChannels);
router.get('/direct', requireAuth, getClientDirectMessages);
router.post('/direct', requireAuth, sendClientDirectMessage);

// Admin / Team Multi-Client Direct Messaging
router.get(
  '/admin/conversations',
  requireAuth,
  requireRoles('owner', 'admin', 'ceo', 'super_admin'),
  getAdminConversations
);
router.get(
  '/admin/client/:clientId',
  requireAuth,
  requireRoles('owner', 'admin', 'ceo', 'super_admin'),
  getAdminClientMessages
);
router.post(
  '/admin/client/:clientId',
  requireAuth,
  requireRoles('owner', 'admin', 'ceo', 'super_admin'),
  sendAdminDirectMessage
);

// Specific Project & Order Channels
router.get('/project/:projectId', requireAuth, getProjectMessages);
router.post('/project/:projectId', requireAuth, sendProjectMessage);
router.get('/order/:orderId', requireAuth, getOrderMessages);
router.post('/order/:orderId', requireAuth, sendOrderMessage);

export default router;

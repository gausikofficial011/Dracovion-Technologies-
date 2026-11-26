import { Router } from 'express';
import {
  streamChatEvents,
  getClientChannels,
  getClientDirectMessages,
  sendClientDirectMessage,
  getAdminConversations,
  getAdminClientChannels,
  getAdminClientMessages,
  sendAdminDirectMessage,
  getProjectMessages,
  sendProjectMessage,
  getOrderMessages,
  sendOrderMessage,
} from '../controllers/messageController';
import { requireAuth, requireRoles } from '../middlewares/auth';

const router = Router();

// Real-time Server-Sent Events (SSE) stream for instant message delivery
router.get('/stream', requireAuth, streamChatEvents);

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
  '/admin/client/:clientId/channels',
  requireAuth,
  requireRoles('owner', 'admin', 'ceo', 'super_admin'),
  getAdminClientChannels
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

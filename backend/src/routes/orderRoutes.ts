import { Router } from 'express';
import {
  createProjectOrder,
  getClientOrders,
  getWorkspaceOrders,
  getOrderById,
  assignOrder,
  updateOrderStatus,
  shareEmployeePaymentDetails,
  submitHandoverPayment,
  verifyHandoverPayment,
  postProjectUpdate,
  getOrderMessages,
  sendOrderMessage,
  deleteProjectOrder,
} from '../controllers/orderController';
import { requireAuth, requireWorkspaceStaff } from '../middlewares/auth';

const router = Router();

// Client routes
router.post('/', requireAuth, createProjectOrder);
router.post('/create', requireAuth, createProjectOrder);
router.get('/my', requireAuth, getClientOrders);

// Handover & Direct Settlement
router.post('/:id/share-payment-details', requireAuth, requireWorkspaceStaff, shareEmployeePaymentDetails);
router.post('/:id/submit-handover-payment', requireAuth, submitHandoverPayment);
router.post('/:id/verify-handover-payment', requireAuth, requireWorkspaceStaff, verifyHandoverPayment);
router.post('/:id/post-update', requireAuth, requireWorkspaceStaff, postProjectUpdate);

// Direct Order Chat Line (Client <-> Employee)
router.get('/:id/messages', requireAuth, getOrderMessages);
router.post('/:id/messages', requireAuth, sendOrderMessage);

// Workspace staff routes (Super Admin, CEO, Owner, Employees)
router.get('/', requireAuth, requireWorkspaceStaff, getWorkspaceOrders);
router.patch('/:id/assign', requireAuth, requireWorkspaceStaff, assignOrder);
router.patch('/:id/status', requireAuth, requireWorkspaceStaff, updateOrderStatus);

// Accessible by client who owns the order or any staff member
router.get('/:id', requireAuth, getOrderById);
router.delete('/:id', requireAuth, deleteProjectOrder);

export default router;


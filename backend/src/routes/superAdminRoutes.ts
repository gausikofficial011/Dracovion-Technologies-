import { Router } from 'express';
import {
  listAllStaff,
  createStaffAccount,
  deleteStaffAccount,
  updateStaffAccount,
  resetEmployeePassword,
} from '../controllers/superAdminController';
import { requireAuth, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

// Strictly locked to Super Admin (Gausik Srinivasan)
router.use(requireAuth, requireSuperAdmin);

router.get('/staff', listAllStaff);
router.post('/staff', createStaffAccount);
router.delete('/staff/:id', deleteStaffAccount);
router.patch('/staff/:id', updateStaffAccount);
router.post('/staff/:id/reset-password', resetEmployeePassword);

export default router;


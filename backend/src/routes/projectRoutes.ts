import { Router } from 'express';
import {
  getClientProjects,
  getAllProjects,
  getProjectById,
  updateProjectStatus,
  updateMilestone,
} from '../controllers/projectController';
import { requireAuth, requireAdmin } from '../middlewares/auth';

const router = Router();

// Client accesses their projects
router.get('/client/my', requireAuth, getClientProjects);

// Admin accesses all projects
router.get('/admin/all', requireAdmin, getAllProjects);

// View project detail (authorized client, assigned team, or admin)
router.get('/:id', requireAuth, getProjectById);

// Update status (Admin or assigned PM)
router.patch('/:id/status', requireAdmin, updateProjectStatus);

// Update milestone
router.patch('/:id/milestones/:index', requireAdmin, updateMilestone);

export default router;

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Project, IProject } from '../models/Project';
import { User } from '../models/User';
import { AuthenticatedRequest, ProjectStatus } from '../types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';
import { createNotification } from '../services/notificationService';

const VALID_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  requested: ['reviewing', 'rejected', 'cancelled'],
  reviewing: ['quoted', 'rejected', 'cancelled'],
  quoted: ['approved', 'rejected', 'cancelled'],
  approved: ['in_progress', 'cancelled'],
  in_progress: ['review', 'blocked', 'cancelled'],
  review: ['delivered', 'revision_required', 'in_progress'],
  revision_required: ['in_progress', 'review'],
  delivered: ['completed', 'revision_required'],
  completed: [],
  blocked: ['in_progress', 'cancelled'],
  rejected: [],
  cancelled: [],
};

export async function getClientProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const clientId = (req.session as any)?.user?.userId;
    const projects = await Project.find({ clientId }).sort({ updatedAt: -1 });

    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
}

export async function getAllProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;
    const category = req.query.category as string;
    const isStudent = req.query.isStudent;

    const filter: any = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (isStudent !== undefined) filter.isStudentProject = isStudent === 'true';

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('clientId', 'fullName email companyName collegeOrUniversity'),
      Project.countDocuments(filter),
    ]);

    res.json({
      success: true,
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const project = await Project.findById(req.params.id)
      .populate('clientId', 'fullName email companyName collegeOrUniversity phone')
      .populate('quotationId')
      .populate('assignedTeam.userId', 'fullName email role');

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Authorization: Owner, Admin, Assigned Team Member, or Project Client
    const isAssigned = project.assignedTeam.some(t => t.userId && (t.userId as any)._id?.toString() === sessionUser.userId);
    const isOwnerOrAdmin = sessionUser.role === 'owner' || sessionUser.role === 'admin';
    const isClient = project.clientId && (project.clientId as any)._id?.toString() === sessionUser.userId;

    if (!isOwnerOrAdmin && !isClient && !isAssigned) {
      throw new ForbiddenError('You are not authorized to view this project.');
    }

    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
}

export async function updateProjectStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const { status, note, progressPercent } = z
      .object({
        status: z.enum([
          'requested',
          'reviewing',
          'quoted',
          'approved',
          'in_progress',
          'review',
          'delivered',
          'completed',
          'revision_required',
          'blocked',
          'rejected',
          'cancelled',
        ]),
        note: z.string().optional(),
        progressPercent: z.number().min(0).max(100).optional(),
      })
      .parse(req.body);

    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const currentStatus = project.status;
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

    // Owner can override transitions in special cases, but normal flows must adhere to state machine
    if (sessionUser.role !== 'owner' && !allowedTransitions.includes(status) && currentStatus !== status) {
      throw new BadRequestError(`Invalid status transition from '${currentStatus}' to '${status}'.`);
    }

    project.status = status;
    if (progressPercent !== undefined) {
      project.progressPercent = progressPercent;
    }

    if (status === 'delivered') {
      project.actualDeliveredDate = new Date();
    }

    project.statusHistory.push({
      fromStatus: currentStatus,
      toStatus: status,
      changedBy: sessionUser.userId as any,
      note: note || `Status updated to ${status}`,
      timestamp: new Date(),
    });

    await project.save();

    await recordAuditLog({
      userId: sessionUser.userId,
      action: 'PROJECT_STATUS_CHANGED',
      entityType: 'Project',
      entityId: project._id.toString(),
      ipAddress: req.ip,
      details: { fromStatus: currentStatus, toStatus: status, note },
    });

    await createNotification({
      userId: project.clientId,
      title: `Project Status Update: ${project.title}`,
      message: `Your project is now '${status.replace(/_/g, ' ')}'. Progress: ${project.progressPercent}%.`,
      link: `/client/projects/${project._id}`,
      type: 'project',
    });

    res.json({ success: true, message: 'Project status updated successfully', project });
  } catch (err) {
    next(err);
  }
}

export async function updateMilestone(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const milestoneIndex = parseInt(req.params.index, 10);
    const { status } = z.object({ status: z.enum(['pending', 'in_progress', 'completed']) }).parse(req.body);

    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (!project.milestones[milestoneIndex]) {
      throw new NotFoundError('Milestone index out of bounds');
    }

    project.milestones[milestoneIndex].status = status;
    if (status === 'completed') {
      project.milestones[milestoneIndex].completedAt = new Date();
    }

    // Auto-calculate progress percent based on milestones
    const completedCount = project.milestones.filter(m => m.status === 'completed').length;
    project.progressPercent = Math.round((completedCount / project.milestones.length) * 100);

    await project.save();

    res.json({ success: true, message: 'Milestone updated', project });
  } catch (err) {
    next(err);
  }
}

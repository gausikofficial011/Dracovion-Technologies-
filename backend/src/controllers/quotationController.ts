import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Quotation, IQuotation } from '../models/Quotation';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';
import { createNotification } from '../services/notificationService';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().int().min(1).default(1),
  unitPriceMinor: z.number().int().min(0, 'Unit price must be non-negative in paise'),
});

const createQuotationSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  enquiryId: z.string().optional(),
  title: z.string().min(3, 'Quotation title is required'),
  scopeDescription: z.string().min(10, 'Scope description is required'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  taxRatePercent: z.number().min(0).max(100).default(0),
  estimatedDeliveryDays: z.number().int().min(1).default(14),
  revisionLimit: z.number().int().min(0).default(3),
  supportTerms: z.string().default('30 days complimentary post-launch support and bug fixes.'),
  validityDays: z.number().int().min(1).default(14),
  notes: z.string().optional(),
});

export async function createQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createQuotationSchema.parse(req.body);
    const creatorId = (req.session as any)?.user?.userId;

    const client = await User.findById(data.clientId);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    // Calculate totals on the server
    const calculatedItems = data.lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      amountMinor: item.quantity * item.unitPriceMinor,
    }));

    const subtotalMinor = calculatedItems.reduce((acc, item) => acc + item.amountMinor, 0);
    const taxAmountMinor = Math.round(subtotalMinor * (data.taxRatePercent / 100));
    const totalMinor = subtotalMinor + taxAmountMinor;

    const count = await Quotation.countDocuments();
    const quotationNumber = `QTN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.validityDays);

    const quotation = await Quotation.create({
      quotationNumber,
      version: 1,
      enquiryId: data.enquiryId ? (data.enquiryId as any) : undefined,
      clientId: data.clientId as any,
      title: data.title,
      scopeDescription: data.scopeDescription,
      lineItems: calculatedItems,
      subtotalMinor,
      taxRatePercent: data.taxRatePercent,
      taxAmountMinor,
      totalMinor,
      currency: 'INR',
      estimatedDeliveryDays: data.estimatedDeliveryDays,
      revisionLimit: data.revisionLimit,
      supportTerms: data.supportTerms,
      validityDays: data.validityDays,
      expiresAt,
      status: 'sent',
      customerNotes: data.notes,
      createdBy: creatorId as any,
    });

    await recordAuditLog({
      userId: creatorId,
      action: 'QUOTATION_CREATED',
      entityType: 'Quotation',
      entityId: quotation._id.toString(),
      ipAddress: req.ip,
      details: { quotationNumber, totalMinor, clientId: data.clientId },
    });

    await createNotification({
      userId: data.clientId,
      title: 'New Quotation Received',
      message: `A formal proposal for '${quotation.title}' (${quotationNumber}) has been prepared for your review.`,
      link: `/client/quotations`,
      type: 'quotation',
    });

    res.status(201).json({
      success: true,
      message: 'Quotation created and dispatched to client',
      quotation,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllQuotations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [quotations, total] = await Promise.all([
      Quotation.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('clientId', 'fullName email companyName'),
      Quotation.countDocuments(filter),
    ]);

    res.json({
      success: true,
      quotations,
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

export async function getClientQuotations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const clientId = (req.session as any)?.user?.userId;
    const quotations = await Quotation.find({ clientId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      quotations,
    });
  } catch (err) {
    next(err);
  }
}

export async function getQuotationById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const quotation = await Quotation.findById(req.params.id)
      .populate('clientId', 'fullName email companyName phone')
      .populate('createdBy', 'fullName email');

    if (!quotation) {
      throw new NotFoundError('Quotation not found');
    }

    // Role check: Admin or the owning Client
    if (
      sessionUser.role !== 'admin' &&
      sessionUser.role !== 'owner' &&
      quotation.clientId._id.toString() !== sessionUser.userId.toString()
    ) {
      throw new ForbiddenError('Unauthorized to view this quotation.');
    }

    res.json({ success: true, quotation });
  } catch (err) {
    next(err);
  }
}

export async function negotiateQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const { notes, requestedAmountMinor } = z
      .object({
        notes: z.string().min(5, 'Please provide details for the negotiation request'),
        requestedAmountMinor: z.number().int().optional(),
      })
      .parse(req.body);

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      throw new NotFoundError('Quotation not found');
    }

    if (quotation.clientId.toString() !== sessionUser.userId.toString()) {
      throw new ForbiddenError('You can only negotiate quotations issued to you.');
    }

    if (quotation.status === 'accepted') {
      throw new BadRequestError('Cannot negotiate an already accepted quotation.');
    }

    quotation.status = 'negotiating';
    quotation.negotiationRequests.push({
      requestedAt: new Date(),
      notes,
      requestedAmountMinor,
      status: 'pending',
    });

    await quotation.save();

    await recordAuditLog({
      userId: sessionUser.userId,
      action: 'QUOTATION_NEGOTIATION_REQUESTED',
      entityType: 'Quotation',
      entityId: quotation._id.toString(),
      ipAddress: req.ip,
      details: { notes, requestedAmountMinor },
    });

    res.json({
      success: true,
      message: 'Negotiation notes submitted. Our team will review and respond with a revised proposal.',
      quotation,
    });
  } catch (err) {
    next(err);
  }
}

export async function acceptQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      throw new NotFoundError('Quotation not found');
    }

    if (quotation.clientId.toString() !== sessionUser.userId.toString()) {
      throw new ForbiddenError('You can only accept quotations issued to you.');
    }

    if (quotation.status === 'accepted') {
      throw new BadRequestError('This quotation has already been accepted.');
    }

    if (quotation.expiresAt < new Date()) {
      throw new BadRequestError('This quotation has expired. Please request a refreshed proposal.');
    }

    quotation.status = 'accepted';
    quotation.acceptedAt = new Date();
    quotation.acceptedBy = sessionUser.userId as any;
    await quotation.save();

    // Check if project already exists for this quotation
    let project = await Project.findOne({ quotationId: quotation._id });
    if (!project) {
      const projectCount = await Project.countDocuments();
      const projectCode = `DRAC-${new Date().getFullYear()}-${String(projectCount + 1).padStart(3, '0')}`;

      const targetDeliveryDate = new Date();
      targetDeliveryDate.setDate(targetDeliveryDate.getDate() + quotation.estimatedDeliveryDays);

      project = await Project.create({
        projectCode,
        title: quotation.title,
        description: quotation.scopeDescription,
        category: 'fullstack_web_app', // Default service category
        clientId: quotation.clientId,
        quotationId: quotation._id,
        status: 'approved',
        progressPercent: 0,
        budgetMinor: quotation.totalMinor,
        currency: quotation.currency,
        startDate: new Date(),
        targetDeliveryDate,
        milestones: [
          {
            title: 'Project Kickoff & Architecture Specification',
            description: 'Environment setup, requirement finalization, and initial database models.',
            status: 'pending',
          },
          {
            title: 'Core Development & Interactive Prototype',
            description: 'Complete UI/UX components and business logic implementation.',
            status: 'pending',
          },
          {
            title: 'Quality Assurance & Staging Review',
            description: 'Integration testing, security audit, and customer acceptance testing.',
            status: 'pending',
          },
          {
            title: 'Final Production Deployment & Deliverables Handoff',
            description: 'Domain connection, SSL configuration, and source repository transfer.',
            status: 'pending',
          },
        ],
        statusHistory: [
          {
            fromStatus: 'quoted',
            toStatus: 'approved',
            changedBy: sessionUser.userId,
            note: `Project initiated automatically upon quotation acceptance (${quotation.quotationNumber}).`,
            timestamp: new Date(),
          },
        ],
      });
    }

    await recordAuditLog({
      userId: sessionUser.userId,
      action: 'QUOTATION_ACCEPTED',
      entityType: 'Quotation',
      entityId: quotation._id.toString(),
      ipAddress: req.ip,
      details: { quotationNumber: quotation.quotationNumber, projectId: project._id },
    });

    await createNotification({
      userId: sessionUser.userId,
      title: 'Quotation Accepted & Project Initialized!',
      message: `Your project '${project.title}' (${project.projectCode}) is now approved and queued for engineering kickoff.`,
      link: `/client/projects/${project._id}`,
      type: 'project',
    });

    res.json({
      success: true,
      message: 'Quotation accepted! Your project has been initialized.',
      quotation,
      project,
    });
  } catch (err) {
    next(err);
  }
}

export async function rejectQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const { reason } = z.object({ reason: z.string().optional() }).parse(req.body);

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      throw new NotFoundError('Quotation not found');
    }

    if (quotation.clientId.toString() !== sessionUser.userId.toString()) {
      throw new ForbiddenError('You can only reject quotations issued to you.');
    }

    quotation.status = 'rejected';
    if (reason) quotation.customerNotes = `Rejection reason: ${reason}`;
    await quotation.save();

    await recordAuditLog({
      userId: sessionUser.userId,
      action: 'QUOTATION_REJECTED',
      entityType: 'Quotation',
      entityId: quotation._id.toString(),
      ipAddress: req.ip,
      details: { reason },
    });

    res.json({
      success: true,
      message: 'Quotation status updated to rejected.',
      quotation,
    });
  } catch (err) {
    next(err);
  }
}

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Enquiry } from '../models/Enquiry';
import { AuthenticatedRequest } from '../types';
import { NotFoundError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';

const enquirySchema = z.object({
  customerName: z.string().min(2, 'Name is required').trim(),
  email: z.string().email('Valid email is required').trim().toLowerCase(),
  phone: z.string().optional(),
  serviceCategory: z.string().min(1, 'Service category is required'),
  projectTitle: z.string().min(3, 'Project title is required').trim(),
  requirementsDescription: z.string().min(10, 'Please describe your requirements with at least 10 characters').trim(),
  preferredDeadline: z.string().optional(),
  budgetRange: z.string().min(1, 'Budget range is required'),
  pricingPreference: z.enum(['fixed', 'negotiable']).default('negotiable'),
  attachments: z.array(z.string()).default([]),
  privacyConsent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy notice to submit an enquiry',
  }),
});

export async function submitEnquiry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = enquirySchema.parse(req.body);

    const enquiry = await Enquiry.create({
      ...data,
      ipAddress: req.ip,
      status: 'new',
    });

    await recordAuditLog({
      action: 'ENQUIRY_SUBMITTED',
      entityType: 'Enquiry',
      entityId: enquiry._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        email: enquiry.email,
        serviceCategory: enquiry.serviceCategory,
        title: enquiry.projectTitle,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your project enquiry has been submitted. Our engineering team will review it and follow up within 24 business hours.',
      enquiryId: enquiry._id,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllEnquiries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;
    const category = req.query.category as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.serviceCategory = category;
    }
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('assignedTo', 'fullName email'),
      Enquiry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      enquiries,
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

export async function getEnquiryById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate('assignedTo', 'fullName email');
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }
    res.json({ success: true, enquiry });
  } catch (err) {
    next(err);
  }
}

export async function updateEnquiryStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, internalNotes, assignedTo } = z
      .object({
        status: z.enum(['new', 'under_review', 'contacted', 'quoted', 'converted', 'archived', 'rejected']).optional(),
        internalNotes: z.string().optional(),
        assignedTo: z.string().optional(),
      })
      .parse(req.body);

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    if (status) enquiry.status = status;
    if (internalNotes !== undefined) enquiry.internalNotes = internalNotes;
    if (assignedTo !== undefined) (enquiry as any).assignedTo = assignedTo || null;

    await enquiry.save();

    await recordAuditLog({
      userId: (req.session as any)?.user?.userId,
      action: 'ENQUIRY_UPDATED',
      entityType: 'Enquiry',
      entityId: enquiry._id.toString(),
      ipAddress: req.ip,
      details: { status, internalNotes },
    });

    res.json({ success: true, message: 'Enquiry updated successfully', enquiry });
  } catch (err) {
    next(err);
  }
}

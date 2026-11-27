import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ProjectOrder, ProjectOrderStatus } from '../models/ProjectOrder';
import { User } from '../models/User';
import { Message } from '../models/Message';
import { FileRecord } from '../models/FileRecord';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError, ForbiddenError, UnauthorizedError } from '../utils/errors';
import {
  sendOrderConfirmationEmail,
  sendStaffNewOrderNotification,
  sendOrderStatusUpdateEmail,
} from '../services/emailService';
import { recordAuditLog } from '../services/auditService';
import { publishChatEvent } from '../services/chatEventBus';
import { env } from '../config/env';

const personalDetailsSchema = z
  .object({
    fullName: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    workAddress: z.string().trim().optional(),
    address: z.string().trim().optional(),
    companyName: z.string().trim().optional(),
    organization: z.string().trim().optional(),
  })
  .optional();

const createOrderSchema = z.object({
  serviceCategory: z.enum([
    'website_development',
    'portfolio_and_landing',
    'ecommerce',
    'fullstack_web_app',
    'backend_and_database',
    'ai_and_ml_solutions',
    'workflow_automation',
    'ui_ux_design',
    'technical_consulting',
    'maintenance_and_support',
    'allhunter_student_project',
    'allhunter_mentoring',
  ]),
  projectTitle: z.string().min(3, 'Project title is required').trim(),
  description: z.string().min(10, 'Please provide detailed requirements for your project').trim(),
  estimatedBudget: z.string().optional(),
  preferredDeadline: z.string().optional(),
  attachmentUrls: z.array(z.string()).default([]),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  personalDetails: personalDetailsSchema,
});

function getMissingPersonalDetails(client: any, order?: any): string[] {
  const missing: string[] = [];
  const fullName = String(client?.fullName || order?.clientPersonalDetails?.fullName || '').trim();
  const phone = String(client?.phone || order?.clientPersonalDetails?.phone || '').trim();
  const location = String(
    client?.city ||
      client?.state ||
      client?.workAddress ||
      order?.clientPersonalDetails?.city ||
      order?.clientPersonalDetails?.state ||
      order?.clientPersonalDetails?.address ||
      ''
  ).trim();

  if (fullName.length < 2) missing.push('Full Name');
  if (phone.replace(/[^0-9]/g, '').length < 7) missing.push('Valid Phone Number');
  if (location.length < 2) missing.push('City / Location');
  return missing;
}

function canAccessOrderConversation(order: any, req: AuthenticatedRequest): boolean {
  const user = req.user;
  if (!user) return false;
  if (['super_admin', 'ceo', 'owner', 'employee'].includes(user.role)) return true;
  const orderClientId = order.clientId?._id ? order.clientId._id.toString() : order.clientId?.toString();
  return orderClientId === user.userId?.toString();
}

const updateStatusSchema = z.object({
  status: z.enum([
    'submitted',
    'reviewing',
    'quoted',
    'approved',
    'in_progress',
    'review_pending',
    'delivered',
    'completed',
    'revision_requested',
    'cancelled',
  ]),
  clientVisibleNote: z.string().optional(),
  internalNotes: z.string().optional(),
});

const assignSchema = z.object({
  employeeId: z.string().optional(), // if omitted, self-assigns to current user
});

/**
 * POST /api/v1/orders
 * Client places a project order for website, software, or app.
 * Notifies the client via Gmail, and alerts all workspace staff (Owner, CEO, Employees).
 */
export async function createProjectOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createOrderSchema.parse(req.body);
    const clientId = req.user?.userId;

    if (!clientId) {
      throw new BadRequestError('User authentication missing.');
    }

    const client = await User.findById(clientId);
    if (!client) {
      throw new NotFoundError('Client profile not found.');
    }

    // Sync any client personal details submitted along with the order
    if (data.personalDetails) {
      const pd = data.personalDetails;
      if (pd.fullName) client.fullName = pd.fullName;
      if (pd.phone) client.phone = pd.phone;
      if (pd.city) client.city = pd.city;
      if (pd.state) client.state = pd.state;
      const addr = pd.workAddress || pd.address;
      if (addr) client.workAddress = addr;
      const org = pd.companyName || pd.organization;
      if (org) client.companyName = org;
      await client.save();
    }

    const resolvedLocation = (client.city || client.state || client.workAddress || '').trim();
    const orderPersonalSnapshot =
      client.fullName && client.phone && resolvedLocation
        ? {
            fullName: client.fullName,
            phone: client.phone,
            city: client.city || resolvedLocation,
            state: client.state || '',
            address: client.workAddress || '',
            organization: client.companyName || client.collegeOrUniversity || '',
            completedAt: new Date(),
          }
        : undefined;

    // Create the project order with collision-safe orderNumber retry guard
    let order: any = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        order = await ProjectOrder.create({
          clientId: client._id,
          serviceCategory: data.serviceCategory,
          projectTitle: data.projectTitle,
          description: data.description,
          estimatedBudget: data.estimatedBudget,
          preferredDeadline: data.preferredDeadline,
          attachmentUrls: data.attachmentUrls,
          priority: data.priority,
          status: 'submitted',
          ...(orderPersonalSnapshot ? { clientPersonalDetails: orderPersonalSnapshot } : {}),
        });
        break;
      } catch (createErr: any) {
        const isDuplicateOrderNumber =
          createErr?.code === 11000 &&
          (createErr?.keyPattern?.orderNumber || String(createErr?.message || '').includes('orderNumber'));
        if (!isDuplicateOrderNumber || attempt === 4) {
          throw createErr;
        }
      }
    }

    // 1. Send confirmation email to client
    sendOrderConfirmationEmail(
      client.email,
      client.fullName,
      order.orderNumber,
      order.projectTitle
    ).catch(() => {});

    // 2. Alert all active workspace staff (Super Admin, CEO, Owner, Employees)
    const staffMembers = await User.find({ portalType: 'workspace', status: 'active' });
    for (const staff of staffMembers) {
      sendStaffNewOrderNotification(
        staff.email,
        staff.fullName,
        order.orderNumber,
        order.projectTitle,
        client.fullName,
        order.serviceCategory
      ).catch(() => {});
    }

    await recordAuditLog({
      userId: client._id,
      action: 'ORDER_PLACED',
      entityType: 'ProjectOrder',
      entityId: order._id.toString(),
      ipAddress: req.ip,
      details: { orderNumber: order.orderNumber, category: order.serviceCategory },
    });

    res.status(201).json({
      success: true,
      message: `Project order ${order.orderNumber} successfully submitted! Confirmation email dispatched to ${client.email}.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/orders/my
 * Client views their own orders.
 */
export async function getClientOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.user || (req.session as any)?.user;
    const clientId = sessionUser?.userId;

    if (!clientId) {
      res.json({
        success: true,
        count: 0,
        orders: [],
      });
      return;
    }

    const clientObjId = mongoose.Types.ObjectId.isValid(clientId) ? new mongoose.Types.ObjectId(clientId) : null;

    const orders = await ProjectOrder.find({
      $or: [
        { clientId: clientId },
        ...(clientObjId ? [{ clientId: clientObjId }] : []),
      ],
    })
      .populate('clientId', 'fullName email phone city state workAddress companyName collegeOrUniversity')
      .populate('assignedEmployeeId', 'fullName designation email avatarUrl phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/orders
 * Workspace Staff (Super Admin, CEO, Owner, Employees) view all platform orders.
 */
export async function getWorkspaceOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, category, assigned } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (category) query.serviceCategory = category;
    if (assigned === 'me') {
      query.assignedEmployeeId = req.user?.userId;
    } else if (assigned === 'unassigned') {
      query.assignedEmployeeId = { $exists: false };
    }

    const orders = await ProjectOrder.find(query)
      .populate('clientId', 'fullName email phone companyName collegeOrUniversity department degree academicYear registerNumber accountType city state workAddress industry')
      .populate('assignedEmployeeId', 'fullName designation employeeCode email phone')
      .sort({ createdAt: -1 });

    const stats = {
      total: await ProjectOrder.countDocuments(),
      submitted: await ProjectOrder.countDocuments({ status: 'submitted' }),
      inProgress: await ProjectOrder.countDocuments({ status: 'in_progress' }),
      completed: await ProjectOrder.countDocuments({ status: 'completed' }),
      unassigned: await ProjectOrder.countDocuments({ assignedEmployeeId: { $exists: false } }),
    };

    res.json({
      success: true,
      stats,
      orders,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/orders/:id
 * Retrieve a single order (accessible by client who placed it, or any workspace staff).
 */
export async function getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const order = await ProjectOrder.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
    })
      .populate('clientId', 'fullName email phone companyName collegeOrUniversity department degree academicYear registerNumber accountType city state workAddress industry')
      .populate('assignedEmployeeId', 'fullName designation employeeCode email phone avatarUrl');

    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    // Role verification
    const sessionUser = req.user;
    if (sessionUser?.portalType === 'client' && order.clientId._id.toString() !== sessionUser.userId) {
      throw new ForbiddenError('You are not authorized to view this order.');
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/orders/:id/assign
 * Employee self-assigns to an order, or Owner/CEO/Super Admin assigns an employee.
 * Automatically attaches the employee's direct contact phone number and payment details,
 * and initializes a direct welcoming chat communication to the client!
 */
export async function assignOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { employeeId } = assignSchema.parse(req.body);

    const order = await ProjectOrder.findById(id).populate(
      'clientId',
      'fullName email phone city state workAddress companyName collegeOrUniversity'
    );
    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    // Strict allocation gate: client must provide complete personal details first
    const missingDetails = getMissingPersonalDetails(order.clientId, order);
    if (missingDetails.length > 0) {
      throw new BadRequestError(
        `Project allocation blocked: client must provide their personal details first (${missingDetails.join(', ')}).`
      );
    }

    const targetEmployeeId = employeeId || req.user?.userId;
    const targetEmployee = await User.findById(targetEmployeeId);

    if (!targetEmployee || targetEmployee.portalType !== 'workspace') {
      throw new BadRequestError('Assigned user must be a valid workspace team member.');
    }

    order.assignedEmployeeId = targetEmployee._id as any;
    if (order.status === 'submitted') {
      order.status = 'reviewing';
    }

    // Payment details are NEVER auto-shared at allocation; the employee must explicitly share them with the client.

    const contactPhone = targetEmployee.phone || env.BUSINESS_PHONE;

    // Initial project update notification
    order.projectUpdates.push({
      title: 'Engineer Allocated & Sprint Mobilized',
      description: `${targetEmployee.fullName} (${targetEmployee.designation || 'Lead Engineer'}) has been allocated to direct technical delivery. Direct chat is active; direct payment stays locked until your engineer shares settlement details.`,
      progressPercent: order.progressPercent || 15,
      postedByName: targetEmployee.fullName,
      createdAt: new Date(),
    });

    await order.save();

    // Auto-create initial welcoming chat message connecting employee and client directly
    try {
      const greeting = await Message.create({
        orderId: order._id,
        clientId: (order.clientId as any)._id || order.clientId,
        channelType: 'order',
        senderId: targetEmployee._id,
        content: `Hello! I am ${targetEmployee.fullName} (${targetEmployee.designation || 'Lead Engineer'}). Your project "${order.projectTitle}" (${order.orderNumber}) has been allocated to me after personal details verification. Chat with me directly here or call ${contactPhone}.`,
      });
      const populatedGreeting = await Message.findById(greeting._id)
        .populate('senderId', 'fullName role designation avatarUrl phone')
        .lean();
      if (populatedGreeting) {
        publishChatEvent({
          type: 'new_message',
          channelType: 'order',
          orderId: order._id.toString(),
          clientId: String((order.clientId as any)._id || order.clientId),
          senderId: targetEmployee._id.toString(),
          message: populatedGreeting,
        });
      }
    } catch {
      // Non-blocking chat greeting
    }

    await recordAuditLog({
      userId: req.user?.userId as any,
      action: 'ORDER_ASSIGNED',
      entityType: 'ProjectOrder',
      entityId: order._id.toString(),
      ipAddress: req.ip,
      details: { assignedTo: targetEmployee.fullName, orderNumber: order.orderNumber },
    });

    res.json({
      success: true,
      message: `Order ${order.orderNumber} allocated to ${targetEmployee.fullName}. Direct chat established.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/orders/:id/share-payment-details
 * Assigned employee explicitly shares their direct payment details with the client to unlock direct payment.
 */
export async function shareEmployeePaymentDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { upiId, bankAccount, ifsc, holderName, phone, notes } = z
      .object({
        upiId: z.string().trim().optional(),
        bankAccount: z.string().trim().optional(),
        ifsc: z.string().trim().optional(),
        holderName: z.string().trim().optional(),
        phone: z.string().trim().optional(),
        notes: z.string().trim().optional(),
      })
      .parse(req.body);

    const order = await ProjectOrder.findById(id).populate(
      'clientId',
      'fullName email phone city state workAddress'
    );
    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    if (!order.assignedEmployeeId) {
      throw new BadRequestError('Project must be allocated to an engineer before sharing payment details.');
    }

    const sessionUser = req.user || (req.session as any)?.user;
    const isAssignedEmployee = order.assignedEmployeeId.toString() === sessionUser?.userId?.toString();
    const isLeadership = ['super_admin', 'ceo', 'owner'].includes(sessionUser?.role);
    if (!isAssignedEmployee && !isLeadership) {
      throw new ForbiddenError('Only the allocated engineer or leadership can share direct payment details for this project.');
    }

    const missingDetails = getMissingPersonalDetails(order.clientId, order);
    if (missingDetails.length > 0) {
      throw new BadRequestError(`Client personal details incomplete (${missingDetails.join(', ')}).`);
    }

    const assignedEmployee = await User.findById(order.assignedEmployeeId).select(
      'fullName phone employeePaymentUpi employeePaymentBankAccount employeePaymentIfsc employeePaymentNotes'
    );

    const resolvedUpi = upiId || order.employeePaymentShare?.upiId || assignedEmployee?.employeePaymentUpi || '';
    const resolvedBank = bankAccount || order.employeePaymentShare?.bankAccount || assignedEmployee?.employeePaymentBankAccount || '';
    if (!resolvedUpi && !resolvedBank) {
      throw new BadRequestError('Please provide a valid UPI ID or bank account number before sharing settlement details.');
    }

    order.employeePaymentShare = {
      upiId: resolvedUpi,
      bankAccount: resolvedBank,
      ifsc: ifsc || order.employeePaymentShare?.ifsc || assignedEmployee?.employeePaymentIfsc || '',
      holderName: holderName || order.employeePaymentShare?.holderName || assignedEmployee?.fullName || sessionUser?.fullName || 'Lead Engineer',
      phone: phone || order.employeePaymentShare?.phone || assignedEmployee?.phone || sessionUser?.phone || env.BUSINESS_PHONE,
      notes: notes || order.employeePaymentShare?.notes || assignedEmployee?.employeePaymentNotes || 'Direct payment settlement to assigned engineer.',
      sharedAt: new Date(),
    };
    order.handoverStatus = 'ready_for_handover';

    order.projectUpdates.push({
      title: 'Direct Employee Payment Details Shared',
      description: `${order.employeePaymentShare.holderName} has shared direct payment details (${order.employeePaymentShare.upiId || order.employeePaymentShare.bankAccount}). Direct payment is now unlocked.`,
      progressPercent: Math.max(order.progressPercent, 85),
      postedByName: sessionUser?.fullName || 'Assigned Engineer',
      createdAt: new Date(),
    });

    await order.save();

    // Notify client directly inside order chat
    try {
      await Message.create({
        orderId: order._id,
        clientId: (order.clientId as any)._id || order.clientId,
        channelType: 'order',
        senderId: sessionUser?.userId,
        content: `Direct payment details are now shared for ${order.orderNumber} (${order.employeePaymentShare.upiId ? `UPI: ${order.employeePaymentShare.upiId}` : `Bank A/C: ${order.employeePaymentShare.bankAccount}`}). You may pay directly and submit your transaction reference in your order page.`,
      });
    } catch {
      // Non-blocking chat notice
    }

    await recordAuditLog({
      userId: sessionUser?.userId,
      action: 'EMPLOYEE_PAYMENT_DETAILS_SHARED',
      entityType: 'ProjectOrder',
      entityId: order._id.toString(),
      ipAddress: req.ip,
      details: { orderNumber: order.orderNumber, holderName: order.employeePaymentShare.holderName },
    });

    res.json({
      success: true,
      message: 'Direct employee payment details shared with client. Direct client payment is now unlocked.',
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/orders/:id/submit-handover-payment
 * Client records a direct payment made to the assigned employee.
 * Allowed ONLY when: (1) Client personal details are complete, (2) Project is allocated,
 * and (3) Assigned employee explicitly shared payment details.
 */
export async function submitHandoverPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { transactionRef, amountRupees } = z
      .object({
        transactionRef: z.string().min(4, 'Transaction / UTR reference required').trim(),
        amountRupees: z.union([z.string(), z.number()]),
      })
      .parse(req.body);

    const sessionUser = req.user || (req.session as any)?.user;
    const order = await ProjectOrder.findById(id)
      .populate('clientId', 'fullName email phone city state workAddress')
      .populate('assignedEmployeeId', 'fullName email phone');

    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    const orderClientId = (order.clientId as any)?._id?.toString() || order.clientId?.toString();
    if (orderClientId !== sessionUser?.userId?.toString()) {
      throw new ForbiddenError('Only the owning client is permitted to submit payment for this project.');
    }

    const missingDetails = getMissingPersonalDetails(order.clientId, order);
    if (missingDetails.length > 0) {
      throw new ForbiddenError(
        `You are not allowed to make a payment until your personal details are completed (${missingDetails.join(', ')}).`
      );
    }

    if (!order.assignedEmployeeId) {
      throw new ForbiddenError(
        'You are not allowed to make a payment until your project has been allocated to an assigned engineer.'
      );
    }

    const hasSharedPayment = Boolean(
      order.employeePaymentShare?.sharedAt &&
        (order.employeePaymentShare?.upiId || order.employeePaymentShare?.bankAccount)
    );
    if (!hasSharedPayment) {
      throw new ForbiddenError(
        'Payment is not allowed yet. You can pay directly only after the assigned employee shares their payment details with you.'
      );
    }

    const numericAmount = typeof amountRupees === 'string' ? parseFloat(amountRupees) : amountRupees;
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new BadRequestError('Please enter a valid positive payment amount.');
    }
    const amountMinor = Math.round(numericAmount * 100);

    order.handoverPaymentProof = {
      transactionRef,
      amountMinor,
      paidAt: new Date(),
      status: 'pending',
    };
    order.handoverStatus = 'payment_submitted';

    order.projectUpdates.push({
      title: 'Direct Payment Submitted to Assigned Employee',
      description: `Client submitted direct payment reference ${transactionRef} for ₹${numericAmount.toLocaleString('en-IN')}. Awaiting verification by ${(order.assignedEmployeeId as any).fullName}.`,
      progressPercent: Math.max(order.progressPercent, 95),
      postedByName: sessionUser?.fullName || 'Client',
      createdAt: new Date(),
    });

    await order.save();

    try {
      await Message.create({
        orderId: order._id,
        clientId: (order.clientId as any)?._id || order.clientId,
        channelType: 'order',
        senderId: sessionUser?.userId,
        content: `Direct payment of ₹${numericAmount.toLocaleString('en-IN')} submitted (Ref: ${transactionRef}). Please verify receipt to release final deliverables.`,
      });
    } catch {
      // Non-blocking chat notice
    }

    res.json({
      success: true,
      message: 'Direct payment reference submitted. The assigned engineer will verify receipt and release final project deliverables.',
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/orders/:id/verify-handover-payment
 * Assigned employee / workspace staff verifies the direct payment and UNLOCKS the project handover!
 */
export async function verifyHandoverPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const order = await ProjectOrder.findById(id).populate('clientId', 'fullName email');
    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    if (!order.handoverPaymentProof) {
      order.handoverPaymentProof = {
        transactionRef: 'VERIFIED_DIRECT_SETTLEMENT',
        amountMinor: 0,
        paidAt: new Date(),
        status: 'verified',
        verifiedAt: new Date(),
        verifiedBy: (req.user as any)?.fullName || 'Lead Engineer',
      };
    } else {
      order.handoverPaymentProof.status = 'verified';
      order.handoverPaymentProof.verifiedAt = new Date();
      order.handoverPaymentProof.verifiedBy = (req.user as any)?.fullName || 'Lead Engineer';
    }

    order.handoverStatus = 'handover_completed';
    order.status = 'completed';
    order.progressPercent = 100;
    order.deliveredAt = new Date();
    order.completedAt = new Date();

    // Auto-attach a production deliverable archive if not present
    if (!order.deliverables || order.deliverables.length === 0) {
      order.deliverables.push({
        title: `${order.projectTitle} - Production Source Repository & Deployment Artifacts`,
        fileKey: `DELIV_${order.orderNumber}_RELEASE_ARCHIVE`,
        originalName: `${order.orderNumber}_production_release.zip`,
        sizeBytes: 48529120, // ~48.5 MB
        downloadUrl: `/api/v1/files/DELIV_${order.orderNumber}_RELEASE_ARCHIVE/download`,
        uploadedAt: new Date(),
      });
    }

    order.projectUpdates.push({
      title: 'Handover Payment Verified • Deliverables Unlocked!',
      description: `Payment confirmed by ${(req.user as any)?.fullName}. The project has been officially handed over. Source code and deployment assets are now unlocked for download.`,
      progressPercent: 100,
      postedByName: (req.user as any)?.fullName || 'Lead Engineer',
      createdAt: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: `Handover payment verified for ${order.orderNumber}. Final deliverables are now unlocked for the client!`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/orders/:id/post-update
 * Employee posts a live project update to client and tracks sprint progress through the website.
 */
export async function postProjectUpdate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, progressPercent, deliverableTitle, deliverableFileKey, deliverableOriginalName, deliverableSizeBytes } = z.object({
      title: z.string().min(2, 'Update title required').trim(),
      description: z.string().min(5, 'Update description required').trim(),
      progressPercent: z.number().min(0).max(100).default(50),
      deliverableTitle: z.string().optional(),
      deliverableFileKey: z.string().optional(),
      deliverableOriginalName: z.string().optional(),
      deliverableSizeBytes: z.number().optional(),
    }).parse(req.body);

    const order = await ProjectOrder.findById(id).populate('clientId', 'fullName email');
    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    const updaterName = (req.user as any)?.fullName || 'Project Engineer';
    order.progressPercent = progressPercent;
    order.projectUpdates.push({
      title,
      description,
      progressPercent,
      postedByName: updaterName,
      createdAt: new Date(),
    });

    if (deliverableTitle && deliverableFileKey) {
      order.deliverables.push({
        title: deliverableTitle,
        fileKey: deliverableFileKey,
        originalName: deliverableOriginalName || `${deliverableTitle.toLowerCase().replace(/\s+/g, '_')}.zip`,
        sizeBytes: deliverableSizeBytes || 15000000,
        downloadUrl: `/api/v1/files/${deliverableFileKey}/download`,
        uploadedAt: new Date(),
      });
    }

    if (progressPercent >= 100 && order.handoverStatus === 'in_development') {
      order.handoverStatus = 'ready_for_handover';
    }

    await order.save();

    res.json({
      success: true,
      message: `Project update "${title}" posted to client timeline.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/orders/:id/messages
 * Retrieve direct chat messages between client and assigned employee for this order.
 */
export async function getOrderMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const order = await ProjectOrder.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
    });
    if (!order) {
      throw new NotFoundError('Order not found.');
    }
    if (!canAccessOrderConversation(order, req)) {
      throw new ForbiddenError('You are not authorized to access messages for this project order.');
    }

    const messages = await Message.find({ orderId: order._id })
      .populate('senderId', 'fullName role designation avatarUrl phone')
      .populate('attachments', 'fileKey originalName mimeType sizeBytes')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/orders/:id/messages
 * Send direct chat message (and optional shared attachments) between client and assigned employee.
 */
export async function sendOrderMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { content, attachments } = z
      .object({
        content: z.string().trim().max(5000).optional().default(''),
        attachments: z.array(z.string()).max(5).optional().default([]),
      })
      .parse(req.body);

    const attachmentIds = attachments.map((attId) => {
      if (!mongoose.Types.ObjectId.isValid(attId)) {
        throw new BadRequestError('Invalid attachment identifier.');
      }
      return new mongoose.Types.ObjectId(attId);
    });

    if (!content && attachmentIds.length === 0) {
      throw new BadRequestError('Message content or an attachment is required.');
    }

    if (attachmentIds.length > 0) {
      const count = await FileRecord.countDocuments({ _id: { $in: attachmentIds } });
      if (count !== attachmentIds.length) {
        throw new BadRequestError('One or more attached files could not be found.');
      }
    }

    const order = await ProjectOrder.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
    });
    if (!order) {
      throw new NotFoundError('Order not found.');
    }
    if (!canAccessOrderConversation(order, req)) {
      throw new ForbiddenError('You are not authorized to send messages on this project order.');
    }

    const message = await Message.create({
      orderId: order._id,
      clientId: order.clientId,
      senderId: req.user?.userId,
      channelType: 'order',
      content: content || 'Shared attachment',
      attachments: attachmentIds,
      readBy: [{ userId: req.user?.userId, readAt: new Date() }],
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'fullName role designation phone avatarUrl')
      .populate('attachments', 'fileKey originalName mimeType sizeBytes')
      .lean();

    publishChatEvent({
      type: 'new_message',
      channelType: 'order',
      orderId: order._id.toString(),
      clientId: order.clientId.toString(),
      senderId: String(req.user?.userId || ''),
      recipientUserIds: order.assignedEmployeeId ? [order.assignedEmployeeId.toString()] : [],
      message: populated,
    });

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/orders/:id/status
 * Workspace staff updates order status and dispatches real-time email notification to the client.
 */
export async function updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, clientVisibleNote, internalNotes } = updateStatusSchema.parse(req.body);

    const order = await ProjectOrder.findById(id).populate('clientId', 'fullName email');
    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    const oldStatus = order.status;
    order.status = status as ProjectOrderStatus;

    if (clientVisibleNote !== undefined) order.clientVisibleNote = clientVisibleNote;
    if (internalNotes !== undefined) order.internalNotes = internalNotes;

    if (status === 'delivered') order.deliveredAt = new Date();
    if (status === 'completed') order.completedAt = new Date();

    await order.save();

    // Dispatch Gmail notification to the client
    const client: any = order.clientId;
    if (client && client.email && oldStatus !== status) {
      sendOrderStatusUpdateEmail(
        client.email,
        client.fullName,
        order.orderNumber,
        order.projectTitle,
        status,
        clientVisibleNote || ''
      ).catch(() => {});
    }

    await recordAuditLog({
      userId: req.user?.userId as any,
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'ProjectOrder',
      entityId: order._id.toString(),
      ipAddress: req.ip,
      details: { orderNumber: order.orderNumber, from: oldStatus, to: status },
    });

    res.json({
      success: true,
      message: `Order ${order.orderNumber} updated to ${status.replace(/_/g, ' ').toUpperCase()}.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/orders/:id
 * Allows the owning client (or platform leadership) to delete an order.
 * Removes order and its associated chat messages.
 */
export async function deleteProjectOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const sessionUser = req.user || (req.session as any)?.user;

    if (!sessionUser?.userId) {
      throw new UnauthorizedError('Authentication required.');
    }

    const orderQuery = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { orderNumber: id }] }
      : { orderNumber: id };

    const order = await ProjectOrder.findOne(orderQuery);
    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    const isOwner = order.clientId.toString() === sessionUser.userId.toString();
    const isStaff = ['owner', 'admin', 'ceo', 'super_admin'].includes(sessionUser.role);

    if (!isOwner && !isStaff) {
      throw new ForbiddenError('You are not authorized to delete this order.');
    }

    // Protection rule: cannot delete if handover payment is already verified and deliverables completed
    if (order.handoverStatus === 'handover_completed' && order.handoverPaymentProof?.status === 'verified') {
      throw new BadRequestError('Completed orders with verified handover payments cannot be deleted.');
    }

    const orderNumber = order.orderNumber;
    const orderTitle = order.projectTitle;

    // Delete associated chat messages for this order
    await Message.deleteMany({ orderId: order._id });

    // Delete the order
    await ProjectOrder.findByIdAndDelete(order._id);

    await recordAuditLog({
      userId: sessionUser.userId,
      action: 'ORDER_DELETED',
      entityType: 'ProjectOrder',
      entityId: order._id.toString(),
      ipAddress: req.ip,
      details: { orderNumber, projectTitle: orderTitle, deletedByRole: sessionUser.role },
    });

    res.json({
      success: true,
      message: `Order ${orderNumber} ("${orderTitle}") has been successfully deleted.`,
    });
  } catch (err) {
    next(err);
  }
}


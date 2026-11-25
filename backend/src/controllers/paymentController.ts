import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Payment } from '../models/Payment';
import { Project } from '../models/Project';
import { Invoice } from '../models/Invoice';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';
import { createNotification } from '../services/notificationService';

const submitPaymentSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  invoiceId: z.string().optional(),
  amountMinor: z.number().int().min(100, 'Minimum payment amount is ₹1.00 (100 paise)'),
  paymentMethod: z.enum(['bank_transfer_neft_rtgs', 'upi', 'cash', 'cheque', 'other']),
  transactionReference: z.string().min(3, 'Transaction reference/UTR/UPI ref is required').trim(),
  idempotencyKey: z.string().optional(),
  receiptFileKey: z.string().optional(),
});

export async function submitPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const data = submitPaymentSchema.parse(req.body);

    // Prevent duplicate submission with idempotency key
    if (data.idempotencyKey) {
      const existing = await Payment.findOne({ idempotencyKey: data.idempotencyKey });
      if (existing) {
        res.status(200).json({
          success: true,
          message: 'Payment record already submitted (idempotent response).',
          payment: existing,
        });
        return;
      }
    }

    const project = await Project.findById(data.projectId);
    if (!project) {
      throw new NotFoundError('Associated project not found');
    }

    const count = await Payment.countDocuments();
    const paymentReference = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const payment = await Payment.create({
      paymentReference,
      projectId: data.projectId as any,
      invoiceId: data.invoiceId ? (data.invoiceId as any) : undefined,
      clientId: sessionUser.userId as any,
      amountMinor: data.amountMinor,
      currency: 'INR',
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference,
      idempotencyKey: data.idempotencyKey,
      receiptFileKey: data.receiptFileKey,
      status: 'submitted',
    });

    await recordAuditLog({
      userId: sessionUser.userId,
      action: 'PAYMENT_RECORD_SUBMITTED',
      entityType: 'Payment',
      entityId: payment._id.toString(),
      ipAddress: req.ip,
      details: {
        paymentReference,
        amountMinor: data.amountMinor,
        method: data.paymentMethod,
        ref: data.transactionReference,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payment record recorded successfully. An administrator will verify the transaction against our account ledger.',
      payment,
    });
  } catch (err) {
    next(err);
  }
}

export async function getClientPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const clientId = (req.session as any)?.user?.userId;
    const payments = await Payment.find({ clientId })
      .sort({ createdAt: -1 })
      .populate('projectId', 'title projectCode')
      .populate('invoiceId', 'invoiceNumber');

    res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
}

export async function getAllPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;

    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('clientId', 'fullName email companyName')
        .populate('projectId', 'title projectCode')
        .populate('verifiedBy', 'fullName email'),
      Payment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      payments,
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

export async function verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const { status, notes } = z
      .object({
        status: z.enum(['verified', 'rejected']),
        notes: z.string().optional(),
      })
      .parse(req.body);

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      throw new NotFoundError('Payment record not found');
    }

    if (payment.status === 'verified') {
      res.json({ success: true, message: 'Payment is already verified (idempotent)', payment });
      return;
    }

    payment.status = status;
    payment.verificationNotes = notes;
    payment.verifiedBy = sessionUser.userId as any;
    payment.verifiedAt = new Date();
    await payment.save();

    // If verified and invoice exists, update invoice balance
    if (status === 'verified' && payment.invoiceId) {
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        invoice.amountPaidMinor += payment.amountMinor;
        invoice.balanceDueMinor = Math.max(0, invoice.totalMinor - invoice.amountPaidMinor);
        if (invoice.balanceDueMinor === 0) {
          invoice.status = 'paid';
        } else if (invoice.amountPaidMinor > 0) {
          invoice.status = 'partially_paid';
        }
        await invoice.save();
      }
    }

    await recordAuditLog({
      userId: sessionUser.userId,
      action: `PAYMENT_${status.toUpperCase()}`,
      entityType: 'Payment',
      entityId: payment._id.toString(),
      ipAddress: req.ip,
      details: { paymentReference: payment.paymentReference, amountMinor: payment.amountMinor, notes },
    });

    await createNotification({
      userId: payment.clientId,
      title: `Payment ${status === 'verified' ? 'Verified' : 'Review Update'}`,
      message: `Your payment (${payment.paymentReference}) for ₹${(payment.amountMinor / 100).toLocaleString('en-IN')} has been ${status}.`,
      link: `/client/billing`,
      type: 'payment',
    });

    res.json({ success: true, message: `Payment record marked as ${status}`, payment });
  } catch (err) {
    next(err);
  }
}

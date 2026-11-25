import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Invoice } from '../models/Invoice';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';
import { env } from '../config/env';

const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().min(1).default(1),
  unitPriceMinor: z.number().int().min(0),
});

const createInvoiceSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  quotationId: z.string().optional(),
  clientId: z.string().min(1, 'Client ID is required'),
  dueDateDays: z.number().int().min(1).default(14),
  lineItems: z.array(invoiceLineItemSchema).min(1),
  isGstApplicable: z.boolean().default(env.BUSINESS_GST_REGISTERED),
  gstRatePercent: z.number().min(0).max(100).default(18),
  notes: z.string().optional(),
});

export async function createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createInvoiceSchema.parse(req.body);
    const sessionUser = (req.session as any)?.user;

    const [project, client] = await Promise.all([
      Project.findById(data.projectId),
      User.findById(data.clientId),
    ]);

    if (!project || !client) {
      throw new NotFoundError('Project or Client not found');
    }

    const calculatedItems = data.lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      amountMinor: item.quantity * item.unitPriceMinor,
    }));

    const subtotalMinor = calculatedItems.reduce((acc, item) => acc + item.amountMinor, 0);

    let cgstMinor = 0;
    let sgstMinor = 0;
    let igstMinor = 0;
    let totalMinor = subtotalMinor;

    if (data.isGstApplicable && data.gstRatePercent > 0) {
      const taxRate = data.gstRatePercent / 100;
      const totalTax = Math.round(subtotalMinor * taxRate);
      
      // Tamil Nadu Intra-state vs Inter-state determination
      // If client state is Tamil Nadu or not specified, CGST + SGST (9% + 9%)
      // If client is outside Tamil Nadu, IGST (18%)
      const isIntraState = true; // Tamil Nadu default
      if (isIntraState) {
        cgstMinor = Math.round(totalTax / 2);
        sgstMinor = totalTax - cgstMinor;
      } else {
        igstMinor = totalTax;
      }
      totalMinor = subtotalMinor + totalTax;
    }

    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + data.dueDateDays);

    const invoice = await Invoice.create({
      invoiceNumber,
      projectId: project._id,
      quotationId: data.quotationId ? (data.quotationId as any) : undefined,
      clientId: client._id,
      clientBillingDetails: {
        name: client.fullName,
        email: client.email,
        phone: client.phone,
        company: client.companyName,
        state: 'Tamil Nadu',
      },
      businessDetails: {
        name: env.BUSINESS_NAME,
        address: `${env.BUSINESS_NAME}, Tamil Nadu, India`,
        state: env.BUSINESS_ADDRESS_STATE,
        gstin: env.BUSINESS_GSTIN,
        pan: env.BUSINESS_PAN,
        email: env.BUSINESS_EMAIL,
        phone: env.BUSINESS_PHONE,
      },
      dueDate,
      lineItems: calculatedItems,
      subtotalMinor,
      isGstApplicable: data.isGstApplicable,
      gstRatePercent: data.gstRatePercent,
      cgstMinor,
      sgstMinor,
      igstMinor,
      totalMinor,
      amountPaidMinor: 0,
      balanceDueMinor: totalMinor,
      currency: 'INR',
      status: 'issued',
      notes: data.notes,
    });

    await recordAuditLog({
      userId: sessionUser.userId,
      action: 'INVOICE_GENERATED',
      entityType: 'Invoice',
      entityId: invoice._id.toString(),
      ipAddress: req.ip,
      details: { invoiceNumber, totalMinor, isGstApplicable: data.isGstApplicable },
    });

    res.status(201).json({
      success: true,
      message: 'Invoice issued successfully',
      invoice,
    });
  } catch (err) {
    next(err);
  }
}

export async function getClientInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const clientId = (req.session as any)?.user?.userId;
    const invoices = await Invoice.find({ clientId }).sort({ createdAt: -1 }).populate('projectId', 'title projectCode');

    res.json({ success: true, invoices });
  } catch (err) {
    next(err);
  }
}

export async function getAllInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;

    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('clientId', 'fullName email companyName')
        .populate('projectId', 'title projectCode'),
      Invoice.countDocuments(filter),
    ]);

    res.json({
      success: true,
      invoices,
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

export async function getInvoiceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId', 'fullName email companyName phone')
      .populate('projectId', 'title projectCode');

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    if (
      sessionUser.role !== 'admin' &&
      sessionUser.role !== 'owner' &&
      invoice.clientId._id.toString() !== sessionUser.userId.toString()
    ) {
      throw new ForbiddenError('Unauthorized to access this invoice.');
    }

    res.json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
}

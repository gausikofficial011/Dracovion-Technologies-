import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';
import {
  encryptEmployeePassword,
  decryptEmployeePassword,
  generateStrongMemorablePassword,
} from '../utils/credentialCrypto';

// Super Admin can ONLY create login credentials for Employees (not for Owner or CEO)
const createStaffSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').trim(),
  email: z.string().email('Valid work email required').trim().toLowerCase(),
  password: z.string().min(8, 'Initial password must be at least 8 characters').optional(),
  role: z.literal('employee').default('employee'),
  department: z.string().min(2, 'Department is required').trim(),
  designation: z.string().min(2, 'Designation is required').trim(),
  phone: z.string().optional(),
  employeeCode: z.string().optional(),
  employeePaymentUpi: z.string().optional(),
  employeePaymentBankAccount: z.string().optional(),
  employeePaymentIfsc: z.string().optional(),
  employeePaymentNotes: z.string().optional(),
});

const updateStaffSchema = z.object({
  fullName: z.string().min(2).optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['active', 'suspended']).optional(),
  phone: z.string().optional(),
  employeePaymentUpi: z.string().optional(),
  employeePaymentBankAccount: z.string().optional(),
  employeePaymentIfsc: z.string().optional(),
  employeePaymentNotes: z.string().optional(),
});

/**
 * GET /api/v1/super-admin/staff
 * List all workspace team members (Employees, CEO, Owner, Super Admins).
 * Decrypts retrievable passwords ONLY for employee accounts so Super Admin can recover them.
 */
export async function listAllStaff(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const staff = await User.find({ portalType: 'workspace' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const counts = {
      total: staff.length,
      employees: staff.filter((s) => s.role === 'employee').length,
      ceo: staff.filter((s) => s.role === 'ceo').length,
      owner: staff.filter((s) => s.role === 'owner').length,
      superAdmin: staff.filter((s) => s.role === 'super_admin').length,
      active: staff.filter((s) => s.status === 'active').length,
    };

    const staffRoster = staff.map((s) => {
      let retrievablePassword: string | null = null;
      if (s.role === 'employee' && s.employeeManagedPassword) {
        try {
          retrievablePassword = decryptEmployeePassword(s.employeeManagedPassword);
        } catch {
          retrievablePassword = null;
        }
      }

      return {
        _id: s._id,
        fullName: s.fullName,
        email: s.email,
        role: s.role,
        portalType: s.portalType,
        designation: s.designation,
        department: s.department,
        employeeCode: s.employeeCode,
        phone: s.phone,
        employeePaymentUpi: s.employeePaymentUpi,
        employeePaymentBankAccount: s.employeePaymentBankAccount,
        employeePaymentIfsc: s.employeePaymentIfsc,
        employeePaymentNotes: s.employeePaymentNotes,
        status: s.status,
        createdAt: s.createdAt,
        lastLoginAt: s.lastLoginAt,
        retrievablePassword, // ONLY for employee role
        isPermanentLeadership: ['super_admin', 'owner', 'ceo'].includes(s.role),
      };
    });

    res.json({
      success: true,
      counts,
      staff: staffRoster,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/super-admin/staff
 * Super Admin creates a new workspace employee account.
 * (Rule: Only for Employees; Owner and CEO are permanent leadership accounts).
 */
export async function createStaffAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // If client tried to submit role !== 'employee', reject upfront
    if (req.body.role && req.body.role !== 'employee') {
      throw new BadRequestError('Super Admin can only create login accounts for Employees. Owner and CEO accounts are permanent leadership roles.');
    }

    const data = createStaffSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new BadRequestError('An account with this email address already exists on the platform.');
    }

    // Auto-generate employee code if missing
    let code = data.employeeCode?.trim().toUpperCase();
    if (!code) {
      const count = await User.countDocuments({ role: 'employee' });
      code = `DRV-EMP-${String(count + 1).padStart(3, '0')}`;
    }

    // Generate strong memorable password if not provided
    const plainPassword = data.password?.trim() || generateStrongMemorablePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 12);
    const employeeManagedPassword = encryptEmployeePassword(plainPassword);

    const staffMember = await User.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      employeeManagedPassword, // Securely retrievable by Super Admin for employee recovery
      role: 'employee',
      portalType: 'workspace',
      designation: data.designation,
      department: data.department,
      phone: data.phone,
      employeeCode: code,
      employeePaymentUpi: data.employeePaymentUpi,
      employeePaymentBankAccount: data.employeePaymentBankAccount,
      employeePaymentIfsc: data.employeePaymentIfsc,
      employeePaymentNotes: data.employeePaymentNotes,
      isEmailVerified: true,
      status: 'active',
    });

    await recordAuditLog({
      userId: req.user?.userId as any,
      action: 'STAFF_EMPLOYEE_ACCOUNT_CREATED',
      entityType: 'User',
      entityId: staffMember._id.toString(),
      ipAddress: req.ip,
      details: { role: staffMember.role, employeeCode: staffMember.employeeCode, email: staffMember.email },
    });

    res.status(201).json({
      success: true,
      message: `Employee account created for ${staffMember.fullName} (${staffMember.employeeCode}).`,
      retrievablePassword: plainPassword,
      staff: {
        id: staffMember._id,
        fullName: staffMember.fullName,
        email: staffMember.email,
        role: staffMember.role,
        designation: staffMember.designation,
        department: staffMember.department,
        employeeCode: staffMember.employeeCode,
        status: staffMember.status,
        retrievablePassword: plainPassword,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/super-admin/staff/:id/reset-password
 * Super Admin generates or sets a new strong memorable password for an employee.
 * Strictly forbidden for Owner and CEO.
 */
export async function resetEmployeePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      throw new NotFoundError('Staff account not found.');
    }

    if (targetUser.role !== 'employee') {
      throw new ForbiddenError('Super Admin can only retrieve or reset passwords for employee accounts. Owner, CEO, and Super Admin accounts are self-managed permanent roles.');
    }

    const plainPassword = (newPassword && String(newPassword).trim().length >= 8)
      ? String(newPassword).trim()
      : generateStrongMemorablePassword();

    targetUser.passwordHash = await bcrypt.hash(plainPassword, 12);
    targetUser.employeeManagedPassword = encryptEmployeePassword(plainPassword);
    await targetUser.save();

    await recordAuditLog({
      userId: req.user?.userId as any,
      action: 'EMPLOYEE_PASSWORD_RESET_BY_SUPER_ADMIN',
      entityType: 'User',
      entityId: id,
      ipAddress: req.ip,
      details: { employeeEmail: targetUser.email, employeeCode: targetUser.employeeCode },
    });

    res.json({
      success: true,
      message: `Password successfully updated for ${targetUser.fullName}.`,
      retrievablePassword: plainPassword,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/super-admin/staff/:id
 * Only the Super Admin can permanently delete an employee account.
 * Owner, CEO, and Super Admin are permanent roles and CANNOT be deleted.
 */
export async function deleteStaffAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      throw new NotFoundError('Staff account not found.');
    }

    // Permanent leadership roles cannot be deleted
    if (['super_admin', 'owner', 'ceo'].includes(targetUser.role)) {
      throw new ForbiddenError(`Permanent leadership account (${targetUser.role.toUpperCase()}) cannot be deleted.`);
    }

    if (targetUser.role !== 'employee') {
      throw new ForbiddenError('Only employee accounts can be permanently deleted.');
    }

    await User.findByIdAndDelete(id);

    await recordAuditLog({
      userId: req.user?.userId as any,
      action: 'EMPLOYEE_ACCOUNT_PERMANENTLY_DELETED',
      entityType: 'User',
      entityId: id,
      ipAddress: req.ip,
      details: { deletedEmail: targetUser.email, deletedRole: targetUser.role },
    });

    res.json({
      success: true,
      message: `Account for ${targetUser.fullName} (${targetUser.email}) has been permanently deleted from the workspace.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/super-admin/staff/:id
 * Update staff details or status
 */
export async function updateStaffAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updates = updateStaffSchema.parse(req.body);

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('Staff account not found.');
    }

    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.designation) user.designation = updates.designation;
    if (updates.department) user.department = updates.department;
    if (updates.status) user.status = updates.status;
    if (updates.phone !== undefined) user.phone = updates.phone;

    await user.save();

    await recordAuditLog({
      userId: req.user?.userId as any,
      action: 'STAFF_ACCOUNT_UPDATED',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
      details: updates,
    });

    res.json({
      success: true,
      message: 'Staff profile updated successfully.',
      staff: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
}


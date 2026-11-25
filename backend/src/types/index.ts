import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole =
  | 'client'
  | 'employee'
  | 'owner'
  | 'ceo'
  | 'super_admin'
  | 'admin'
  | 'student'
  | 'partner'
  | 'team_member';

export type PortalType = 'client' | 'workspace';
export type AuthProvider = 'local' | 'google' | 'github';

export type ProjectStatus =
  | 'requested'
  | 'reviewing'
  | 'quoted'
  | 'approved'
  | 'in_progress'
  | 'review'
  | 'delivered'
  | 'completed'
  | 'revision_required'
  | 'blocked'
  | 'rejected'
  | 'cancelled';

export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'negotiating'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'superseded';

export type PaymentStatus =
  | 'pending'
  | 'submitted'
  | 'verified'
  | 'rejected'
  | 'refunded';

export type PaymentMethod =
  | 'bank_transfer_neft_rtgs'
  | 'upi'
  | 'cash'
  | 'cheque'
  | 'other';

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'paid'
  | 'partially_paid'
  | 'void'
  | 'cancelled';

export interface IUserSessionData {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  portalType?: PortalType;
  designation?: string;
  department?: string;
  employeeCode?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserSessionData;
  requestId?: string;
}

export type ServiceCategory =
  | 'website_development'
  | 'portfolio_and_landing'
  | 'ecommerce'
  | 'fullstack_web_app'
  | 'backend_and_database'
  | 'ai_and_ml_solutions'
  | 'workflow_automation'
  | 'ui_ux_design'
  | 'technical_consulting'
  | 'maintenance_and_support'
  | 'allhunter_student_project'
  | 'allhunter_mentoring';

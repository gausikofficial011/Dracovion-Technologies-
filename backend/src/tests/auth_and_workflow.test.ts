import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { seedInitialData } from '../services/seedService';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Quotation } from '../models/Quotation';
import { Payment } from '../models/Payment';

describe('Dracovion Technologies Backend Integration & Security Tests', () => {
  let app: any;

  beforeAll(async () => {
    await connectDatabase();
    await seedInitialData();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('GET /api/v1/health returns 200 OK and database connected', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBe('connected');
  });

  it('GET /api/v1/catalog/services returns the seeded services', async () => {
    const res = await request(app).get('/api/v1/catalog/services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.services)).toBe(true);
    expect(res.body.services.length).toBeGreaterThanOrEqual(10);
  });

  it('POST /api/v1/enquiries successfully submits a project enquiry', async () => {
    const enquiryPayload = {
      customerName: 'Karthik Subramanian',
      email: 'karthik@example.com',
      phone: '+91 9876543210',
      serviceCategory: 'fullstack_web_app',
      projectTitle: 'Fleet Telemetry Portal for Tamil Nadu Logistics',
      requirementsDescription: 'Looking for a full-stack tracking dashboard with GPS sensor telemetry and driver dispatch.',
      preferredDeadline: 'Within 30 days',
      budgetRange: '₹50,000 - ₹1,00,000',
      pricingPreference: 'negotiable',
      privacyConsent: true,
    };

    const res = await request(app).post('/api/v1/enquiries').send(enquiryPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.enquiryId).toBeDefined();
  });

  it('POST /api/v1/enquiries rejects submission without privacy consent', async () => {
    const invalidPayload = {
      customerName: 'Incomplete User',
      email: 'invalid@example.com',
      serviceCategory: 'website_development',
      projectTitle: 'No Consent App',
      requirementsDescription: 'Requirements without privacy acceptance.',
      budgetRange: '₹10,000',
      privacyConsent: false,
    };

    const res = await request(app).post('/api/v1/enquiries').send(invalidPayload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Authentication & Client-Admin Workflow Lifecycle', async () => {
    const clientAgent = request.agent(app);
    const adminAgent = request.agent(app);
    const uniqueEmail = `client_${Date.now()}@dracovion-test.com`;

    // 1. Client registers
    const clientRegisterRes = await clientAgent.post('/api/v1/auth/register').send({
      email: uniqueEmail,
      password: 'ClientPassword2026!',
      fullName: 'Ananya Ramesh',
      companyName: 'Ramesh Agro Technologies',
      role: 'client',
    });
    expect(clientRegisterRes.status).toBe(201);
    expect(clientRegisterRes.body.user.role).toBe('client');
    const clientId = clientRegisterRes.body.user.id;

    // 2. Client logs in and verifies session
    const clientLoginRes = await clientAgent.post('/api/v1/auth/login').send({
      email: uniqueEmail,
      password: 'ClientPassword2026!',
    });
    expect(clientLoginRes.status).toBe(200);

    const meRes = await clientAgent.get('/api/v1/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(uniqueEmail);

    // 3. Admin logs in with seeded initial owner credentials
    const adminLoginRes = await adminAgent.post('/api/v1/auth/login').send({
      email: 'president@dracovion.com',
      password: 'DracovionPresident2026!',
    });
    expect(adminLoginRes.status).toBe(200);
    expect(adminLoginRes.body.user.role).toBe('owner');

    // 4. Admin creates quotation for client
    const createQuotationRes = await adminAgent.post('/api/v1/quotations/admin').send({
      clientId,
      title: 'Agricultural IoT Telemetry Platform',
      scopeDescription: 'Hardware integration, sensor data visualization, and farmer mobile UI.',
      lineItems: [
        { description: 'Telemetry API & Cloud Architecture', quantity: 1, unitPriceMinor: 2500000 },
        { description: 'Web Dashboard & Real-Time Charts', quantity: 1, unitPriceMinor: 2000000 },
      ],
      taxRatePercent: 18,
      estimatedDeliveryDays: 21,
    });
    expect(createQuotationRes.status).toBe(201);
    const quotation = createQuotationRes.body.quotation;
    expect(quotation.subtotalMinor).toBe(4500000);
    expect(quotation.taxAmountMinor).toBe(810000); // 18% of 4500000
    expect(quotation.totalMinor).toBe(5310000);
    const quotationId = quotation._id;

    // 5. Client views their quotation
    const clientQuotationRes = await clientAgent.get(`/api/v1/quotations/${quotationId}`);
    expect(clientQuotationRes.status).toBe(200);
    expect(clientQuotationRes.body.quotation.totalMinor).toBe(5310000);

    // 6. Client accepts the quotation -> automatically initializes project
    const acceptRes = await clientAgent.post(`/api/v1/quotations/${quotationId}/accept`).send();
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.project).toBeDefined();
    expect(acceptRes.body.project.status).toBe('approved');
    const projectId = acceptRes.body.project._id;

    // 7. Client submits a payment record
    const uniqueIdemKey = `test_idem_key_${Date.now()}`;
    const paymentRes = await clientAgent.post('/api/v1/payments/submit').send({
      projectId,
      amountMinor: 2500000,
      paymentMethod: 'upi',
      transactionReference: 'UPI/2026/987123981273',
      idempotencyKey: uniqueIdemKey,
    });
    expect(paymentRes.status).toBe(201);
    const paymentId = paymentRes.body.payment._id;

    // 8. Idempotency test: duplicate payment submission returns same record without duplication
    const duplicatePaymentRes = await clientAgent.post('/api/v1/payments/submit').send({
      projectId,
      amountMinor: 2500000,
      paymentMethod: 'upi',
      transactionReference: 'UPI/2026/987123981273',
      idempotencyKey: uniqueIdemKey,
    });
    expect(duplicatePaymentRes.status).toBe(200);
    expect(duplicatePaymentRes.body.payment._id).toBe(paymentId);

    // 9. Admin verifies the payment
    const verifyRes = await adminAgent.patch(`/api/v1/payments/admin/${paymentId}/verify`).send({
      status: 'verified',
      notes: 'Verified against bank ledger via HDFC Netbanking.',
    });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.payment.status).toBe('verified');

    // 10. Admin advances project status to in_progress
    const updateProjectRes = await adminAgent.patch(`/api/v1/projects/${projectId}/status`).send({
      status: 'in_progress',
      progressPercent: 25,
      note: 'Sprint 1 commenced.',
    });
    expect(updateProjectRes.status).toBe(200);
    expect(updateProjectRes.body.project.status).toBe('in_progress');
  });

  describe('Negative Security Tests', () => {
    it('Unauthenticated visitor cannot access private project data', async () => {
      const res = await request(app).get('/api/v1/projects/client/my');
      expect(res.status).toBe(401);
    });

    it('A client cannot view another client\'s quotation', async () => {
      const client1 = request.agent(app);
      const client2 = request.agent(app);

      const u1Email = `user1_${Date.now()}@example.com`;
      const u2Email = `user2_${Date.now()}@example.com`;

      // Register client 1
      const c1Res = await client1.post('/api/v1/auth/register').send({
        email: u1Email,
        password: 'Password123!',
        fullName: 'User One',
      });
      const c1Id = c1Res.body.user.id;

      // Register client 2
      await client2.post('/api/v1/auth/register').send({
        email: u2Email,
        password: 'Password123!',
        fullName: 'User Two',
      });

      // Admin creates quote for client 1
      const adminAgent = request.agent(app);
      await adminAgent.post('/api/v1/auth/login').send({
        email: 'president@dracovion.com',
        password: 'DracovionPresident2026!',
      });

      const quoteRes = await adminAgent.post('/api/v1/quotations/admin').send({
        clientId: c1Id,
        title: 'Confidential Enterprise Contract',
        scopeDescription: 'Proprietary IP and custom algorithms.',
        lineItems: [{ description: 'Core IP', quantity: 1, unitPriceMinor: 1000000 }],
      });
      const quotationId = quoteRes.body.quotation._id;

      // Client 2 attempts to access Client 1's quotation
      const unauthorizedAccessRes = await client2.get(`/api/v1/quotations/${quotationId}`);
      expect(unauthorizedAccessRes.status).toBe(403);
    });

    it('Registration rejects self-promotion to admin or owner', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'hacker@example.com',
        password: 'HackerPassword2026!',
        fullName: 'Evil Attacker',
        role: 'owner', // Attempted privilege escalation
      });

      expect(res.status).toBe(400); // Zod validation rejects 'owner' in register schema
    });

    it('Client cannot verify payments', async () => {
      const clientAgent = request.agent(app);
      const clientEmail = `verify_test_${Date.now()}@example.com`;
      await clientAgent.post('/api/v1/auth/register').send({
        email: clientEmail,
        password: 'Password123!',
        fullName: 'Client Verify Test',
      });

      const res = await clientAgent.patch('/api/v1/payments/admin/dummy_id/verify').send({
        status: 'verified',
      });
      expect(res.status).toBe(403); // Forbidden
    });
  });

  describe('Executive Fraud Account Activation & Deactivation Security', () => {
    it('President, Super Admin, and CEO can disable fraudulent accounts, revoke active sessions immediately, and reactivate them; employees/clients cannot', async () => {
      const fraudClientAgent = request.agent(app);
      const fraudEmail = `fraud_check_${Date.now()}@example.com`;
      const fraudPass = 'TestPass2026!';

      const regRes = await fraudClientAgent.post('/api/v1/auth/register').send({
        email: fraudEmail,
        password: fraudPass,
        fullName: 'Suspected Account',
      });
      expect(regRes.status).toBe(201);
      const targetUserId = regRes.body.user.id;

      // Confirm active client session initially works
      const beforeDisableRes = await fraudClientAgent.get('/api/v1/projects/client/my');
      expect(beforeDisableRes.status).toBe(200);

      // Employee and Client must be rejected (403)
      const clientAttempt = await fraudClientAgent
        .patch(`/api/v1/admin/users/${targetUserId}/status`)
        .send({ status: 'suspended', isFraud: true, reason: 'Unauthorized attempt' });
      expect(clientAttempt.status).toBe(403);

      const empAgent = request.agent(app);
      await empAgent.post('/api/v1/auth/workspace/login').send({
        email: 'employee@dracovion.com',
        password: 'DracovionEmployee2026!',
      });
      const empAttempt = await empAgent
        .patch(`/api/v1/admin/users/${targetUserId}/status`)
        .send({ status: 'suspended', isFraud: true, reason: 'Employee attempt' });
      expect(empAttempt.status).toBe(403);

      // 1. President (Owner) disables account for fraud
      const presidentAgent = request.agent(app);
      await presidentAgent.post('/api/v1/auth/login').send({
        email: 'president@dracovion.com',
        password: 'DracovionPresident2026!',
      });
      const presDisableRes = await presidentAgent
        .patch(`/api/v1/admin/users/${targetUserId}/status`)
        .send({ status: 'suspended', isFraud: true, reason: 'Suspected fraudulent activity' });
      expect(presDisableRes.status).toBe(200);
      expect(presDisableRes.body.user.status).toBe('suspended');
      expect(presDisableRes.body.user.fraudFlag).toBe(true);

      // Existing session and fresh logins must fail immediately
      const kickedRes = await fraudClientAgent.get('/api/v1/projects/client/my');
      expect(kickedRes.status).toBe(403);
      const blockedLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: fraudEmail, password: fraudPass });
      expect(blockedLoginRes.status).toBe(403);

      // 2. CEO reactivates account
      const ceoAgent = request.agent(app);
      await ceoAgent.post('/api/v1/auth/workspace/login').send({
        email: 'ceo@dracovion.com',
        password: 'DracovionCEO2026!',
      });
      const ceoActivateRes = await ceoAgent
        .patch(`/api/v1/admin/users/${targetUserId}/status`)
        .send({ status: 'active', reason: 'Cleared by CEO review' });
      expect(ceoActivateRes.status).toBe(200);
      expect(ceoActivateRes.body.user.status).toBe('active');
      expect(ceoActivateRes.body.user.fraudFlag).toBe(false);

      // CEO cannot disable President/Super Admin
      const ownerRecordRes = await ceoAgent.get('/api/v1/admin/users').query({ role: 'owner' });
      const ownerId = ownerRecordRes.body.users[0]._id;
      const ceoLockOwnerRes = await ceoAgent
        .patch(`/api/v1/admin/users/${ownerId}/status`)
        .send({ status: 'suspended', isFraud: true, reason: 'Illegal attempt' });
      expect(ceoLockOwnerRes.status).toBe(403);

      // 3. Super Admin disables account again
      const saAgent = request.agent(app);
      await saAgent.post('/api/v1/auth/workspace/login').send({
        email: 'gausik@dracovion.com',
        password: 'DracovionSuperAdmin2026!',
      });
      const saDisableRes = await saAgent
        .patch(`/api/v1/admin/users/${targetUserId}/status`)
        .send({ status: 'suspended', isFraud: true, reason: 'Confirmed fraud by Super Admin' });
      expect(saDisableRes.status).toBe(200);
      expect(saDisableRes.body.user.status).toBe('suspended');

      // Reactivate cleanly and verify fresh login succeeds
      await saAgent
        .patch(`/api/v1/admin/users/${targetUserId}/status`)
        .send({ status: 'active', reason: 'Restored after verification' });
      const restoredLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: fraudEmail, password: fraudPass });
      expect(restoredLoginRes.status).toBe(200);
    });
  });

  describe('Password Reset OTP Flow Security', () => {
    it('Requires valid password_reset OTP before resetting password and allows sign-in with new password', async () => {
      const { OTP } = await import('../models/OTP');
      const bcrypt = await import('bcryptjs');
      const resetEmail = `reset_flow_${Date.now()}@example.com`;

      await request(app).post('/api/v1/auth/register').send({
        email: resetEmail,
        password: 'OldPassword2026!',
        fullName: 'Reset Flow User',
      });

      const forgotRes = await request(app).post('/api/v1/auth/forgot-password').send({ email: resetEmail });
      expect(forgotRes.status).toBe(200);

      const otpDoc = await OTP.findOne({ email: resetEmail, purpose: 'password_reset', isUsed: false });
      expect(otpDoc).toBeDefined();

      // Reject wrong OTP
      const badResetRes = await request(app).post('/api/v1/auth/reset-password').send({
        email: resetEmail,
        otp: '000000',
        newPassword: 'NewPassword2026!',
      });
      expect(badResetRes.status).toBe(400);

      // Set known test OTP hash and complete reset
      otpDoc!.otpHash = await bcrypt.hash('654321', 10);
      await otpDoc!.save();

      const validResetRes = await request(app).post('/api/v1/auth/reset-password').send({
        email: resetEmail,
        otp: '654321',
        newPassword: 'NewPassword2026!',
      });
      expect(validResetRes.status).toBe(200);

      const loginNewRes = await request(app).post('/api/v1/auth/login').send({
        email: resetEmail,
        password: 'NewPassword2026!',
      });
      expect(loginNewRes.status).toBe(200);
    });
  });
});

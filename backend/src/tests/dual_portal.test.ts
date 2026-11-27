import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { seedInitialData } from '../services/seedService';
import { OTP } from '../models/OTP';

describe('Dracovion Dual Portal System & Order Lifecycle Tests', () => {
  let app: any;

  beforeAll(async () => {
    await connectDatabase();
    await seedInitialData();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('Client Portal: Requests OTP, verifies OTP, and receives session', async () => {
    const clientAgent = request.agent(app);
    const testEmail = 'acme.corp@example.com';

    // 1. Client requests OTP
    const otpReqRes = await clientAgent.post('/api/v1/auth/client/send-otp').send({
      email: testEmail,
      purpose: 'email_verification',
    });
    expect(otpReqRes.status).toBe(200);
    expect(otpReqRes.body.success).toBe(true);

    // Retrieve generated OTP document directly from test db
    const otpDoc = await OTP.findOne({ email: testEmail, isUsed: false });
    expect(otpDoc).toBeDefined();

    // In a test environment, test with an invalid OTP first to verify security
    const invalidVerifyRes = await clientAgent.post('/api/v1/auth/client/verify-otp').send({
      email: testEmail,
      otp: '000000',
    });
    expect(invalidVerifyRes.status).toBe(400);

    // Now test with bcrypt check or set a known hash
    const bcrypt = await import('bcryptjs');
    otpDoc!.otpHash = await bcrypt.hash('123456', 10);
    await otpDoc!.save();

    const validVerifyRes = await clientAgent.post('/api/v1/auth/client/verify-otp').send({
      email: testEmail,
      otp: '123456',
      fullName: 'Acme Enterprise Director',
      companyName: 'Acme Global Corp',
      password: 'ClientSecurePassword2026!',
    });
    expect(validVerifyRes.status).toBe(200);
    expect(validVerifyRes.body.user.portalType).toBe('client');
    expect(validVerifyRes.body.user.role).toBe('client');

    // Verify session persistence
    const meRes = await clientAgent.get('/api/v1/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(testEmail);
  });

  it('Client Order Creation & Staff Visibility Lifecycle', async () => {
    const clientAgent = request.agent(app);
    const employeeAgent = request.agent(app);
    const superAdminAgent = request.agent(app);

    // 1. Client registers and authenticates
    const clientEmail = `client_${Date.now()}@example.com`;
    const regRes = await clientAgent.post('/api/v1/auth/register').send({
      email: clientEmail,
      password: 'ClientPassword2026!',
      fullName: 'Enterprise Test Client',
      companyName: 'Logistics Enterprise Ltd',
      role: 'client',
    });
    expect(regRes.status).toBe(201);

    // 2. Client places an order for a web application
    const createOrderRes = await clientAgent.post('/api/v1/orders').send({
      serviceCategory: 'fullstack_web_app',
      projectTitle: 'AI-Powered Automated Logistics ERP',
      description: 'Require enterprise grade web portal with real-time fleet GPS tracking, driver dispatch, and automated invoicing.',
      estimatedBudget: '₹2,50,000 - ₹5,00,000',
      preferredDeadline: '45 days',
      priority: 'high',
    });
    expect(createOrderRes.status).toBe(201);
    expect(createOrderRes.body.order).toBeDefined();
    expect(createOrderRes.body.order.orderNumber).toMatch(/^DRV-\d{4}-\d{4}$/);
    const orderId = createOrderRes.body.order._id;

    // 3. Client checks their own orders
    const myOrdersRes = await clientAgent.get('/api/v1/orders/my');
    expect(myOrdersRes.status).toBe(200);
    expect(myOrdersRes.body.orders.length).toBeGreaterThanOrEqual(1);

    // 4. Employee logs into Workspace
    const empLoginRes = await employeeAgent.post('/api/v1/auth/workspace/login').send({
      email: 'employee@dracovion.com',
      password: 'DracovionEmployee2026!',
    });
    expect(empLoginRes.status).toBe(200);
    expect(empLoginRes.body.user.role).toBe('employee');

    // 5. Employee views all platform orders (visible to owner, CEO, employees)
    const allOrdersRes = await employeeAgent.get('/api/v1/orders');
    expect(allOrdersRes.status).toBe(200);
    expect(allOrdersRes.body.orders.some((o: any) => o._id === orderId)).toBe(true);

    // 6a. Attempt to allocate before client completes personal details -> blocked (400)
    const blockedAssignRes = await employeeAgent.patch(`/api/v1/orders/${orderId}/assign`).send();
    expect(blockedAssignRes.status).toBe(400);

    // 6b. Client attempts payment before allocation or payment sharing -> forbidden (403)
    const blockedPreAllocPay = await clientAgent.post(`/api/v1/orders/${orderId}/submit-handover-payment`).send({
      transactionRef: 'UTR123456789',
      amountRupees: 25000,
    });
    expect(blockedPreAllocPay.status).toBe(403);

    // 6c. Client provides personal details (phone & city) -> allocation now succeeds
    const profileUpdateRes = await clientAgent.put('/api/v1/auth/profile').send({
      phone: '+91 9876543210',
      city: 'Chennai',
      state: 'Tamil Nadu',
    });
    expect(profileUpdateRes.status).toBe(200);

    const assignRes = await employeeAgent.patch(`/api/v1/orders/${orderId}/assign`).send();
    expect(assignRes.status).toBe(200);
    expect(assignRes.body.order.status).toBe('reviewing');
    expect(assignRes.body.order.employeePaymentShare?.sharedAt).toBeUndefined();

    // 6d. Client still CANNOT pay directly until assigned employee explicitly shares payment details
    const blockedBeforeSharePay = await clientAgent.post(`/api/v1/orders/${orderId}/submit-handover-payment`).send({
      transactionRef: 'UTR999888777',
      amountRupees: 25000,
    });
    expect(blockedBeforeSharePay.status).toBe(403);

    // 6e. Assigned employee explicitly shares payment details -> payment unlocks cleanly
    const sharePayRes = await employeeAgent.post(`/api/v1/orders/${orderId}/share-payment-details`).send({
      upiId: 'lead.engineer@okicici',
      holderName: 'Dracovion Lead Engineer',
      notes: 'Direct settlement after milestone review.',
    });
    expect(sharePayRes.status).toBe(200);
    expect(sharePayRes.body.order.employeePaymentShare.upiId).toBe('lead.engineer@okicici');

    // 6f. Client chats directly on order and submits payment directly to employee
    const chatRes = await clientAgent.post(`/api/v1/orders/${orderId}/messages`).send({
      content: 'Payment sent cleanly to your shared UPI.',
    });
    expect(chatRes.status).toBe(201);

    const directPayRes = await clientAgent.post(`/api/v1/orders/${orderId}/submit-handover-payment`).send({
      transactionRef: 'UTR202611250001',
      amountRupees: 25000,
    });
    expect(directPayRes.status).toBe(200);
    expect(directPayRes.body.order.handoverStatus).toBe('payment_submitted');

    const verifyHandoverRes = await employeeAgent.post(`/api/v1/orders/${orderId}/verify-handover-payment`).send();
    expect(verifyHandoverRes.status).toBe(200);
    expect(verifyHandoverRes.body.order.handoverStatus).toBe('handover_completed');

    // 7. Employee updates status to in_progress with note
    const updateStatusRes = await employeeAgent.patch(`/api/v1/orders/${orderId}/status`).send({
      status: 'in_progress',
      clientVisibleNote: 'Architecture sprint initiated. Database schemas finalized.',
      internalNotes: 'Assigned frontend module to Rajesh, backend microservices to cloud team.',
    });
    expect(updateStatusRes.status).toBe(200);
    expect(updateStatusRes.body.order.status).toBe('in_progress');

    // 8. Super Admin logs in and verifies full platform oversight & completed+paid metrics gating
    const saLoginRes = await superAdminAgent.post('/api/v1/auth/workspace/login').send({
      email: 'gausik@dracovion.com',
      password: 'DracovionSuperAdmin2026!',
    });
    expect(saLoginRes.status).toBe(200);
    expect(saLoginRes.body.user.role).toBe('super_admin');

    // Order is in_progress (even with verified payment) -> must NOT count toward completedProjects yet
    const preCompleteMetrics = await superAdminAgent.get('/api/v1/admin/dashboard-metrics');
    expect(preCompleteMetrics.status).toBe(200);
    const baselineCompleted = preCompleteMetrics.body.metrics.completedProjects;
    expect(Array.isArray(preCompleteMetrics.body.recentProjects)).toBe(true);
    expect(
      preCompleteMetrics.body.recentProjects.some(
        (p: any) => p.kind === 'order' && String(p._id) === String(orderId)
      )
    ).toBe(true);

    const adminProjectsListRes = await superAdminAgent.get('/api/v1/projects/admin/all');
    expect(adminProjectsListRes.status).toBe(200);
    expect(Array.isArray(adminProjectsListRes.body.projects)).toBe(true);

    // Complete the already payment-verified order -> now completedProjects increments by 1
    const markCompletedRes = await employeeAgent.patch(`/api/v1/orders/${orderId}/status`).send({
      status: 'completed',
      clientVisibleNote: 'Production deployment completed and payment verified.',
    });
    expect(markCompletedRes.status).toBe(200);

    const postCompleteMetrics = await superAdminAgent.get('/api/v1/admin/dashboard-metrics');
    expect(postCompleteMetrics.status).toBe(200);
    expect(postCompleteMetrics.body.metrics.completedProjects).toBe(baselineCompleted + 1);
  });

  it('Super Admin Governance: Create new worker and permanent deletion security', async () => {
    const superAdminAgent = request.agent(app);
    const employeeAgent = request.agent(app);

    // Super Admin login
    await superAdminAgent.post('/api/v1/auth/workspace/login').send({
      email: 'gausik@dracovion.com',
      password: 'DracovionSuperAdmin2026!',
    });

    // 1. Super Admin creates a new worker workspace account
    const createWorkerRes = await superAdminAgent.post('/api/v1/super-admin/staff').send({
      fullName: 'Vikram Sundaram',
      email: 'vikram.engineer@dracovion.com',
      password: 'WorkerSecure2026!',
      role: 'employee',
      department: 'AI & Data Science Labs',
      designation: 'Computer Vision Specialist',
      phone: '+91 94444 11111',
    });
    expect(createWorkerRes.status).toBe(201);
    expect(createWorkerRes.body.staff.email).toBe('vikram.engineer@dracovion.com');
    const newWorkerId = createWorkerRes.body.staff.id;

    // 2. New worker logs in with their fixed credentials
    const workerAgent = request.agent(app);
    const workerLoginRes = await workerAgent.post('/api/v1/auth/workspace/login').send({
      email: 'vikram.engineer@dracovion.com',
      password: 'WorkerSecure2026!',
    });
    expect(workerLoginRes.status).toBe(200);
    expect(workerLoginRes.body.user.fullName).toBe('Vikram Sundaram');

    // 3. Regular employee CANNOT delete another employee (Security check)
    await employeeAgent.post('/api/v1/auth/workspace/login').send({
      email: 'employee@dracovion.com',
      password: 'DracovionEmployee2026!',
    });
    const unauthorizedDeleteRes = await employeeAgent.delete(`/api/v1/super-admin/staff/${newWorkerId}`);
    expect(unauthorizedDeleteRes.status).toBe(403);

    // 4. Only Super Admin can permanently delete the worker
    const deleteRes = await superAdminAgent.delete(`/api/v1/super-admin/staff/${newWorkerId}`);
    expect(deleteRes.status).toBe(200);

    // 5. Worker can no longer log in after permanent deletion
    const failedLoginRes = await workerAgent.post('/api/v1/auth/workspace/login').send({
      email: 'vikram.engineer@dracovion.com',
      password: 'WorkerSecure2026!',
    });
    expect(failedLoginRes.status).toBe(401);
  });

  it('Client Self-Service: Order deletion, account deactivation, and account erasure', async () => {
    const client1Agent = request.agent(app);
    const client2Agent = request.agent(app);

    // 1. Register Client 1
    const client1Email = `deletable_client_${Date.now()}@example.com`;
    const regRes1 = await client1Agent.post('/api/v1/auth/register').send({
      email: client1Email,
      password: 'ClientPassword2026!',
      fullName: 'Deletable Client',
      role: 'client',
      phone: '+91 99999 88888',
      city: 'Chennai',
    });
    expect(regRes1.status).toBe(201);

    // 2. Client 1 places an order
    const orderRes = await client1Agent.post('/api/v1/orders').send({
      serviceCategory: 'website_development',
      projectTitle: 'E-commerce Redesign To Be Deleted',
      description: 'Requirements that the client later decides to cancel and delete from the system.',
      estimatedBudget: '₹40,000',
      priority: 'normal',
      personalDetails: {
        fullName: 'Deletable Client',
        phone: '+91 99999 88888',
        city: 'Chennai',
      },
    });
    expect(orderRes.status).toBe(201);
    const orderId = orderRes.body.order._id;
    const orderNumber = orderRes.body.order.orderNumber;

    // 3. Register Client 2
    const client2Email = `other_client_${Date.now()}@example.com`;
    await client2Agent.post('/api/v1/auth/register').send({
      email: client2Email,
      password: 'ClientPassword2026!',
      fullName: 'Other Client',
      role: 'client',
    });

    // 4. Client 2 CANNOT delete Client 1's order (Security Check)
    const unauthorizedDeleteOrder = await client2Agent.delete(`/api/v1/orders/${orderId}`);
    expect(unauthorizedDeleteOrder.status).toBe(403);

    // 5. Client 1 successfully deletes their own order
    const deleteOrderRes = await client1Agent.delete(`/api/v1/orders/${orderNumber}`);
    expect(deleteOrderRes.status).toBe(200);
    expect(deleteOrderRes.body.success).toBe(true);

    // Verify order is no longer in Client 1's list
    const myOrdersRes = await client1Agent.get('/api/v1/orders/my');
    expect(myOrdersRes.status).toBe(200);
    expect(myOrdersRes.body.orders.some((o: any) => o._id === orderId)).toBe(false);

    // 6. Client 1 self-deactivates their account
    const deactivateRes = await client1Agent.post('/api/v1/auth/client/deactivate').send({
      reason: 'No longer required for this financial quarter',
      password: 'ClientPassword2026!',
    });
    expect(deactivateRes.status).toBe(200);
    expect(deactivateRes.body.success).toBe(true);

    // After deactivation, session is destroyed and /auth/me returns null
    const meAfterDeactivate = await client1Agent.get('/api/v1/auth/me');
    expect(meAfterDeactivate.body.user).toBeNull();

    // 7. Register Client 3 for permanent deletion test
    const client3Agent = request.agent(app);
    const client3Email = `purge_client_${Date.now()}@example.com`;
    await client3Agent.post('/api/v1/auth/register').send({
      email: client3Email,
      password: 'PurgePassword2026!',
      fullName: 'Purge Client',
      role: 'client',
    });

    // Client 3 permanently deletes their account
    const deleteAccountRes = await client3Agent.delete('/api/v1/auth/client/account').send({
      confirmation: 'DELETE',
    });
    expect(deleteAccountRes.status).toBe(200);
    expect(deleteAccountRes.body.success).toBe(true);

    // Login fails because account was wiped
    const postDeleteLogin = await client3Agent.post('/api/v1/auth/login').send({
      email: client3Email,
      password: 'PurgePassword2026!',
    });
    expect(postDeleteLogin.status).toBe(401);
  });
});


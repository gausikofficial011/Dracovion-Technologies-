import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes';
import enquiryRoutes from './enquiryRoutes';
import quotationRoutes from './quotationRoutes';
import projectRoutes from './projectRoutes';
import paymentRoutes from './paymentRoutes';
import invoiceRoutes from './invoiceRoutes';
import fileRoutes from './fileRoutes';
import messageRoutes from './messageRoutes';
import catalogRoutes from './catalogRoutes';
import adminRoutes from './adminRoutes';
import orderRoutes from './orderRoutes';
import superAdminRoutes from './superAdminRoutes';
import announcementRoutes from './announcementRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'healthy' : 'degraded',
    service: 'Dracovion Technologies Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: isConnected ? 'connected' : 'disconnected',
  });
});

// Mounted sub-routes under /api/v1
router.use('/auth', authRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/quotations', quotationRoutes);
router.use('/projects', projectRoutes);
router.use('/payments', paymentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/files', fileRoutes);
router.use('/messages', messageRoutes);
router.use('/catalog', catalogRoutes);
router.use('/admin', adminRoutes);
router.use('/orders', orderRoutes);
router.use('/super-admin', superAdminRoutes);
router.use('/announcements', announcementRoutes);

export default router;

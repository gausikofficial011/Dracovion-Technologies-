import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Message } from '../models/Message';
import { Project } from '../models/Project';
import { ProjectOrder } from '../models/ProjectOrder';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { createNotification } from '../services/notificationService';

/**
 * GET /api/v1/messages/channels
 * Returns available communication channels for the logged-in client:
 * 1. Always returns the 24/7 Dracovion Executive & Support Desk
 * 2. Returns any active projects the client is associated with
 * 3. Returns any active orders the client has placed
 */
export async function getClientChannels(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.user || (req.session as any)?.user;
    const userId = sessionUser.userId;

    const userFilter = mongoose.Types.ObjectId.isValid(userId)
      ? { $or: [{ clientId: userId }, { clientId: new mongoose.Types.ObjectId(userId) }] }
      : { clientId: userId };

    const [projects, orders, supportUnread] = await Promise.all([
      Project.find(userFilter)
        .select('_id title projectCode status progressPercent')
        .sort({ updatedAt: -1 })
        .lean(),
      ProjectOrder.find(userFilter)
        .select('_id projectTitle orderNumber status')
        .sort({ createdAt: -1 })
        .lean(),
      Message.countDocuments({
        clientId: userId,
        channelType: 'support',
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId },
      }),
    ]);

    res.json({
      success: true,
      channels: {
        support: {
          id: 'support',
          name: 'Dracovion Executive & Engineering Desk',
          description: 'Direct secure channel with Dracovion leadership, system architects, and senior engineers.',
          unreadCount: supportUnread,
        },
        projects: projects.map((p: any) => ({
          id: p._id.toString(),
          name: p.title,
          code: p.projectCode,
          status: p.status,
          progressPercent: p.progressPercent || 0,
        })),
        orders: orders.map((o: any) => ({
          id: o._id.toString(),
          name: o.projectTitle,
          code: o.orderNumber,
          status: o.status,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/messages/direct
 * Fetches all direct support messages between the client and Dracovion team
 */
export async function getClientDirectMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.user || (req.session as any)?.user;
    const clientId = sessionUser.userId;

    const idFilter = mongoose.Types.ObjectId.isValid(clientId)
      ? [clientId, new mongoose.Types.ObjectId(clientId)]
      : [clientId];

    const messages = await Message.find({
      $or: [
        { clientId: { $in: idFilter }, channelType: 'support' },
        { clientId: { $in: idFilter }, channelType: { $exists: false } },
        { senderId: { $in: idFilter }, projectId: { $exists: false }, orderId: { $exists: false } },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName email role avatarUrl designation')
      .lean();

    // Mark messages as read by this client
    await Message.updateMany(
      {
        clientId: { $in: idFilter },
        channelType: 'support',
        'readBy.userId': { $nin: idFilter },
      },
      {
        $addToSet: { readBy: { userId: clientId, readAt: new Date() } },
      }
    );

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/messages/direct
 * Sends a direct message from the client to the Dracovion team
 */
export async function sendClientDirectMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.user || (req.session as any)?.user;
    const clientId = sessionUser.userId;
    const { content } = z
      .object({ content: z.string().min(1, 'Message cannot be empty').trim() })
      .parse(req.body);

    const message = await Message.create({
      clientId,
      senderId: clientId,
      channelType: 'support',
      content,
      readBy: [{ userId: clientId, readAt: new Date() }],
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'fullName email role avatarUrl designation')
      .lean();

    // Notify admins / owner
    try {
      const staff = await User.find({ role: { $in: ['owner', 'admin', 'ceo', 'super_admin'] } }).select('_id');
      staff.forEach((s: any) => {
        createNotification({
          userId: s._id,
          title: `Direct Message from ${sessionUser.fullName}`,
          message: `${sessionUser.fullName}: ${content.slice(0, 60)}...`,
          link: `/admin/messages?client=${clientId}`,
          type: 'system',
        });
      });
    } catch (_) {}

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/messages/admin/conversations
 * Lists all active client conversation threads for administrators
 */
export async function getAdminConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = (req.user || (req.session as any)?.user)?.userId;

    // Distinct client IDs who have support messages
    const clientIdsWithMessages = await Message.distinct('clientId', { channelType: 'support' });

    // Find all users who are clients, students, or have messaged
    const clients = await User.find({
      $or: [
        { _id: { $in: clientIdsWithMessages } },
        { role: { $in: ['client', 'student', 'partner'] } },
      ],
    })
      .select('_id fullName email role avatarUrl companyName collegeOrUniversity phone createdAt')
      .lean();

    const conversations = await Promise.all(
      clients.map(async (client: any) => {
        const lastMessage = await Message.findOne({
          clientId: client._id,
          channelType: 'support',
        })
          .sort({ createdAt: -1 })
          .populate('senderId', 'fullName role')
          .lean();

        const messageCount = await Message.countDocuments({
          clientId: client._id,
          channelType: 'support',
        });

        const unreadCount = await Message.countDocuments({
          clientId: client._id,
          channelType: 'support',
          senderId: client._id,
          'readBy.userId': { $ne: adminId },
        });

        return {
          client,
          lastMessage,
          messageCount,
          unreadCount,
          updatedAt: lastMessage ? lastMessage.createdAt : client.createdAt,
        };
      })
    );

    // Sort by recent activity first
    conversations.sort(
      (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    res.json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/messages/admin/client/:clientId
 * Fetches thread messages for a specific client
 */
export async function getAdminClientMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = (req.user || (req.session as any)?.user)?.userId;
    const { clientId } = req.params;

    const idFilter = mongoose.Types.ObjectId.isValid(clientId)
      ? [clientId, new mongoose.Types.ObjectId(clientId)]
      : [clientId];

    const messages = await Message.find({
      $or: [
        { clientId: { $in: idFilter }, channelType: 'support' },
        { senderId: { $in: idFilter }, projectId: { $exists: false }, orderId: { $exists: false } },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName email role avatarUrl designation')
      .lean();

    // Mark as read by admin
    if (adminId) {
      await Message.updateMany(
        { clientId: { $in: idFilter }, channelType: 'support', 'readBy.userId': { $ne: adminId } },
        { $addToSet: { readBy: { userId: adminId, readAt: new Date() } } }
      );
    }

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/messages/admin/client/:clientId
 * Sends a message from the admin to the client
 */
export async function sendAdminDirectMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.user || (req.session as any)?.user;
    const { clientId } = req.params;
    const { content } = z
      .object({ content: z.string().min(1, 'Message cannot be empty').trim() })
      .parse(req.body);

    const client = await User.findById(clientId);
    if (!client) {
      throw new NotFoundError('Client account not found');
    }

    const message = await Message.create({
      clientId: client._id,
      senderId: sessionUser.userId as any,
      channelType: 'support',
      content,
      readBy: [{ userId: sessionUser.userId, readAt: new Date() }],
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'fullName email role avatarUrl designation')
      .lean();

    // Notify client
    try {
      createNotification({
        userId: client._id,
        title: 'New Response from Dracovion Executive Team',
        message: `${sessionUser.fullName}: ${content.slice(0, 60)}...`,
        link: '/portal/messages',
        type: 'system',
      });
    } catch (_) {}

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/messages/project/:projectId
 */
export async function getProjectMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.user || (req.session as any)?.user;
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isClient = project.clientId.toString() === sessionUser.userId;
    const isOwnerOrAdmin = ['owner', 'admin', 'ceo', 'super_admin'].includes(sessionUser.role);
    const isAssigned = project.assignedTeam.some(t => t.userId.toString() === sessionUser.userId);

    if (!isClient && !isOwnerOrAdmin && !isAssigned) {
      throw new ForbiddenError('Unauthorized to view messages for this project');
    }

    const messages = await Message.find({ projectId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName email role avatarUrl designation')
      .lean();

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/messages/project/:projectId
 */
export async function sendProjectMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.user || (req.session as any)?.user;
    const projectId = req.params.projectId;
    const { content } = z.object({ content: z.string().min(1, 'Message cannot be empty').trim() }).parse(req.body);

    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isClient = project.clientId.toString() === sessionUser.userId;
    const isOwnerOrAdmin = ['owner', 'admin', 'ceo', 'super_admin'].includes(sessionUser.role);
    const isAssigned = project.assignedTeam.some(t => t.userId.toString() === sessionUser.userId);

    if (!isClient && !isOwnerOrAdmin && !isAssigned) {
      throw new ForbiddenError('Unauthorized to send messages to this project');
    }

    const message = await Message.create({
      projectId: project._id,
      clientId: project.clientId,
      senderId: sessionUser.userId as any,
      channelType: 'project',
      content,
      readBy: [{ userId: sessionUser.userId, readAt: new Date() }],
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'fullName email role avatarUrl designation')
      .lean();

    if (isClient) {
      project.assignedTeam.forEach(t => {
        createNotification({
          userId: t.userId,
          title: `Client Message on ${project.title}`,
          message: `${sessionUser.fullName}: ${content.slice(0, 60)}...`,
          link: `/admin/projects/${project._id}`,
          type: 'project',
        });
      });
    } else {
      createNotification({
        userId: project.clientId,
        title: `Project Update on ${project.title}`,
        message: `${sessionUser.fullName}: ${content.slice(0, 60)}...`,
        link: `/portal/messages?project=${project._id}`,
        type: 'project',
      });
    }

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/messages/order/:orderId
 */
export async function getOrderMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.user || (req.session as any)?.user;
    const { orderId } = req.params;

    const order = await ProjectOrder.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderNumber: orderId }],
    });
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const isClient = order.clientId.toString() === sessionUser.userId;
    const isOwnerOrAdmin = ['owner', 'admin', 'ceo', 'super_admin'].includes(sessionUser.role);

    if (!isClient && !isOwnerOrAdmin) {
      throw new ForbiddenError('Unauthorized to view messages for this order');
    }

    const messages = await Message.find({ orderId: order._id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName email role avatarUrl designation')
      .lean();

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/messages/order/:orderId
 */
export async function sendOrderMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.user || (req.session as any)?.user;
    const { orderId } = req.params;
    const { content } = z.object({ content: z.string().min(1, 'Message cannot be empty').trim() }).parse(req.body);

    const order = await ProjectOrder.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderNumber: orderId }],
    });
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const isClient = order.clientId.toString() === sessionUser.userId;
    const isOwnerOrAdmin = ['owner', 'admin', 'ceo', 'super_admin'].includes(sessionUser.role);

    if (!isClient && !isOwnerOrAdmin) {
      throw new ForbiddenError('Unauthorized to send messages for this order');
    }

    const message = await Message.create({
      orderId: order._id,
      clientId: order.clientId,
      senderId: sessionUser.userId as any,
      channelType: 'order',
      content,
      readBy: [{ userId: sessionUser.userId, readAt: new Date() }],
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'fullName email role avatarUrl designation')
      .lean();

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    next(err);
  }
}

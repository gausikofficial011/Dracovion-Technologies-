import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Message } from '../models/Message';
import { FileRecord } from '../models/FileRecord';
import { Project } from '../models/Project';
import { ProjectOrder } from '../models/ProjectOrder';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { createNotification } from '../services/notificationService';
import { publishChatEvent, subscribeChatStream } from '../services/chatEventBus';

function getSessionUser(req: AuthenticatedRequest) {
  return req.user || (req.session as any)?.user;
}

function assertObjectId(id: string, label = 'identifier'): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid ${label}`);
  }
  return new mongoose.Types.ObjectId(id);
}

const sendMessageSchema = z.object({
  content: z.string().trim().max(5000, 'Message cannot exceed 5000 characters').optional().default(''),
  attachments: z.array(z.string()).max(5, 'At most 5 attachments allowed per message').optional().default([]),
});

async function parseAndValidateMessageBody(body: unknown): Promise<{
  content: string;
  attachmentIds: mongoose.Types.ObjectId[];
}> {
  const parsed = sendMessageSchema.parse(body);
  const attachmentIds = parsed.attachments.map((id) => assertObjectId(id, 'attachment identifier'));

  if (!parsed.content && attachmentIds.length === 0) {
    throw new BadRequestError('Message content or an attachment is required.');
  }

  if (attachmentIds.length > 0) {
    const existingCount = await FileRecord.countDocuments({ _id: { $in: attachmentIds } });
    if (existingCount !== attachmentIds.length) {
      throw new BadRequestError('One or more attached files could not be found.');
    }
  }

  return {
    content: parsed.content || 'Shared attachment',
    attachmentIds,
  };
}

async function fetchPopulatedMessage(messageId: mongoose.Types.ObjectId | string) {
  return Message.findById(messageId)
    .populate('senderId', 'fullName email role avatarUrl designation')
    .populate('attachments', 'fileKey originalName mimeType sizeBytes')
    .lean();
}

function supportThreadQuery(clientObjectIds: Array<string | mongoose.Types.ObjectId>) {
  return {
    $or: [
      { clientId: { $in: clientObjectIds }, channelType: 'support' },
      {
        clientId: { $in: clientObjectIds },
        channelType: { $exists: false },
        projectId: { $exists: false },
        orderId: { $exists: false },
      },
      { senderId: { $in: clientObjectIds }, projectId: { $exists: false }, orderId: { $exists: false } },
    ],
  };
}

/**
 * GET /api/v1/messages/stream
 * Real-time Server-Sent Events stream delivering new chat messages immediately.
 */
export function streamChatEvents(req: AuthenticatedRequest, res: Response): void {
  const sessionUser = getSessionUser(req);
  if (!sessionUser?.userId) {
    res.status(401).end();
    return;
  }

  const unsubscribe = subscribeChatStream(sessionUser.userId, sessionUser.role || 'client', res);
  req.on('close', unsubscribe);
}

/**
 * GET /api/v1/messages/channels
 * Returns available communication channels for the logged-in client.
 */
export async function getClientChannels(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = getSessionUser(req);
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
        $or: [
          { channelType: 'support' },
          { channelType: { $exists: false }, projectId: { $exists: false }, orderId: { $exists: false } },
        ],
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
 * Fetches all direct support messages between the client and Dracovion team.
 */
export async function getClientDirectMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = getSessionUser(req);
    const clientId = sessionUser.userId;

    const idFilter = mongoose.Types.ObjectId.isValid(clientId)
      ? [clientId, new mongoose.Types.ObjectId(clientId)]
      : [clientId];

    const messages = await Message.find(supportThreadQuery(idFilter))
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName email role avatarUrl designation')
      .populate('attachments', 'fileKey originalName mimeType sizeBytes')
      .lean();

    await Message.updateMany(
      {
        clientId: { $in: idFilter },
        $or: [
          { channelType: 'support' },
          { channelType: { $exists: false }, projectId: { $exists: false }, orderId: { $exists: false } },
        ],
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
 * Sends a direct message (plus optional shared files) from the client to Dracovion team.
 */
export async function sendClientDirectMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = getSessionUser(req);
    const clientId = sessionUser.userId;
    const { content, attachmentIds } = await parseAndValidateMessageBody(req.body);

    const message = await Message.create({
      clientId,
      senderId: clientId,
      channelType: 'support',
      content,
      attachments: attachmentIds,
      readBy: [{ userId: clientId, readAt: new Date() }],
    });

    const populated = await fetchPopulatedMessage(message._id);

    publishChatEvent({
      type: 'new_message',
      channelType: 'support',
      clientId: String(clientId),
      senderId: String(clientId),
      message: populated,
    });

    try {
      const staff = await User.find({ role: { $in: ['owner', 'admin', 'ceo', 'super_admin'] } }).select('_id');
      staff.forEach((s: any) => {
        createNotification({
          userId: s._id,
          title: `Direct Message from ${sessionUser.fullName}`,
          message: `${sessionUser.fullName}: ${content.slice(0, 60)}`,
          link: `/admin/messages?client=${clientId}`,
          type: 'system',
        });
      });
    } catch {
      // non-blocking notification dispatch
    }

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/messages/admin/conversations
 * Lists all active client conversation threads (direct + order/project summary) in 2 batched queries.
 */
export async function getAdminConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminIdRaw = getSessionUser(req)?.userId;
    const adminObjectId = mongoose.Types.ObjectId.isValid(adminIdRaw)
      ? new mongoose.Types.ObjectId(adminIdRaw)
      : null;

    const threadStats = await Message.aggregate([
      {
        $match: {
          clientId: { $ne: null },
        },
      },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$clientId',
          messageCount: { $sum: 1 },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$senderId', '$clientId'] },
                    adminObjectId
                      ? { $not: [{ $in: [adminObjectId, { $ifNull: ['$readBy.userId', []] }] }] }
                      : { $literal: true },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const statsByClientId = new Map<string, any>();
    const clientIdsWithMessages: mongoose.Types.ObjectId[] = [];
    const lastSenderIds: mongoose.Types.ObjectId[] = [];

    for (const row of threadStats) {
      const cid = row._id?.toString();
      if (!cid) continue;
      statsByClientId.set(cid, row);
      if (mongoose.Types.ObjectId.isValid(cid)) {
        clientIdsWithMessages.push(new mongoose.Types.ObjectId(cid));
      }
      const sid = row.lastMessage?.senderId;
      if (sid && mongoose.Types.ObjectId.isValid(sid)) {
        lastSenderIds.push(new mongoose.Types.ObjectId(sid));
      }
    }

    const [clients, senders] = await Promise.all([
      User.find({
        $or: [
          { _id: { $in: clientIdsWithMessages } },
          { role: { $in: ['client', 'student', 'partner'] } },
        ],
      })
        .select('_id fullName email role avatarUrl companyName collegeOrUniversity phone createdAt')
        .lean(),
      lastSenderIds.length > 0
        ? User.find({ _id: { $in: lastSenderIds } })
            .select('_id fullName role')
            .lean()
        : Promise.resolve([]),
    ]);

    const senderMap = new Map(senders.map((s: any) => [s._id.toString(), s]));

    const conversations = clients.map((client: any) => {
      const stats = statsByClientId.get(client._id.toString());
      const rawLast = stats?.lastMessage;
      const lastMessage = rawLast
        ? {
            ...rawLast,
            senderId: senderMap.get(rawLast.senderId?.toString()) || rawLast.senderId,
          }
        : null;

      return {
        client,
        lastMessage,
        messageCount: stats?.messageCount || 0,
        unreadCount: stats?.unreadCount || 0,
        updatedAt: lastMessage ? lastMessage.createdAt : client.createdAt,
      };
    });

    conversations.sort(
      (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    res.json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/messages/admin/client/:clientId/channels
 * Returns direct support channel + any order/project channels belonging to a client so admins see everything in one hub.
 */
export async function getAdminClientChannels(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const clientObjId = assertObjectId(req.params.clientId, 'client identifier');

    const [orders, projects] = await Promise.all([
      ProjectOrder.find({ clientId: clientObjId })
        .select('_id projectTitle orderNumber status updatedAt')
        .sort({ createdAt: -1 })
        .lean(),
      Project.find({ clientId: clientObjId })
        .select('_id title projectCode status updatedAt')
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    const orderIds = orders.map((o: any) => o._id);
    const projectIds = projects.map((p: any) => p._id);

    const [supportCount, orderCounts, projectCounts] = await Promise.all([
      Message.countDocuments(supportThreadQuery([clientObjId])),
      orderIds.length > 0
        ? Message.aggregate([
            { $match: { orderId: { $in: orderIds } } },
            { $group: { _id: '$orderId', count: { $sum: 1 } } },
          ])
        : Promise.resolve([]),
      projectIds.length > 0
        ? Message.aggregate([
            { $match: { projectId: { $in: projectIds } } },
            { $group: { _id: '$projectId', count: { $sum: 1 } } },
          ])
        : Promise.resolve([]),
    ]);

    const orderCountMap = new Map(orderCounts.map((c: any) => [String(c._id), c.count]));
    const projectCountMap = new Map(projectCounts.map((c: any) => [String(c._id), c.count]));

    res.json({
      success: true,
      channels: {
        support: {
          id: 'support',
          type: 'support',
          name: 'Direct Support Line',
          messageCount: supportCount,
        },
        orders: orders.map((o: any) => ({
          id: o._id.toString(),
          type: 'order',
          name: o.projectTitle,
          code: o.orderNumber,
          status: o.status,
          messageCount: orderCountMap.get(o._id.toString()) || 0,
        })),
        projects: projects.map((p: any) => ({
          id: p._id.toString(),
          type: 'project',
          name: p.title,
          code: p.projectCode,
          status: p.status,
          messageCount: projectCountMap.get(p._id.toString()) || 0,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/messages/admin/client/:clientId
 * Fetches direct support thread messages for a specific client.
 */
export async function getAdminClientMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = getSessionUser(req)?.userId;
    const { clientId } = req.params;
    const clientObjId = assertObjectId(clientId, 'client identifier');
    const idFilter = [clientId, clientObjId];

    const messages = await Message.find(supportThreadQuery(idFilter))
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName email role avatarUrl designation')
      .populate('attachments', 'fileKey originalName mimeType sizeBytes')
      .lean();

    if (adminId) {
      const adminObjId = mongoose.Types.ObjectId.isValid(adminId)
        ? new mongoose.Types.ObjectId(adminId)
        : adminId;
      await Message.updateMany(
        {
          clientId: { $in: idFilter },
          'readBy.userId': { $nin: [adminId, adminObjId] },
        },
        { $addToSet: { readBy: { userId: adminObjId, readAt: new Date() } } }
      );
    }

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/messages/admin/client/:clientId
 * Sends a direct message (plus optional shared files) from admin to client.
 */
export async function sendAdminDirectMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = getSessionUser(req);
    const { clientId } = req.params;
    const clientObjId = assertObjectId(clientId, 'client identifier');
    const { content, attachmentIds } = await parseAndValidateMessageBody(req.body);

    const client = await User.findById(clientObjId);
    if (!client) {
      throw new NotFoundError('Client account not found');
    }

    const message = await Message.create({
      clientId: client._id,
      senderId: sessionUser.userId as any,
      channelType: 'support',
      content,
      attachments: attachmentIds,
      readBy: [{ userId: sessionUser.userId, readAt: new Date() }],
    });

    const populated = await fetchPopulatedMessage(message._id);

    publishChatEvent({
      type: 'new_message',
      channelType: 'support',
      clientId: client._id.toString(),
      senderId: String(sessionUser.userId),
      message: populated,
    });

    try {
      createNotification({
        userId: client._id,
        title: 'New Response from Dracovion Executive Team',
        message: `${sessionUser.fullName}: ${content.slice(0, 60)}`,
        link: '/portal/messages',
        type: 'system',
      });
    } catch {
      // non-blocking
    }

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
    const sessionUser = getSessionUser(req);
    const projectObjId = assertObjectId(req.params.projectId, 'project identifier');

    const project = await Project.findById(projectObjId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isClient = project.clientId.toString() === String(sessionUser.userId);
    const isStaff = ['owner', 'admin', 'ceo', 'super_admin', 'employee'].includes(sessionUser.role);
    const isAssigned = project.assignedTeam.some(t => t.userId.toString() === String(sessionUser.userId));

    if (!isClient && !isStaff && !isAssigned) {
      throw new ForbiddenError('Unauthorized to view messages for this project');
    }

    const messages = await Message.find({ projectId: project._id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName email role avatarUrl designation')
      .populate('attachments', 'fileKey originalName mimeType sizeBytes')
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
    const sessionUser = getSessionUser(req);
    const projectObjId = assertObjectId(req.params.projectId, 'project identifier');
    const { content, attachmentIds } = await parseAndValidateMessageBody(req.body);

    const project = await Project.findById(projectObjId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isClient = project.clientId.toString() === String(sessionUser.userId);
    const isStaff = ['owner', 'admin', 'ceo', 'super_admin', 'employee'].includes(sessionUser.role);
    const isAssigned = project.assignedTeam.some(t => t.userId.toString() === String(sessionUser.userId));

    if (!isClient && !isStaff && !isAssigned) {
      throw new ForbiddenError('Unauthorized to send messages to this project');
    }

    const message = await Message.create({
      projectId: project._id,
      clientId: project.clientId,
      senderId: sessionUser.userId as any,
      channelType: 'project',
      content,
      attachments: attachmentIds,
      readBy: [{ userId: sessionUser.userId, readAt: new Date() }],
    });

    const populated = await fetchPopulatedMessage(message._id);

    publishChatEvent({
      type: 'new_message',
      channelType: 'project',
      projectId: project._id.toString(),
      clientId: project.clientId.toString(),
      senderId: String(sessionUser.userId),
      recipientUserIds: project.assignedTeam.map(t => t.userId.toString()),
      message: populated,
    });

    if (isClient) {
      project.assignedTeam.forEach(t => {
        createNotification({
          userId: t.userId,
          title: `Client Message on ${project.title}`,
          message: `${sessionUser.fullName}: ${content.slice(0, 60)}`,
          link: `/admin/projects/${project._id}`,
          type: 'project',
        });
      });
    } else {
      createNotification({
        userId: project.clientId,
        title: `Project Update on ${project.title}`,
        message: `${sessionUser.fullName}: ${content.slice(0, 60)}`,
        link: `/portal/messages?project=${project._id}`,
        type: 'project',
      });
    }

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    next(err);
  }
}

function canAccessOrder(order: any, sessionUser: any): boolean {
  const userId = String(sessionUser?.userId || '');
  const isClient = String(order.clientId) === userId;
  const isAssignedEmployee = Boolean(order.assignedEmployeeId && String(order.assignedEmployeeId) === userId);
  const isStaff = ['owner', 'admin', 'ceo', 'super_admin', 'employee'].includes(sessionUser?.role);
  return isClient || isAssignedEmployee || isStaff;
}

/**
 * GET /api/v1/messages/order/:orderId
 */
export async function getOrderMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = getSessionUser(req);
    const { orderId } = req.params;

    const orderQuery = orderId.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: orderId }, { orderNumber: orderId }] }
      : { orderNumber: orderId };
    const order = await ProjectOrder.findOne(orderQuery);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!canAccessOrder(order, sessionUser)) {
      throw new ForbiddenError('Unauthorized to view messages for this order');
    }

    const messages = await Message.find({ orderId: order._id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName email role avatarUrl designation')
      .populate('attachments', 'fileKey originalName mimeType sizeBytes')
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
    const sessionUser = getSessionUser(req);
    const { orderId } = req.params;
    const { content, attachmentIds } = await parseAndValidateMessageBody(req.body);

    const orderQuery = orderId.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: orderId }, { orderNumber: orderId }] }
      : { orderNumber: orderId };
    const order = await ProjectOrder.findOne(orderQuery);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!canAccessOrder(order, sessionUser)) {
      throw new ForbiddenError('Unauthorized to send messages for this order');
    }

    const message = await Message.create({
      orderId: order._id,
      clientId: order.clientId,
      senderId: sessionUser.userId as any,
      channelType: 'order',
      content,
      attachments: attachmentIds,
      readBy: [{ userId: sessionUser.userId, readAt: new Date() }],
    });

    const populated = await fetchPopulatedMessage(message._id);

    publishChatEvent({
      type: 'new_message',
      channelType: 'order',
      orderId: order._id.toString(),
      clientId: order.clientId.toString(),
      senderId: String(sessionUser.userId),
      recipientUserIds: order.assignedEmployeeId ? [order.assignedEmployeeId.toString()] : [],
      message: populated,
    });

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    next(err);
  }
}

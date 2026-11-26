import type { Response } from 'express';

export interface ChatBroadcastEvent {
  type: 'new_message';
  channelType: 'support' | 'order' | 'project';
  clientId?: string;
  orderId?: string;
  projectId?: string;
  senderId?: string;
  recipientUserIds?: string[];
  message: any;
}

interface ChatSubscriber {
  id: string;
  userId: string;
  role: string;
  res: Response;
}

const subscribers = new Map<string, ChatSubscriber>();
const ADMIN_STREAM_ROLES = new Set(['owner', 'admin', 'ceo', 'super_admin']);
const STAFF_STREAM_ROLES = new Set(['owner', 'admin', 'ceo', 'super_admin', 'employee']);

let subscriberSeq = 0;

/**
 * Registers an authenticated Server-Sent Events (SSE) listener for instant chat delivery.
 */
export function subscribeChatStream(userId: string, role: string, res: Response): () => void {
  const id = `sub_${++subscriberSeq}_${Date.now().toString(36)}`;
  subscribers.set(id, { id, userId: String(userId), role, res });

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  (res as any).flushHeaders?.();

  try {
    res.write(`event: ready\ndata: ${JSON.stringify({ connected: true, ts: Date.now() })}\n\n`);
  } catch {
    subscribers.delete(id);
    return () => {};
  }

  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat ${Date.now()}\n\n`);
    } catch {
      clearInterval(heartbeat);
      subscribers.delete(id);
    }
  }, 20000);

  return () => {
    clearInterval(heartbeat);
    subscribers.delete(id);
  };
}

/**
 * Publishes a newly persisted chat message immediately to relevant connected SSE subscribers.
 */
export function publishChatEvent(event: ChatBroadcastEvent): void {
  if (subscribers.size === 0) return;

  const payload = `event: message\ndata: ${JSON.stringify(event)}\n\n`;
  const targetUserIds = new Set<string>();
  if (event.clientId) targetUserIds.add(String(event.clientId));
  if (event.senderId) targetUserIds.add(String(event.senderId));
  for (const uid of event.recipientUserIds || []) {
    if (uid) targetUserIds.add(String(uid));
  }

  for (const [id, sub] of subscribers.entries()) {
    const isAdminViewer = event.channelType === 'support' && ADMIN_STREAM_ROLES.has(sub.role);
    const isStaffViewer = event.channelType !== 'support' && STAFF_STREAM_ROLES.has(sub.role);
    const isParticipant = targetUserIds.has(sub.userId);

    if (!isAdminViewer && !isStaffViewer && !isParticipant) continue;

    try {
      sub.res.write(payload);
    } catch {
      subscribers.delete(id);
    }
  }
}

export function getActiveChatSubscriberCount(): number {
  return subscribers.size;
}

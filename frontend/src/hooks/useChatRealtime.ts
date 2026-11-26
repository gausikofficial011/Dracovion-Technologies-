import { useEffect, useRef, useState } from 'react';
import { api, resolveApiUrl } from '../api/client';

export interface ChatAttachmentFile {
  _id: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ChatStreamPayload {
  type: 'new_message';
  channelType: 'support' | 'order' | 'project';
  clientId?: string;
  orderId?: string;
  projectId?: string;
  senderId?: string;
  message: any;
}

/**
 * Merges incoming chat messages chronologically without duplicates or losing confirmed history.
 */
export function mergeMessagesById(existing: any[], incoming: any[]): any[] {
  const byId = new Map<string, any>();
  for (const item of existing) {
    if (item?._id) byId.set(String(item._id), item);
  }
  for (const item of incoming) {
    if (item?._id) byId.set(String(item._id), item);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );
}

/**
 * Uploads a chat attachment cleanly through the backend /files/upload endpoint.
 */
export async function uploadChatAttachment(file: File, projectId?: string): Promise<ChatAttachmentFile> {
  const formData = new FormData();
  formData.append('file', file);
  if (projectId) {
    formData.append('projectId', projectId);
  }
  const res = await api.post<{ success: boolean; file: ChatAttachmentFile }>('/files/upload', formData);
  return res.file;
}

/**
 * Subscribes to real-time SSE chat delivery with automatic reconnection and live status tracking.
 */
export function useChatStream(enabled: boolean, onEvent: (payload: ChatStreamPayload) => void) {
  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') {
      setIsStreamConnected(false);
      return;
    }

    const streamUrl = resolveApiUrl('/messages/stream');
    const es = new EventSource(streamUrl, { withCredentials: true });

    const onReady = () => setIsStreamConnected(true);
    const onMessage = (evt: MessageEvent) => {
      try {
        const parsed = JSON.parse(evt.data);
        if (parsed?.type === 'new_message') {
          handlerRef.current(parsed as ChatStreamPayload);
        }
      } catch {
        // Ignore malformed frame
      }
    };
    const onError = () => {
      setIsStreamConnected(false);
    };

    es.addEventListener('ready', onReady);
    es.addEventListener('message', onMessage);
    es.onerror = onError;

    return () => {
      es.removeEventListener('ready', onReady);
      es.removeEventListener('message', onMessage);
      es.close();
      setIsStreamConnected(false);
    };
  }, [enabled]);

  return { isStreamConnected };
}

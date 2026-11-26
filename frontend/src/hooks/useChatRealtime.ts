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
 * Subscribes to real-time SSE chat delivery with automatic exponential-backoff reconnection
 * and live status tracking. Reconnects up to indefinitely on drop (Render free-tier timeouts,
 * network blips, etc.) so the chat never silently goes dark.
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

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1500; // ms, doubles on each failure up to 30 s
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      const streamUrl = resolveApiUrl('/messages/stream');
      es = new EventSource(streamUrl, { withCredentials: true });

      const onReady = () => {
        retryDelay = 1500; // reset backoff on successful connection
        setIsStreamConnected(true);
      };

      const onMessage = (evt: MessageEvent) => {
        try {
          const parsed = JSON.parse(evt.data);
          if (parsed?.type === 'new_message') {
            handlerRef.current(parsed as ChatStreamPayload);
          }
        } catch {
          // Ignore malformed SSE frame
        }
      };

      const onError = () => {
        setIsStreamConnected(false);
        es?.close();
        es = null;

        if (!destroyed) {
          reconnectTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 30000);
            connect();
          }, retryDelay);
        }
      };

      es.addEventListener('ready', onReady);
      es.addEventListener('message', onMessage);
      es.onerror = onError;
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
      setIsStreamConnected(false);
    };
  }, [enabled]);

  return { isStreamConnected };
}

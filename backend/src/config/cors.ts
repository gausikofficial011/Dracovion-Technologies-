import { env } from './env';

export function normalizeOrigin(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed;
  }
}

/**
 * Returns normalized origins permitted for browser CORS requests and OAuth redirects.
 * Localhost origins are excluded automatically in production builds.
 */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  const addOrigin = (raw: string) => {
    const normalized = normalizeOrigin(raw);
    if (!normalized) return;
    origins.add(normalized);

    try {
      const u = new URL(normalized);
      if (u.protocol === 'https:' && !u.hostname.startsWith('localhost')) {
        const labels = u.hostname.split('.');
        if (u.hostname.startsWith('www.') && labels.length >= 3) {
          origins.add(`https://${u.hostname.slice(4)}`);
        } else if (labels.length === 2) {
          origins.add(`https://www.${u.hostname}`);
        }
      }
    } catch {
      // Ignore malformed origin entries
    }
  };

  addOrigin(env.CLIENT_URL);

  if (env.CORS_ORIGINS) {
    for (const entry of env.CORS_ORIGINS.split(',')) {
      addOrigin(entry);
    }
  }

  if (env.NODE_ENV !== 'production') {
    for (const devOrigin of [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ]) {
      origins.add(devOrigin);
    }
  }

  return Array.from(origins);
}

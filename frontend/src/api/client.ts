export interface ApiErrorResponse {
  success: false;
  requestId?: string;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

/**
 * Resolves a backend API endpoint or legacy `/api/v1/...` relative path against
 * `API_BASE_URL` so browser redirects (OAuth) and file downloads work across
 * separated frontend/backend production domains as well as local dev proxy.
 */
export function resolveApiUrl(path: string): string {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const cleaned = path.startsWith('/api/v1') ? path.slice('/api/v1'.length) : path;
  const normalizedPath = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

class ApiClient {
  // In production, VITE_API_BASE_URL points to the deployed backend (e.g. https://api.dracovion.com/api/v1)
  // In development, Vite's dev server proxy forwards /api → localhost:5000 automatically
  private baseUrl = API_BASE_URL;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers || {});

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Sends HTTP-only session cookie automatically
      });
    } catch {
      const networkError: any = new Error(
        'Unable to reach the Dracovion API server. If the backend was idle, wait ~30 seconds and try again.'
      );
      networkError.status = 0;
      throw networkError;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (
        response.status === 401 &&
        typeof window !== 'undefined' &&
        (!endpoint.startsWith('/auth/') || endpoint === '/auth/profile')
      ) {
        window.dispatchEvent(new CustomEvent('dracovion:session-expired'));
      }
      const message = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
      const error: any = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    });
  }
}

export const api = new ApiClient();

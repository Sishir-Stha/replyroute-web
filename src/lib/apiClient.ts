import { clearStoredAuth, getStoredToken } from '@/lib/authStorage';

type ApiEnvelope<T> = {
  status?: number;
  message?: string;
  data?: T;
};

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuth?: boolean;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api').replace(/\/$/, '');

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;
  window.location.assign('/login');
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function unwrapResponse<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!isFormData && options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options.skipAuth) {
    const token = getStoredToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: options.body === undefined || isFormData ? options.body as BodyInit | null | undefined : JSON.stringify(options.body),
  });

  const payload = await parseResponse(response);

  if (response.status === 401) {
    clearStoredAuth();
    redirectToLogin();
    throw new ApiError(401, 'Your session expired. Please log in again.', payload);
  }

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'message' in payload
      ? String((payload as ApiEnvelope<unknown>).message)
      : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  return unwrapResponse<T>(payload);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

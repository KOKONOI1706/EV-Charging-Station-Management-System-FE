import { AuthService } from "../services/authService";

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiFetchOptions extends RequestInit {
  // reuse RequestInit
}

export async function apiFetch(input: string, init?: ApiFetchOptions) {
  // allow passing full URL or path
  const url = input && (input.startsWith('http://') || input.startsWith('https://'))
    ? input
    : `${API_BASE_URL}${input && input.startsWith('/') ? input : input ? `/${input}` : ''}`;

  const token = AuthService.getAuthToken();

  const headers = new Headers(init?.headers as HeadersInit || {});

  // If body is not FormData, default to JSON
  if (!(init && init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: init?.credentials ?? 'same-origin',
  });

  // Handle unauthorized globally
  if (res.status === 401) {
    try {
      await AuthService.logout();
    } catch (_) {}
    // Redirect to auth page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
    throw new Error('Unauthorized');
  }

  let parsed: any = null;
  try {
    parsed = await res.json();
  } catch (e) {
    // Non-JSON response
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return null;
  }

  if (!res.ok) {
    throw new Error(parsed?.error || parsed?.message || `Request failed with status ${res.status}`);
  }

  return parsed;
}

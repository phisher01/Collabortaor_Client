/** API base URL: from env, or production server when not on localhost */
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://collabortaor-server.onrender.com'
    : 'http://localhost:3000');

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const { params, ...fetchOptions } = options;
  const url = params
    ? `${API_URL}${path}?${new URLSearchParams(params).toString()}`
    : `${API_URL}${path}`;
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(url, { ...fetchOptions, headers });
    const text = await res.text();
    let data: T | undefined;
    try {
      data = text ? (JSON.parse(text) as T) : undefined;
    } catch {
      // no json body
    }
    if (!res.ok) {
      const errMsg = data && typeof data === 'object' && 'error' in data ? (data as { error: string }).error : res.statusText;
      return { error: errMsg, status: res.status };
    }
    return { data, status: res.status };
  } catch (e) {
    return { error: (e as Error).message, status: 0 };
  }
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface TaskUser {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdBy: TaskUser | null;
  assignedTo: TaskUser | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

/** User list item for assign dropdown */
export interface UserOption {
  id: string;
  name: string;
  email: string;
}

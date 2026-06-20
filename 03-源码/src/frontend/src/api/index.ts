/** API 封装层 - 所有后端请求走这里 */

const BASE = import.meta.env.VITE_API_BASE_URL || '';

function extractData<T>(json: unknown): T {
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return extractData<T>(json);
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return extractData<T>(json);
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return extractData<T>(json);
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return extractData<T>(json);
}

async function deleteReq<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return extractData<T>(json);
}

export const API = {
  dashboard: {
    get: () => get<any>('/dashboard'),
  },
  agents: {
    getAll: () => get<any[]>('/agents'),
  },
  departments: {
    getAll: () => get<any[]>('/departments'),
  },
  projects: {
    getAll: () => get<any[]>('/projects'),
    getById: (id: string) => get<any>(`/projects/${id}`),
    create: (body: unknown) => post<any>('/projects', body),
  },
  tasks: {
    getAll: () => get<any[]>('/tasks'),
    create: (body: unknown) => post<any>('/tasks', body),
    update: (id: string, body: unknown) => put<any>(`/tasks/${id}`, body),
    updateStatus: (id: string, status: string) => patch<any>(`/tasks/${id}`, { status }),
    delete: (id: string) => deleteReq<any>(`/tasks/${id}`),
  },
  todos: {
    getAll: () => get<any[]>('/todos'),
    create: (body: unknown) => post<any>('/todos', body),
    update: (id: string, body: unknown) => put<any>(`/todos/${id}`, body),
    toggle: (id: string, completed: boolean) => patch<any>(`/todos/${id}`, { completed: completed ? 1 : 0 }),
    delete: (id: string) => deleteReq<any>(`/todos/${id}`),
  },
  documents: {
    getAll: () => get<any[]>('/documents'),
    create: (body: unknown) => post<any>('/documents', body),
  },
  activities: {
    getAll: () => get<any[]>('/activities'),
  },
};

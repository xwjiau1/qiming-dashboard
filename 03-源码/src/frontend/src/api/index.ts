/** API 封装层 - 所有后端请求走这里 */

const BASE = import.meta.env.VITE_API_BASE_URL || '';

// 提取标准响应中的 data 字段（后端统一返回 { success, data } 格式）
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
    updateStatus: (id: string, status: string) => patch<any>(`/tasks/${id}`, { status }),
  },
  documents: {
    getAll: () => get<any[]>('/documents'),
    create: (body: unknown) => post<any>('/documents', body),
  },
  activities: {
    getAll: () => get<any[]>('/activities'),
  },
};

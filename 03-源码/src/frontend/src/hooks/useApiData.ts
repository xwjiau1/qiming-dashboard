import { useState, useEffect } from 'react';
import { API } from '@/api';
import type { Department, Project, Task, Document, Activity } from '@/data';

// 定义 Dashboard 聚合数据类型
export interface DashboardData {
  kpi: {
    totalProjects: number;
    inProgress: number;
    completed: number;
    pending: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
  };
  departments: Department[];
  projects: Project[];
  tasks: Task[];
  activities: Activity[];
}

// 统一的 loading + error + data 状态管理
function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetcher()
      .then((res) => { if (mounted) { setData(res); setError(null); } })
      .catch((err) => { if (mounted) { setError(err.message || '加载失败'); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, deps);

  return { data, loading, error };
}

export function useDashboard() {
  return useApi<DashboardData>(API.dashboard.get, []);
}

export function useDepartments() {
  return useApi<Department[]>(API.departments.getAll, []);
}

export function useProjects() {
  return useApi<Project[]>(API.projects.getAll, []);
}

export function useTasks() {
  return useApi<Task[]>(API.tasks.getAll, []);
}

export function useDocuments() {
  return useApi<Document[]>(API.documents.getAll, []);
}

export function useActivities() {
  return useApi<Activity[]>(API.activities.getAll, []);
}

export function useAgents() {
  return useApi<{ id: string; name: string; role: string; avatar: string; department: string; departmentColor: string }[]>(API.agents.getAll, []);
}

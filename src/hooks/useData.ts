import { useState, useEffect, useCallback } from 'react';
import {
  getDepartments, getAgents, getProjects, getTasks, getDocuments, getActivities, getDashboardStats,
} from '@/hooks/useSupabase';
import type {
  DbDepartment, DbAgent, DbProject, DbTask, DbDocument, DbActivity, DbDashboardStats,
} from '@/types/supabase';
import { isSupabaseConfigured } from '@/lib/supabase';

// 静态数据作为离线备用
import {
  departments as staticDepartments,
  irrAgent as staticIrrAgent,
  meryAgent as staticMeryAgent,
  projects as staticProjects,
  tasks as staticTasks,
  documents as staticDocuments,
  activities as staticActivities,
  kpiData as staticKpiData,
} from '@/data';

// 将静态数据转换为符合 Db 类型的格式
const staticAgents = [staticIrrAgent, staticMeryAgent];

export interface AppData {
  departments: DbDepartment[];
  agents: DbAgent[];
  projects: DbProject[];
  tasks: DbTask[];
  documents: DbDocument[];
  activities: DbActivity[];
  stats: DbDashboardStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useData(): AppData {
  const [departments, setDepartments] = useState<DbDepartment[]>(staticDepartments as unknown as DbDepartment[]);
  const [agents, setAgents] = useState<DbAgent[]>(staticAgents as unknown as DbAgent[]);
  const [projects, setProjects] = useState<DbProject[]>(staticProjects as unknown as DbProject[]);
  const [tasks, setTasks] = useState<DbTask[]>(staticTasks as unknown as DbTask[]);
  const [documents, setDocuments] = useState<DbDocument[]>(staticDocuments as unknown as DbDocument[]);
  const [activities, setActivities] = useState<DbActivity[]>(staticActivities as unknown as DbActivity[]);
  const [stats, setStats] = useState<DbDashboardStats | null>(staticKpiData as unknown as DbDashboardStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        deptData,
        agentData,
        projectData,
        taskData,
        docData,
        activityData,
        statsData,
      ] = await Promise.all([
        getDepartments(),
        getAgents(),
        getProjects(),
        getTasks(),
        getDocuments(),
        getActivities(20),
        getDashboardStats(),
      ]);

      if (deptData.length) setDepartments(deptData);
      if (agentData.length) setAgents(agentData);
      if (projectData.length) setProjects(projectData);
      if (taskData.length) setTasks(taskData);
      if (docData.length) setDocuments(docData);
      if (activityData.length) setActivities(activityData);
      if (statsData) setStats(statsData);
    } catch (err: any) {
      console.error('数据加载失败:', err);
      setError(err?.message || '数据加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    departments,
    agents,
    projects,
    tasks,
    documents,
    activities,
    stats,
    loading,
    error,
    refresh: loadData,
  };
}

// 简化版：仅加载指定数据（占位，未使用）
export function useDataPartial(_keys: ('departments' | 'agents' | 'projects' | 'tasks' | 'documents' | 'activities' | 'stats')[]) {
  const fullData = useData();
  return {
    ...fullData,
    loading: fullData.loading,
  };
}

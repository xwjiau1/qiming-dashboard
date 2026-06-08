import { useState, useEffect, useCallback } from 'react'
import {
  getDepartments, getAgents, getProjects, getTasks, getDocuments, getActivities, getDashboardStats,
} from '@/hooks/useSupabase'
import { isSupabaseConfigured } from '@/lib/supabase'

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
} from '@/data/static-data'

// 静态智能体列表
const staticAgents = [staticIrrAgent, staticMeryAgent]

export interface AppData {
  departments: any[]
  agents: any[]
  projects: any[]
  tasks: any[]
  documents: any[]
  activities: any[]
  stats: any
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useData(): AppData {
  const [departments, setDepartments] = useState<any[]>(staticDepartments)
  const [agents, setAgents] = useState<any[]>(staticAgents)
  const [projects, setProjects] = useState<any[]>(staticProjects)
  const [tasks, setTasks] = useState<any[]>(staticTasks)
  const [documents, setDocuments] = useState<any[]>(staticDocuments)
  const [activities, setActivities] = useState<any[]>(staticActivities)
  const [stats, setStats] = useState<any>(staticKpiData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

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
      ])

      if (deptData.length) setDepartments(deptData)
      if (agentData.length) setAgents(agentData)
      if (projectData.length) setProjects(projectData)
      if (taskData.length) setTasks(taskData)
      if (docData.length) setDocuments(docData)
      if (activityData.length) setActivities(activityData)
      if (statsData) setStats(statsData)
    } catch (err: any) {
      console.error('数据加载失败:', err)
      setError(err?.message || '数据加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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
  }
}

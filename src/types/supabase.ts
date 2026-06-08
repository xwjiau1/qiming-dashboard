export type ColorTheme = 'blue' | 'gold'
export type AgentStatus = 'online' | 'offline' | 'busy'
export type ProjectStatus = 'in_progress' | 'completed' | 'planning' | 'paused'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed'
export type DocumentType = 'technical' | 'design' | 'product' | 'meeting' | 'architecture'
export type DocumentStatus = 'latest' | 'update_needed' | 'draft'
export type UserRole = 'founder' | 'ceo' | 'cto' | 'cio' | 'member'
export type CycleStatus = 'pending' | 'in_progress' | 'completed'

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string
          name: string
          short_name: string
          color: ColorTheme
          color_hex: string
          description: string
          member_count: number
          head_id: string | null
          projects: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['departments']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['departments']['Insert']>
      }
      agents: {
        Row: {
          id: string
          name: string
          title: string
          department_id: string
          role: string
          avatar: string
          color_theme: ColorTheme
          badge: string
          story: { summary: string; full: string }
          abilities: string[]
          status: AgentStatus
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['agents']['Insert']>
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string
          involved_departments: string[]
          status: ProjectStatus
          progress: number
          lead_id: string
          deadline: string
          start_date: string
          task_count: number
          completed_tasks: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      project_cycles: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string
          start_date: string
          end_date: string
          status: CycleStatus
          color: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['project_cycles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['project_cycles']['Insert']>
      }
      workflow_nodes: {
        Row: {
          id: string
          project_id: string
          agent_id: string
          agent_name: string
          agent_avatar: string
          agent_role: string
          department: string
          department_color: ColorTheme
          order_num: number
          responsibility: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['workflow_nodes']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['workflow_nodes']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          title: string
          priority: TaskPriority
          status: TaskStatus
          project_id: string
          project_name: string
          department_id: string
          department_color: ColorTheme
          type: string
          assignee_id: string
          assignee_name: string
          assignee_avatar: string
          assignee_role: string
          due_date: string
          completed_at: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      documents: {
        Row: {
          id: string
          name: string
          type: DocumentType
          department_id: string
          department_color: ColorTheme
          updated_by: string
          updated_by_avatar: string
          updated_at: string
          status: DocumentStatus
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      activities: {
        Row: {
          id: string
          user_id: string
          user_name: string
          user_avatar: string
          action: string
          target: string
          target_type: string
          created_at: string
          color: ColorTheme
        }
        Insert: Omit<Database['public']['Tables']['activities']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['activities']['Insert']>
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar: string
          role: UserRole
          department_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
    }
  }
}

// 类型别名
export type DbDepartment = Database['public']['Tables']['departments']['Row']
export type DbAgent = Database['public']['Tables']['agents']['Row']
export type DbProject = Database['public']['Tables']['projects']['Row']
export type DbProjectCycle = Database['public']['Tables']['project_cycles']['Row']
export type DbWorkflowNode = Database['public']['Tables']['workflow_nodes']['Row']
export type DbTask = Database['public']['Tables']['tasks']['Row']
export type DbDocument = Database['public']['Tables']['documents']['Row']
export type DbActivity = Database['public']['Tables']['activities']['Row']
export type DbUser = Database['public']['Tables']['users']['Row']
export type DbSetting = Database['public']['Tables']['settings']['Row']

export type DbDashboardStats = {
  totalProjects: number
  inProgress: number
  completed: number
  pending: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
}


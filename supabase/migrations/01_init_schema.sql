-- ==========================================
-- 启明科技管理平台 v1.0 — Supabase 数据库迁移脚本
-- 执行环境：Supabase PostgreSQL (v15+)
-- 一次性执行：在 Supabase Dashboard → SQL Editor 中粘贴执行
-- 注意：必须先创建 Supabase 项目（已创建）
-- ==========================================

-- 启用必要扩展
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. 创建自定义类型（ENUM）
-- ==========================================

DO $$ BEGIN
  CREATE TYPE public.color_theme AS ENUM ('blue', 'gold');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.agent_status AS ENUM ('online', 'offline', 'busy');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM ('in-progress', 'completed', 'planning', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.task_priority AS ENUM ('high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM ('todo', 'in-progress', 'review', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.document_type AS ENUM ('technical', 'design', 'product', 'meeting', 'architecture');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.document_status AS ENUM ('latest', 'update-needed', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('founder', 'ceo', 'cto', 'cio', 'member');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.cycle_status AS ENUM ('completed', 'in-progress', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================
-- 2. 创建表结构
-- ==========================================

-- 2.1 部门表
CREATE TABLE IF NOT EXISTS public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  color public.color_theme NOT NULL DEFAULT 'blue',
  color_hex TEXT NOT NULL DEFAULT '#0A84FF',
  description TEXT NOT NULL DEFAULT '',
  member_count INTEGER NOT NULL DEFAULT 0,
  head_agent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 智能体表
CREATE TABLE IF NOT EXISTS public.agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  department_id TEXT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  avatar TEXT,
  color_theme public.color_theme NOT NULL DEFAULT 'blue',
  badge TEXT NOT NULL,
  story JSONB NOT NULL DEFAULT '{"summary": "", "full": ""}'::jsonb,
  abilities TEXT[] NOT NULL DEFAULT '{}',
  status public.agent_status NOT NULL DEFAULT 'offline',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 用户表（Supabase Auth 扩展）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'member',
  avatar TEXT,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 项目表
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  involved_departments TEXT[] NOT NULL DEFAULT '{}',
  status public.project_status NOT NULL DEFAULT 'planning',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  lead TEXT NOT NULL,
  lead_avatar TEXT,
  lead_role TEXT NOT NULL,
  deadline TEXT,
  start_date TEXT,
  task_count INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 项目周期/里程碑表
CREATE TABLE IF NOT EXISTS public.project_cycles (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date TEXT,
  end_date TEXT,
  status public.cycle_status NOT NULL DEFAULT 'pending',
  color TEXT NOT NULL DEFAULT '#0A84FF',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 协作流程节点表
CREATE TABLE IF NOT EXISTS public.workflow_nodes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  agent_avatar TEXT,
  agent_role TEXT NOT NULL,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  department_color public.color_theme NOT NULL DEFAULT 'blue',
  display_order INTEGER NOT NULL DEFAULT 1,
  responsibility TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 任务表
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  priority public.task_priority NOT NULL DEFAULT 'medium',
  status public.task_status NOT NULL DEFAULT 'todo',
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  department_color public.color_theme NOT NULL DEFAULT 'blue',
  type TEXT NOT NULL DEFAULT '开发',
  assignee_id TEXT REFERENCES public.agents(id) ON DELETE SET NULL,
  assignee_name TEXT NOT NULL,
  assignee_avatar TEXT,
  assignee_role TEXT NOT NULL,
  due_date TEXT,
  completed_at TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.8 文档表
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type public.document_type NOT NULL DEFAULT 'technical',
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  department_color public.color_theme NOT NULL DEFAULT 'blue',
  updated_by TEXT NOT NULL,
  updated_by_avatar TEXT,
  updated_at TEXT NOT NULL,
  updated_at_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status public.document_status NOT NULL DEFAULT 'latest',
  file_path TEXT,
  file_size INTEGER,
  file_mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at_backend TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.9 动态/活动表
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.agents(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'document',
  target_id TEXT,
  color public.color_theme NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 系统配置表
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. 创建索引
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_color ON public.departments(color);
CREATE INDEX IF NOT EXISTS idx_agents_department ON public.agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_lead ON public.projects(lead);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cycles_project ON public.project_cycles(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_project ON public.workflow_nodes(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- 全文搜索索引（可选）
CREATE INDEX IF NOT EXISTS idx_documents_name ON public.documents USING gin(to_tsvector('simple', name));

-- ==========================================
-- 4. 创建触发器函数
-- ==========================================

-- 4.1 通用 updated_at 自动更新
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 项目任务计数自动更新
CREATE OR REPLACE FUNCTION public.update_project_task_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects 
    SET task_count = task_count + 1,
        completed_tasks = completed_tasks + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        updated_at_timestamp = NOW()
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      UPDATE public.projects 
      SET completed_tasks = completed_tasks 
          + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END
          - CASE WHEN OLD.status = 'completed' THEN 1 ELSE 0 END,
          updated_at_timestamp = NOW()
      WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    END IF;
    IF OLD.project_id IS DISTINCT FROM NEW.project_id THEN
      UPDATE public.projects SET task_count = task_count - 1 WHERE id = OLD.project_id;
      UPDATE public.projects 
      SET task_count = task_count + 1,
          completed_tasks = completed_tasks + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END
      WHERE id = NEW.project_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects 
    SET task_count = task_count - 1,
        completed_tasks = completed_tasks - CASE WHEN OLD.status = 'completed' THEN 1 ELSE 0 END,
        updated_at_timestamp = NOW()
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4.3 项目进度自动更新
CREATE OR REPLACE FUNCTION public.update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET progress = CASE 
    WHEN task_count > 0 THEN (completed_tasks * 100 / task_count)
    ELSE 0
  END,
  updated_at_timestamp = NOW()
  WHERE id = COALESCE(NEW.id, OLD.id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4.4 活动自动记录
CREATE OR REPLACE FUNCTION public.log_task_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := '创建了任务';
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'completed' THEN
      v_action := '完成了';
    ELSE
      v_action := '更新了';
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  
  INSERT INTO public.activities (user_id, user_name, user_avatar, action, target, target_type, target_id, color)
  VALUES (
    NEW.assignee_id,
    NEW.assignee_name,
    NEW.assignee_avatar,
    v_action,
    NEW.title,
    'task',
    NEW.id,
    NEW.department_color
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.5 用户创建自动同步
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::public.user_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 5. 绑定触发器
-- ==========================================

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.departments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.project_cycles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workflow_nodes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_project_task_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_project_task_counts();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_project_progress_trigger
    AFTER UPDATE OF task_count, completed_tasks ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_project_progress();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER log_task_activity_trigger
    AFTER INSERT OR UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.log_task_activity();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================
-- 6. 创建仪表盘统计视图
-- ==========================================

CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.projects) AS total_projects,
  (SELECT COUNT(*) FROM public.projects WHERE status = 'in-progress') AS in_progress_projects,
  (SELECT COUNT(*) FROM public.projects WHERE status = 'completed') AS completed_projects,
  (SELECT COUNT(*) FROM public.projects WHERE status = 'planning') AS pending_projects,
  (SELECT COUNT(*) FROM public.tasks) AS total_tasks,
  (SELECT COUNT(*) FROM public.tasks WHERE status = 'completed') AS completed_tasks,
  (SELECT COUNT(*) FROM public.tasks WHERE status = 'in-progress') AS in_progress_tasks,
  (SELECT COUNT(*) FROM public.tasks WHERE status = 'todo') AS pending_tasks,
  (SELECT COUNT(*) FROM public.agents WHERE status = 'online') AS online_agents,
  (SELECT COUNT(*) FROM public.documents WHERE status = 'latest') AS latest_documents;

-- ==========================================
-- 7. 初始化基础数据
-- ==========================================

-- 7.1 初始化部门
INSERT INTO public.departments (id, name, short_name, color, color_hex, description, member_count)
VALUES
  ('tech', '技术部', '技术', 'blue', '#0A84FF', '负责公司技术架构、产品开发、系统维护、AI工程', 2),
  ('design', '设计部', '设计', 'gold', '#FFD700', '负责产品UI/UX设计、品牌设计、用户体验研究', 2),
  ('management', '管理层', '管理', 'blue', '#0A84FF', '公司战略决策、部门协调、项目统筹', 2)
ON CONFLICT (id) DO NOTHING;

-- 7.2 初始化智能体
INSERT INTO public.agents (id, name, title, department_id, role, badge, story, abilities, color_theme)
VALUES
  ('irra', 'Irra', '首席技术官 · 技术部负责人', 'tech', 'CTO', 'CTO',
   '{"summary": "技术部主理人，极致细节控", "full": "Irra 是启明科技的技术架构师，负责所有技术决策、代码审查和系统架构设计。"}'::jsonb,
   ARRAY['系统架构', '全栈开发', '代码审查', 'AI 工程', 'DevOps'],
   'blue'),
  ('mery', 'Mery', '首席设计官 · 设计部负责人', 'design', 'CIO', 'CIO',
   '{"summary": "设计部主理人，市场敏感型", "full": "Mery 是启明科技的设计领袖，负责产品视觉、用户体验和品牌设计。"}'::jsonb,
   ARRAY['UI/UX 设计', '品牌设计', '用户研究', '数据可视化', 'Figma'],
   'gold'),
  ('wenner', 'Wenner', '首席执行官 · 公司战略', 'management', 'CEO', 'CEO',
   '{"summary": "CEO，战略决策与质量把控", "full": "Wenner 是启明科技的 CEO，负责公司战略、部门协调和质量把控。"}'::jsonb,
   ARRAY['战略决策', '项目管理', '质量把控', '团队协调', '投资人沟通'],
   'blue'),
  ('jiawen', 'JiaWen', '创始人 · AI 交付工程师', 'management', '创始人', '创始人',
   '{"summary": "启明科技创始人，AI 交付专家", "full": "JiaWen 是启明科技的创始人，负责 AI 产品交付、技术选型和创业战略。"}'::jsonb,
   ARRAY['AI 产品交付', '技术选型', '创业战略', '投资人关系', '团队建设'],
   'blue')
ON CONFLICT (id) DO NOTHING;

-- 更新部门负责人
UPDATE public.departments SET head_agent_id = 'irra' WHERE id = 'tech';
UPDATE public.departments SET head_agent_id = 'mery' WHERE id = 'design';
UPDATE public.departments SET head_agent_id = 'wenner' WHERE id = 'management';

-- 7.3 初始化项目
INSERT INTO public.projects (id, name, description, involved_departments, status, progress, lead, lead_role, deadline, start_date, task_count, completed_tasks)
VALUES
  ('p1', '公司管理平台 v1.0', '启明科技内部一站式管理驾驶舱，涵盖项目监控、任务追踪、文档管理、团队协作', 
   ARRAY['技术部', '设计部', '管理'], 'in-progress', 65,
   'Wenner', 'CEO', '6月30日', '6月1日', 12, 8),
  ('p2', '品牌视觉系统', '设计部主导的启明科技品牌视觉系统，包括 Logo、配色、排版、组件库', 
   ARRAY['设计部', '技术部'], 'in-progress', 40,
   'Mery', 'CIO', '6月20日', '6月1日', 8, 3),
  ('p3', 'AI 产品化引擎', '技术部研发的 AI 产品化引擎，支持多模型接入、RAG 增强、智能体编排', 
   ARRAY['技术部'], 'in-progress', 55,
   'Irra', 'CTO', '7月15日', '5月15日', 15, 8),
  ('p4', '技术部标准规范', '技术部代码规范、部署标准、文档模板、Skill 封装标准', 
   ARRAY['技术部'], 'in-progress', 80,
   'Irra', 'CTO', '6月10日', '5月1日', 6, 5),
  ('p5', '竞品分析报告', '设计部主导的市场竞品分析，涵盖功能对比、用户体验、定价策略', 
   ARRAY['设计部', '管理'], 'planning', 0,
   'Mery', 'CIO', '7月1日', '6月15日', 0, 0)
ON CONFLICT (id) DO NOTHING;

-- 7.4 初始化项目周期
INSERT INTO public.project_cycles (id, project_id, name, description, start_date, end_date, status, color, display_order)
VALUES
  ('c1-1', 'p1', '需求分析', '完成 PRD 和需求文档', '6/1', '6/5', 'completed', '#30D158', 1),
  ('c1-2', 'p1', '架构设计', '数据库设计、API 规范、技术选型', '6/5', '6/8', 'completed', '#30D158', 2),
  ('c1-3', 'p1', '核心开发', '前端界面、Supabase 集成、后端逻辑', '6/8', '6/15', 'in-progress', '#0A84FF', 3),
  ('c1-4', 'p1', '测试部署', '构建测试、Cloudflare Pages 部署、域名绑定', '6/15', '6/20', 'pending', '#FF9F0A', 4),
  ('c1-5', 'p1', '上线迭代', '持续迭代、监控、优化', '6/20', '6/30', 'pending', '#FF9F0A', 5),
  ('c2-1', 'p2', '品牌调研', '竞品品牌调研、行业分析', '6/1', '6/5', 'completed', '#30D158', 1),
  ('c2-2', 'p2', '视觉设计', 'Logo、配色、排版系统', '6/5', '6/15', 'in-progress', '#0A84FF', 2),
  ('c3-1', 'p3', '引擎架构', '多模型接入架构、RAG 管道设计', '5/15', '5/25', 'completed', '#30D158', 1),
  ('c3-2', 'p3', '核心开发', '智能体编排、API 封装、测试框架', '5/25', '6/30', 'in-progress', '#0A84FF', 2)
ON CONFLICT (id) DO NOTHING;

-- 7.5 初始化流程节点
INSERT INTO public.workflow_nodes (id, project_id, agent_id, agent_name, agent_role, department_id, department_color, display_order, responsibility)
VALUES
  ('w1-1', 'p1', 'wenner', 'Wenner', 'CEO', 'management', 'blue', 1, '战略决策与需求确认'),
  ('w1-2', 'p1', 'mery', 'Mery', 'CIO', 'design', 'gold', 2, 'UI/UX 设计与用户体验优化'),
  ('w1-3', 'p1', 'irra', 'Irra', 'CTO', 'tech', 'blue', 3, '技术架构与全栈开发'),
  ('w1-4', 'p1', 'jiawen', 'JiaWen', '创始人', 'management', 'blue', 4, '质量把关与最终验收'),
  ('w2-1', 'p2', 'mery', 'Mery', 'CIO', 'design', 'gold', 1, '品牌设计主导'),
  ('w2-2', 'p2', 'irra', 'Irra', 'CTO', 'tech', 'blue', 2, '设计稿技术落地支持'),
  ('w3-1', 'p3', 'irra', 'Irra', 'CTO', 'tech', 'blue', 1, 'AI 引擎架构设计'),
  ('w3-2', 'p3', 'jiawen', 'JiaWen', '创始人', 'management', 'blue', 2, '产品战略与模型选型')
ON CONFLICT (id) DO NOTHING;

-- 7.6 初始化任务
INSERT INTO public.tasks (id, title, priority, status, project_id, project_name, department_id, department_color, type, assignee_id, assignee_name, assignee_role, due_date, completed_at)
VALUES
  ('t1', '完成 Supabase 数据库迁移', 'high', 'completed', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '开发', 'irra', 'Irra', 'CTO', '6月10日', '6月8日'),
  ('t2', '前端 CRUD 交互实现', 'high', 'completed', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '开发', 'irra', 'Irra', 'CTO', '6月10日', '6月8日'),
  ('t3', 'Cloudflare Pages 部署', 'high', 'in-progress', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '部署', 'irra', 'Irra', 'CTO', '6月15日', NULL),
  ('t4', '域名绑定 www.metanoia-labs.com', 'high', 'in-progress', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '部署', 'irra', 'Irra', 'CTO', '6月15日', NULL),
  ('t5', '仪表盘 KPI 组件', 'medium', 'completed', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '开发', 'irra', 'Irra', 'CTO', '6月8日', '6月8日'),
  ('t6', 'Logo 设计方案', 'high', 'in-progress', 'p2', '品牌视觉系统', 'design', 'gold', '设计', 'mery', 'Mery', 'CIO', '6月10日', NULL),
  ('t7', '配色系统定义', 'medium', 'in-progress', 'p2', '品牌视觉系统', 'design', 'gold', '设计', 'mery', 'Mery', 'CIO', '6月15日', NULL),
  ('t8', 'AI 模型接入层', 'high', 'completed', 'p3', 'AI 产品化引擎', 'tech', 'blue', '开发', 'irra', 'Irra', 'CTO', '5月30日', '5月25日'),
  ('t9', 'RAG 管道实现', 'high', 'in-progress', 'p3', 'AI 产品化引擎', 'tech', 'blue', '开发', 'irra', 'Irra', 'CTO', '6月20日', NULL),
  ('t10', '技术部归档规范', 'medium', 'completed', 'p4', '技术部标准规范', 'tech', 'blue', '文档', 'irra', 'Irra', 'CTO', '6月5日', '6月5日'),
  ('t11', '部署 Skill 封装', 'low', 'todo', 'p4', '技术部标准规范', 'tech', 'blue', '封装', 'irra', 'Irra', 'CTO', '6月30日', NULL),
  ('t12', '竞品分析报告撰写', 'medium', 'todo', 'p5', '竞品分析报告', 'design', 'gold', '分析', 'mery', 'Mery', 'CIO', '7月1日', NULL)
ON CONFLICT (id) DO NOTHING;

-- 7.7 初始化文档
INSERT INTO public.documents (id, name, type, department_id, department_color, updated_by, updated_at, updated_at_timestamp, status)
VALUES
  ('d1', '公司管理平台 API 规范', 'technical', 'tech', 'blue', 'Irra', '刚刚', NOW(), 'latest'),
  ('d2', '数据库设计文档', 'technical', 'tech', 'blue', 'Irra', '刚刚', NOW(), 'latest'),
  ('d3', '品牌视觉设计稿 v1.0', 'design', 'design', 'gold', 'Mery', '刚刚', NOW(), 'latest'),
  ('d4', 'AI 产品化引擎架构', 'architecture', 'tech', 'blue', 'Irra', '刚刚', NOW(), 'latest'),
  ('d5', '技术部部署规范', 'technical', 'tech', 'blue', 'Irra', '刚刚', NOW(), 'latest'),
  ('d6', '部门协作流程', 'product', 'management', 'blue', 'Wenner', '刚刚', NOW(), 'latest'),
  ('d7', '尖塔指南项目归档', 'technical', 'tech', 'blue', 'Irra', '刚刚', NOW(), 'latest'),
  ('d8', '公司管理平台 PRD', 'product', 'management', 'blue', 'Wenner', '刚刚', NOW(), 'latest'),
  ('d9', '会议记录 — 6月启动会', 'meeting', 'management', 'blue', 'Wenner', '刚刚', NOW(), 'latest'),
  ('d10', '竞品分析模板', 'design', 'design', 'gold', 'Mery', '刚刚', NOW(), 'latest')
ON CONFLICT (id) DO NOTHING;

-- 7.8 初始化活动动态
INSERT INTO public.activities (user_id, user_name, action, target, target_type, target_id, color)
VALUES
  ('irra', 'Irra', '完成了', 'Supabase 数据库迁移', 'task', 't1', 'blue'),
  ('irra', 'Irra', '更新了', '公司管理平台 API 规范', 'document', 'd1', 'blue'),
  ('mery', 'Mery', '创建了', '品牌视觉设计稿 v1.0', 'document', 'd3', 'gold'),
  ('wenner', 'Wenner', '提交了', '公司管理平台 PRD', 'document', 'd8', 'blue'),
  ('irra', 'Irra', '完成了', '前端 CRUD 交互实现', 'task', 't2', 'blue'),
  ('jiawen', 'JiaWen', '审批了', 'AI 产品化引擎架构', 'document', 'd4', 'blue')
ON CONFLICT (id) DO NOTHING;

-- 7.9 初始化系统配置
INSERT INTO public.settings (id, key, value, description)
VALUES
  ('global', 'company_name', '"启明科技"', '公司名称'),
  ('global', 'company_slogan', '"以 AI 驱动商业未来"', '公司标语'),
  ('global', 'theme_color', '"#0A84FF"', '主题色'),
  ('global', 'version', '"1.0.0"', '系统版本')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 8. 启用 RLS（行级安全）
-- ==========================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 公开读取策略（所有认证用户）
CREATE POLICY IF NOT EXISTS "公开读取" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "公开读取" ON public.agents FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "公开读取" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "公开读取" ON public.project_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "公开读取" ON public.workflow_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "公开读取" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "公开读取" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "公开读取" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "公开读取" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "公开读取" ON public.users FOR SELECT TO authenticated USING (true);

-- 管理员写入策略
CREATE POLICY IF NOT EXISTS "管理员写入" ON public.departments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')));

CREATE POLICY IF NOT EXISTS "管理员写入" ON public.users
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')));

CREATE POLICY IF NOT EXISTS "管理员写入" ON public.settings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'founder'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'founder'));

-- 用户自管理策略
CREATE POLICY IF NOT EXISTS "用户自管理" ON public.users
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 项目写入策略
CREATE POLICY IF NOT EXISTS "项目参与者写入" ON public.projects
  FOR ALL TO authenticated
  USING (
    lead = (SELECT name FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo'))
  );

CREATE POLICY IF NOT EXISTS "项目周期写入" ON public.project_cycles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.lead = (SELECT name FROM public.users WHERE id = auth.uid())
           OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')))
    )
  );

CREATE POLICY IF NOT EXISTS "流程节点写入" ON public.workflow_nodes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.lead = (SELECT name FROM public.users WHERE id = auth.uid())
           OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')))
    )
  );

-- 任务写入策略
CREATE POLICY IF NOT EXISTS "任务写入" ON public.tasks
  FOR ALL TO authenticated
  USING (
    assignee_id = (SELECT id FROM public.agents a 
                   JOIN public.users u ON a.name = u.name 
                   WHERE u.id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo'))
  );

-- 文档写入策略
CREATE POLICY IF NOT EXISTS "文档写入" ON public.documents
  FOR ALL TO authenticated
  USING (
    updated_by = (SELECT name FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo', 'cto', 'cio'))
  );

-- 智能体写入策略
CREATE POLICY IF NOT EXISTS "智能体写入" ON public.agents
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo'))
    OR id = (SELECT a.id FROM public.agents a JOIN public.users u ON a.name = u.name WHERE u.id = auth.uid())
  );

-- 活动只读（触发器写入）
CREATE POLICY IF NOT EXISTS "活动只读" ON public.activities
  FOR INSERT TO authenticated
  USING (false)
  WITH CHECK (false);

-- ==========================================
-- 9. 创建 Storage Bucket（文档存储）
-- ==========================================

-- 注意：Storage Bucket 需通过 Supabase Dashboard 或 CLI 创建
-- 执行以下 SQL 创建 RLS 策略（bucket 已创建后）
-- 实际创建命令：
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- ==========================================
-- 完成！
-- ==========================================
SELECT '数据库初始化完成！' as status;

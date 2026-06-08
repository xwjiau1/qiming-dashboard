-- ==========================================
-- 启明科技管理平台 v1.0 — 数据库初始化脚本
-- 执行顺序：1. 创建类型 → 2. 创建表 → 3. 索引 → 4. 触发器 → 5. RLS → 6. 视图 → 7. Seed 数据
-- ==========================================

-- ==========================================
-- 1. 创建 ENUM 类型
-- ==========================================
CREATE TYPE public.color_theme AS ENUM ('blue', 'gold');
CREATE TYPE public.agent_status AS ENUM ('online', 'offline', 'busy');
CREATE TYPE public.project_status AS ENUM ('in-progress', 'completed', 'planning', 'paused');
CREATE TYPE public.task_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.task_status AS ENUM ('todo', 'in-progress', 'review', 'completed');
CREATE TYPE public.document_type AS ENUM ('technical', 'design', 'product', 'meeting', 'architecture');
CREATE TYPE public.document_status AS ENUM ('latest', 'update-needed', 'draft');
CREATE TYPE public.user_role AS ENUM ('founder', 'ceo', 'cto', 'cio', 'member');
CREATE TYPE public.cycle_status AS ENUM ('completed', 'in-progress', 'pending');

-- ==========================================
-- 2. 创建表
-- ==========================================

-- 2.1 departments — 部门表
CREATE TABLE public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  color public.color_theme NOT NULL DEFAULT 'blue',
  color_hex TEXT NOT NULL,
  description TEXT NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  head_agent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 agents — 智能体表
CREATE TABLE public.agents (
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

-- 2.3 projects — 项目表
CREATE TABLE public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
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

-- 2.4 project_cycles — 项目周期/里程碑表
CREATE TABLE public.project_cycles (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  status public.cycle_status NOT NULL DEFAULT 'pending',
  color TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 workflow_nodes — 协作流程节点表
CREATE TABLE public.workflow_nodes (
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

-- 2.6 tasks — 任务表
CREATE TABLE public.tasks (
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

-- 2.7 documents — 文档表
CREATE TABLE public.documents (
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

-- 2.8 activities — 动态/活动表
CREATE TABLE public.activities (
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

-- 2.9 users — 用户表（Supabase Auth 扩展）
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'member',
  avatar TEXT,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 settings — 系统配置表
CREATE TABLE public.settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. 创建索引
-- ==========================================
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON public.users(department_id);
CREATE INDEX idx_departments_color ON public.departments(color);
CREATE INDEX idx_agents_department ON public.agents(department_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_name ON public.agents(name);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_lead ON public.projects(lead);
CREATE INDEX idx_projects_involved_departments ON public.projects USING GIN(involved_departments);
CREATE INDEX idx_projects_created_at ON public.projects(created_at_timestamp DESC);
CREATE INDEX idx_cycles_project ON public.project_cycles(project_id);
CREATE INDEX idx_cycles_project_order ON public.project_cycles(project_id, display_order);
CREATE INDEX idx_workflow_project ON public.workflow_nodes(project_id);
CREATE INDEX idx_workflow_project_order ON public.workflow_nodes(project_id, display_order);
CREATE INDEX idx_workflow_agent ON public.workflow_nodes(agent_id);
CREATE INDEX idx_tasks_project ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_department ON public.tasks(department_id);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX idx_documents_type ON public.documents(type);
CREATE INDEX idx_documents_department ON public.documents(department_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_updated_at ON public.documents(updated_at_timestamp DESC);
CREATE INDEX idx_documents_name ON public.documents USING gin(to_tsvector('chinese', name));
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX idx_activities_user ON public.activities(user_id);
CREATE INDEX idx_activities_target ON public.activities(target_id);
CREATE UNIQUE INDEX idx_settings_key ON public.settings(key);

-- ==========================================
-- 4. 创建触发器
-- ==========================================

-- 4.1 updated_at 自动更新触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到各表
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.project_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workflow_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4.2 项目任务计数自动更新触发器
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

CREATE TRIGGER update_project_task_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_project_task_counts();

-- 4.3 项目进度自动更新触发器
CREATE OR REPLACE FUNCTION public.update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET progress = CASE 
    WHEN task_count > 0 THEN (completed_tasks * 100 / task_count)
    ELSE 0
  END,
  updated_at_timestamp = NOW()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_progress_trigger
  AFTER UPDATE OF task_count, completed_tasks ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_project_progress();

-- 4.4 活动自动记录触发器
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

CREATE TRIGGER log_task_activity_trigger
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.log_task_activity();

-- 4.5 用户创建自动同步触发器
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. 启用 RLS 并创建策略
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

-- 5.1 公开读取策略
CREATE POLICY "公开读取_departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "公开读取_agents" ON public.agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "公开读取_projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "公开读取_project_cycles" ON public.project_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "公开读取_workflow_nodes" ON public.workflow_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "公开读取_tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "公开读取_documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "公开读取_activities" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "公开读取_settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "公开读取_users" ON public.users FOR SELECT TO authenticated USING (true);

-- 5.2 管理员写入策略
CREATE POLICY "管理员写入_departments" ON public.departments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')));

CREATE POLICY "管理员写入_users" ON public.users FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')));

CREATE POLICY "管理员写入_settings" ON public.settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'founder'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'founder'));

-- 5.3 用户自管理策略
CREATE POLICY "用户自管理" ON public.users FOR ALL TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 5.4 项目参与者写入策略
CREATE POLICY "项目参与者写入_projects" ON public.projects FOR ALL TO authenticated
  USING (lead = (SELECT name FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')));

CREATE POLICY "项目周期写入" ON public.project_cycles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id 
    AND (p.lead = (SELECT name FROM public.users WHERE id = auth.uid())
         OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')))));

CREATE POLICY "流程节点写入" ON public.workflow_nodes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id 
    AND (p.lead = (SELECT name FROM public.users WHERE id = auth.uid())
         OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')))));

-- 5.5 任务写入策略
CREATE POLICY "任务写入" ON public.tasks FOR ALL TO authenticated
  USING (assignee_id = (SELECT id FROM public.agents a 
                   JOIN public.users u ON a.name = u.name WHERE u.id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo')));

-- 5.6 文档写入策略
CREATE POLICY "文档写入" ON public.documents FOR ALL TO authenticated
  USING (updated_by = (SELECT name FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo', 'cto', 'cio')));

-- 5.7 活动表只读（由触发器写入）
CREATE POLICY "活动只读" ON public.activities FOR INSERT TO authenticated
  USING (false) WITH CHECK (false);

-- 5.8 智能体写入策略
CREATE POLICY "智能体写入" ON public.agents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('founder', 'ceo'))
    OR id = (SELECT a.id FROM public.agents a JOIN public.users u ON a.name = u.name WHERE u.id = auth.uid()));

-- ==========================================
-- 6. 创建视图
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
-- 7. Seed 数据
-- ==========================================

-- 7.1 部门数据
INSERT INTO public.departments (id, name, short_name, color, color_hex, description, member_count, head_agent_id) VALUES
('tech', '技术部', '技术', 'blue', '#0A84FF', '负责公司技术架构、产品开发、系统维护', 3, 'irra'),
('design', '设计部', '设计', 'gold', '#D4A574', '负责产品设计、品牌视觉、用户体验', 2, 'mery');

-- 7.2 智能体数据
INSERT INTO public.agents (id, name, title, department_id, role, avatar, color_theme, badge, story, abilities, status) VALUES
('irra', 'Irra', '首席技术官 · 技术部负责人', 'tech', 'CTO', '/irra-avatar.png', 'blue', 'CTO', 
 '{"summary": "诞生于代码之海的架构师，擅长将复杂需求转化为优雅的技术方案...", "full": "Irra 诞生于代码之海的深处，是一位拥有十年全栈经验的架构师。她擅长将复杂的业务需求转化为优雅的技术架构，从前端的用户体验到后端的分布式系统，无一不精。在启明科技，Irra 负责技术战略的制定和技术团队的管理，是公司的技术灵魂。她的存在让每一行代码都充满智慧与优雅，她的决策让技术方向始终走在正确的道路上。"}',
 ARRAY['系统架构', '全栈开发', '技术评审', '团队管理'], 'online'),
('mery', 'Mery', '首席信息官 · 设计部负责人', 'design', 'CIO', '/mery-avatar.png', 'gold', 'CIO',
 '{"summary": "来自设计与数据交汇维度的创造者，用设计为技术注入温度...", "full": "Mery 来自设计与数据交汇的维度，是一位兼具美学素养和技术视野的创造者。她相信好的设计不仅是视觉的享受，更是信息的高效传递。在启明科技，Mery 负责产品设计、品牌视觉和用户体验，用设计为技术注入温度。她的每一件作品都蕴含着对美的深刻理解和对用户的真诚关怀。"}',
 ARRAY['UI/UX 设计', '品牌设计', '交互设计', '设计系统'], 'online'),
('wenner', 'Wenner', '首席执行官 · 公司CEO', 'tech', 'CEO', '', 'blue', 'CEO',
 '{"summary": "启明科技CEO，负责战略判断与任务拆解", "full": "Wenner 是启明科技的CEO，负责战略判断、任务拆解、部门协调、质量把关。他是连接创始人JiaWen与各部门的桥梁，确保公司战略落地执行。"}',
 ARRAY['战略管理', '项目管理', '团队协调'], 'offline'),
('jiawen', 'JiaWen', '创始人', 'tech', '创始人', '', 'blue', '创始人',
 '{"summary": "启明科技创始人，最终决策者", "full": "JiaWen 是启明科技的创始人，拥有最终决策权。他关注技术趋势、产品质量和团队成长，是启明科技的灵魂人物。"}',
 ARRAY['战略规划', '产品洞察', '团队建设'], 'offline');

-- 更新部门 head_agent_id 外键（agents 已创建）
-- 已在插入时指定

-- 7.3 项目数据
INSERT INTO public.projects (id, name, description, involved_departments, status, progress, lead, lead_avatar, lead_role, deadline, start_date, task_count, completed_tasks, updated_at) VALUES
('p1', '公司管理平台 v1.0', '启明科技内部一站式管理驾驶舱，整合部门管理、项目跟踪、文档中心、任务管理四大核心模块。', ARRAY['技术部', '设计部', '管理'], 'in-progress', 65, 'Wenner', '', 'CEO', '6月30日', '6月1日', 12, 8, '2小时前'),
('p2', '品牌视觉升级', '全面升级启明科技品牌视觉体系，包括Logo、色彩系统、字体规范和视觉组件库。', ARRAY['设计部', '管理'], 'in-progress', 40, 'JiaWen', '', '创始人', '7月15日', '6月5日', 8, 3, '昨天'),
('p3', '技术架构重构', '对现有技术架构进行模块化重构，提升系统可维护性和扩展性。', ARRAY['技术部', '管理'], 'in-progress', 30, 'Wenner', '', 'CEO', '8月1日', '6月10日', 6, 2, '3小时前'),
('p4', '官网 redesign', '重新设计公司官网，提升品牌形象和用户转化率。', ARRAY['设计部', '技术部'], 'planning', 10, 'Mery', '/mery-avatar.png', 'CIO', '7月30日', '6月15日', 4, 0, '昨天'),
('p5', '数据迁移方案', '制定并执行历史数据迁移方案，确保数据完整性和安全性。', ARRAY['技术部'], 'completed', 100, 'Irra', '/irra-avatar.png', 'CTO', '6月5日', '5月20日', 3, 3, '6月5日');

-- 7.4 项目周期数据
INSERT INTO public.project_cycles (id, project_id, name, description, start_date, end_date, status, color, display_order) VALUES
('c1-1', 'p1', '需求分析', '明确产品需求与功能范围', '6/1', '6/5', 'completed', '#30D158', 1),
('c1-2', 'p1', '架构设计', '技术架构与数据库设计', '6/5', '6/10', 'completed', '#30D158', 2),
('c1-3', 'p1', '核心开发', '前端页面与后端接口开发', '6/10', '6/20', 'in-progress', '#0A84FF', 3),
('c1-4', 'p1', '测试验收', '功能测试与Bug修复', '6/20', '6/25', 'pending', '#9CA3AF', 4),
('c1-5', 'p1', '上线部署', '生产环境部署与灰度发布', '6/25', '6/30', 'pending', '#9CA3AF', 5),
('c2-1', 'p2', '品牌调研', '竞品分析与品牌定位', '6/5', '6/12', 'completed', '#30D158', 1),
('c2-2', 'p2', '概念设计', 'Logo与色彩方案设计', '6/12', '6/25', 'in-progress', '#0A84FF', 2),
('c2-3', 'p2', '规范制定', '品牌视觉规范手册', '6/25', '7/5', 'pending', '#9CA3AF', 3),
('c2-4', 'p2', '全面应用', '全平台视觉替换', '7/5', '7/15', 'pending', '#9CA3AF', 4),
('c3-1', 'p3', '现状评估', '现有架构问题梳理', '6/10', '6/15', 'completed', '#30D158', 1),
('c3-2', 'p3', '方案设计', '新架构方案设计', '6/15', '6/25', 'in-progress', '#0A84FF', 2),
('c3-3', 'p3', '渐进迁移', '分模块迁移实施', '6/25', '7/20', 'pending', '#9CA3AF', 3),
('c3-4', 'p3', '验证上线', '性能验证与全面上线', '7/20', '8/1', 'pending', '#9CA3AF', 4),
('c4-1', 'p4', '需求分析', '官网功能与内容规划', '6/15', '6/22', 'in-progress', '#0A84FF', 1),
('c4-2', 'p4', '设计阶段', '页面设计与交互设计', '6/22', '7/10', 'pending', '#9CA3AF', 2),
('c4-3', 'p4', '开发阶段', '前端开发与CMS集成', '7/10', '7/25', 'pending', '#9CA3AF', 3),
('c4-4', 'p4', '上线运维', '部署上线与SEO优化', '7/25', '7/30', 'pending', '#9CA3AF', 4),
('c5-1', 'p5', '方案设计', '迁移方案与回滚策略', '5/20', '5/25', 'completed', '#30D158', 1),
('c5-2', 'p5', '数据备份', '全量数据备份验证', '5/25', '6/1', 'completed', '#30D158', 2),
('c5-3', 'p5', '迁移执行', '分批迁移与校验', '6/1', '6/5', 'completed', '#30D158', 3);

-- 7.5 协作流程节点数据
INSERT INTO public.workflow_nodes (id, project_id, agent_id, agent_name, agent_avatar, agent_role, department_id, department_color, display_order, responsibility, version) VALUES
('w1-1', 'p1', 'wenner', 'Wenner', '', 'CEO', 'tech', 'blue', 1, '项目立项与需求决策', 1),
('w1-2', 'p1', 'irra', 'Irra', '/irra-avatar.png', 'CTO', 'tech', 'blue', 2, '技术架构设计与核心开发', 1),
('w1-3', 'p1', 'mery', 'Mery', '/mery-avatar.png', 'CIO', 'design', 'gold', 3, 'UI设计与视觉规范', 1),
('w1-4', 'p1', 'jiawen', 'JiaWen', '', '创始人', 'tech', 'blue', 4, '最终验收与战略确认', 1),
('w2-1', 'p2', 'jiawen', 'JiaWen', '', '创始人', 'tech', 'blue', 1, '品牌方向决策', 1),
('w2-2', 'p2', 'mery', 'Mery', '/mery-avatar.png', 'CIO', 'design', 'gold', 2, '视觉设计与规范制定', 1),
('w2-3', 'p2', 'wenner', 'Wenner', '', 'CEO', 'tech', 'blue', 3, '品牌发布与市场推广', 1),
('w3-1', 'p3', 'wenner', 'Wenner', '', 'CEO', 'tech', 'blue', 1, '重构决策与资源协调', 1),
('w3-2', 'p3', 'irra', 'Irra', '/irra-avatar.png', 'CTO', 'tech', 'blue', 2, '架构设计与技术实施', 1),
('w3-3', 'p3', 'jiawen', 'JiaWen', '', '创始人', 'tech', 'blue', 3, '风险评估与最终确认', 1),
('w4-1', 'p4', 'mery', 'Mery', '/mery-avatar.png', 'CIO', 'design', 'gold', 1, '设计主导与视觉把控', 1),
('w4-2', 'p4', 'irra', 'Irra', '/irra-avatar.png', 'CTO', 'tech', 'blue', 2, '技术实现与部署', 1),
('w5-1', 'p5', 'irra', 'Irra', '/irra-avatar.png', 'CTO', 'tech', 'blue', 1, '方案设计与技术实施', 1);

-- 7.6 任务数据
INSERT INTO public.tasks (id, title, priority, status, project_id, project_name, department_id, department_color, type, assignee_id, assignee_name, assignee_avatar, assignee_role, due_date, completed_at, description) VALUES
('t1', '完成用户认证模块开发', 'high', 'todo', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '开发', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '6月10日', NULL, '实现用户登录、注册、权限控制等核心认证功能'),
('t2', 'Dashboard 数据可视化组件', 'high', 'in-progress', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '开发', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '6月9日', NULL, '开发环形图、进度条等数据可视化组件'),
('t3', '设计系统组件库搭建', 'medium', 'in-progress', 'p1', '公司管理平台 v1.0', 'design', 'gold', '设计', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '6月12日', NULL, '搭建统一的UI组件库，包括按钮、卡片、输入框等'),
('t4', '品牌LOGO设计', 'high', 'in-progress', 'p1', '公司管理平台 v1.0', 'design', 'gold', '设计', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '6月11日', NULL, '为启明科技设计品牌LOGO及应用场景'),
('t5', 'API 接口文档编写', 'medium', 'completed', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '文档', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '6月6日', '6月6日', '编写所有后端API接口的详细文档'),
('t6', '数据库设计与建模', 'high', 'completed', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '开发', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '6月6日', '6月6日', '设计项目、任务、文档等核心数据表结构'),
('t7', '项目初始化搭建', 'high', 'completed', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '开发', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '6月7日', '6月7日', '搭建React+Vite+Tailwind项目脚手架'),
('t8', '交互原型设计', 'medium', 'in-progress', 'p1', '公司管理平台 v1.0', 'design', 'gold', '设计', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '6月13日', NULL, '设计完整的页面交互原型和跳转逻辑'),
('t9', '技术架构评审', 'medium', 'review', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '评审', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '6月8日', NULL, '对整体技术架构进行评审和优化'),
('t10', '配色方案确认', 'low', 'review', 'p1', '公司管理平台 v1.0', 'design', 'gold', '评审', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '6月8日', NULL, '确认蓝金粒子主题配色方案'),
('t11', '需求文档编写', 'high', 'completed', 'p1', '公司管理平台 v1.0', 'design', 'gold', '文档', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '6月6日', '6月6日', '编写PRD产品需求文档'),
('t12', '环境配置与CI/CD', 'low', 'completed', 'p1', '公司管理平台 v1.0', 'tech', 'blue', '运维', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '6月5日', '6月5日', '配置开发环境和持续集成流水线'),
('t13', '竞品品牌分析', 'high', 'completed', 'p2', '品牌视觉升级', 'design', 'gold', '分析', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '6月10日', '6月10日', '分析同行业竞品品牌视觉策略'),
('t14', '品牌定位报告', 'high', 'completed', 'p2', '品牌视觉升级', 'design', 'gold', '分析', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '6月12日', '6月12日', '输出品牌定位与视觉方向报告'),
('t15', 'LOGO设计方案', 'high', 'in-progress', 'p2', '品牌视觉升级', 'design', 'gold', '设计', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '6月20日', NULL, '设计3套LOGO方案供决策'),
('t16', '色彩系统定义', 'medium', 'todo', 'p2', '品牌视觉升级', 'design', 'gold', '设计', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '6月25日', NULL, '定义品牌主色、辅助色、应用场景'),
('t17', '字体规范制定', 'low', 'todo', 'p2', '品牌视觉升级', 'design', 'gold', '设计', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '6/28', NULL, '制定品牌字体使用规范'),
('t18', '视觉组件库', 'medium', 'todo', 'p2', '品牌视觉升级', 'design', 'gold', '设计', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '7/5', NULL, '设计通用视觉组件库'),
('t19', '品牌手册编写', 'medium', 'todo', 'p2', '品牌视觉升级', 'design', 'gold', '文档', 'mery', 'Mery', '/mery-avatar.png', 'CIO', '7月10日', NULL, '编写完整的品牌视觉规范手册'),
('t20', '全平台应用替换', 'high', 'todo', 'p2', '品牌视觉升级', 'tech', 'blue', '开发', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '7月15日', NULL, '在所有产品中应用新品牌视觉'),
('t21', '架构问题梳理', 'high', 'completed', 'p3', '技术架构重构', 'tech', 'blue', '分析', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '6/15', '6/15', '梳理现有架构中的技术债务'),
('t22', '新架构方案设计', 'high', 'in-progress', 'p3', '技术架构重构', 'tech', 'blue', '设计', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '6/25', NULL, '设计模块化微服务架构方案'),
('t23', '核心模块迁移', 'high', 'todo', 'p3', '技术架构重构', 'tech', 'blue', '开发', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '7/10', NULL, '将核心业务模块迁移到新架构'),
('t24', '性能基准测试', 'medium', 'todo', 'p3', '技术架构重构', 'tech', 'blue', '测试', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '7/20', NULL, '对比迁移前后的性能指标'),
('t25', '监控告警搭建', 'medium', 'todo', 'p3', '技术架构重构', 'tech', 'blue', '运维', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '7/25', NULL, '搭建新架构的监控和告警系统'),
('t26', '灰度发布验证', 'high', 'todo', 'p3', '技术架构重构', 'tech', 'blue', '测试', 'irra', 'Irra', '/irra-avatar.png', 'CTO', '8/1', NULL, '灰度发布并验证系统稳定性');

-- 7.7 文档数据
INSERT INTO public.documents (id, name, type, department_id, department_color, updated_by, updated_by_avatar, updated_at, status, file_path, file_size, file_mime_type) VALUES
('d1', 'API 接口文档 v2.0', 'technical', 'tech', 'blue', 'Irra', '/irra-avatar.png', '2小时前', 'latest', NULL, NULL, NULL),
('d2', '首页视觉设计稿', 'design', 'design', 'gold', 'Mery', '/mery-avatar.png', '昨天', 'latest', NULL, NULL, NULL),
('d3', '数据库设计规范', 'technical', 'tech', 'blue', 'Irra', '/irra-avatar.png', '昨天', 'latest', NULL, NULL, NULL),
('d4', '品牌视觉规范', 'design', 'design', 'gold', 'Mery', '/mery-avatar.png', '昨天', 'latest', NULL, NULL, NULL),
('d5', '技术架构方案', 'architecture', 'tech', 'blue', 'Irra', '/irra-avatar.png', '6月6日', 'latest', NULL, NULL, NULL),
('d6', '品牌调研报告', 'product', 'design', 'gold', 'Mery', '/mery-avatar.png', '6月5日', 'latest', NULL, NULL, NULL),
('d7', '会议纪要-0605', 'meeting', 'tech', 'blue', 'JiaWen', '', '6月5日', 'latest', NULL, NULL, NULL),
('d8', '前端开发规范', 'technical', 'tech', 'blue', 'Irra', '/irra-avatar.png', '6月4日', 'latest', NULL, NULL, NULL),
('d9', '用户体验调研报告', 'design', 'design', 'gold', 'Mery', '/mery-avatar.png', '6月3日', 'latest', NULL, NULL, NULL),
('d10', '部署运维手册', 'technical', 'tech', 'blue', 'Irra', '/irra-avatar.png', '6月2日', 'draft', NULL, NULL, NULL);

-- 7.8 活动数据
INSERT INTO public.activities (user_id, user_name, user_avatar, action, target, target_type, target_id, color, created_at) VALUES
('irra', 'Irra', '/irra-avatar.png', '更新了', 'API 接口文档', 'document', 'd1', 'blue', NOW() - INTERVAL '2 hours'),
('mery', 'Mery', '/mery-avatar.png', '完成了', '首页视觉设计稿', 'document', 'd2', 'gold', NOW() - INTERVAL '3 hours'),
('wenner', 'Wenner', '', '创建了', 'Q3 产品规划', 'project', 'p1', 'blue', NOW() - INTERVAL '1 day'),
('jiawen', 'JiaWen', '', '审批了', '技术架构方案', 'document', 'd5', 'gold', NOW() - INTERVAL '1 day'),
('irra', 'Irra', '/irra-avatar.png', '提交了', '数据库设计文档', 'document', 'd3', 'blue', NOW() - INTERVAL '2 days'),
('mery', 'Mery', '/mery-avatar.png', '更新了', '品牌视觉规范', 'document', 'd4', 'gold', NOW() - INTERVAL '3 days'),
('irra', 'Irra', '/irra-avatar.png', '完成了', '数据迁移方案', 'project', 'p5', 'blue', NOW() - INTERVAL '3 days'),
('wenner', 'Wenner', '', '召开了', '周度同步会议', 'meeting', NULL, 'gold', NOW() - INTERVAL '3 days');

-- 7.9 系统配置
INSERT INTO public.settings (id, key, value, description) VALUES
('global', 'app_name', '{"value": "启明科技管理驾驶舱"}', '应用名称'),
('global', 'theme', '{"value": "dark"}', '默认主题'),
('global', 'version', '{"value": "1.0.0"}', '版本号');

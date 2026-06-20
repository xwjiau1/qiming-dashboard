import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import {
  FolderKanban,
  Loader,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  Plus,
  FolderKanban as ProjectIcon,
  Circle,
  CheckCircle2,
  ArrowUpRight,
  ListTodo,
  StickyNote,
  Sparkles,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import GalaxyCanvas from '@/components/GalaxyCanvas';
import ProjectDetailModal from '@/components/ProjectDetailModal';
import CreateModal from '@/components/CreateModal';
import { toast } from '@/components/Toast';
import { API } from '@/api';
import { ShimmerCard, AnimatedProgressBar } from '@/components/gsap';
import SplitTextReveal from '@/components/gsap/SplitTextReveal';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useDashboard } from '@/hooks/useApiData';
import type { Project, Department, Task, Activity } from '@/data';
import { priorityConfig } from '@/data';

// ==================== KPI Card ====================
function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
  delay,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  trend: string;
  delay: number;
  onClick?: () => void;
}) {
  const { ref, value: displayValue } = useAnimatedNumber(value, {
    duration: 2.0,
    ease: 'power2.out',
    delay,
  });

  return (
    <ShimmerCard
      className={`bg-surface border border-surface-tertiary rounded-xl p-5 group ${onClick ? 'cursor-pointer hover:border-brand-blue/20' : ''}`}
      delay={delay}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3" ref={ref}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      </div>
      <div className="text-3xl font-semibold text-white font-mono tracking-tight">
        {displayValue}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <TrendingUp className="w-3 h-3 text-status-success" />
        <span className="text-xs text-status-success">{trend}</span>
      </div>
    </ShimmerCard>
  );
}

// ==================== Department Card ====================
function DepartmentCard({ dept, tasks, projects, delay }: { dept: Department; tasks: Task[]; projects: Project[]; delay: number }) {
  const isBlue = dept.color === 'blue';
  const deptTasks = tasks.filter((t) => t.department === dept.name);
  const completedTasks = deptTasks.filter((t) => t.status === 'completed');
  const activeTasks = deptTasks.filter((t) => t.status !== 'completed');

  return (
    <ShimmerCard className="rounded-xl" delay={delay}>
      <div
        className="bg-surface border rounded-xl p-5"
        style={{ borderColor: isBlue ? 'rgba(10,132,255,0.1)' : 'rgba(212,165,116,0.1)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: isBlue ? 'rgba(10,132,255,0.12)' : 'rgba(212,165,116,0.12)' }}
          >
            <Users className="w-4 h-4" style={{ color: dept.colorHex }} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white">{dept.name}</h3>
            <span className="text-xs text-gray-500">{dept.memberCount} 位成员</span>
          </div>
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-medium"
            style={{ background: isBlue ? 'rgba(10,132,255,0.12)' : 'rgba(212,165,116,0.12)', color: dept.colorHex }}
          >
            {dept.shortName}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <img src={dept.head.avatar} alt={dept.head.name} className="w-6 h-6 rounded-md object-cover" />
          <span className="text-xs text-gray-400">{dept.head.name} · {dept.head.role}</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success" />
            </span>
            <span className="text-[11px] text-status-success">在线</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-2">
          <span>{deptTasks.length} 个任务</span>
          <span className="text-status-success">{completedTasks.length} 已完成</span>
          <span className="text-brand-blue">{activeTasks.length} 进行中</span>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {projects
            .filter((p) => p.involvedDepartments.includes(dept.name) && p.status === 'in-progress')
            .map((p) => (
              <span
                key={p.id}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-secondary border border-surface-tertiary text-gray-400"
              >
                {p.name}
              </span>
            ))}
        </div>
      </div>
    </ShimmerCard>
  );
}

// ==================== Project Card ====================
function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  return (
    <ShimmerCard
      className="rounded-xl"
      delay={0.5 + index * 0.12}
      onClick={onClick}
    >
      <div className="bg-surface border border-surface-tertiary rounded-xl p-5 cursor-pointer group">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-medium"
            style={{
              background:
                project.status === 'in-progress'
                  ? 'rgba(10,132,255,0.12)'
                  : project.status === 'completed'
                    ? 'rgba(48,209,88,0.12)'
                    : 'rgba(107,114,128,0.12)',
              color:
                project.status === 'in-progress'
                  ? '#38BDF8'
                  : project.status === 'completed'
                    ? '#30D158'
                    : '#9CA3AF',
            }}
          >
            {project.status === 'in-progress' ? '进行中' : project.status === 'completed' ? '已完成' : '规划中'}
          </span>
          {project.involvedDepartments.slice(0, 2).map((dept) => (
            <span
              key={dept}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium border-l-[2px]"
              style={{
                background: dept === '设计部' ? 'rgba(212,165,116,0.08)' : 'rgba(10,132,255,0.08)',
                color: dept === '设计部' ? '#D4A574' : '#0A84FF',
                borderLeftColor: dept === '设计部' ? '#D4A574' : '#0A84FF',
              }}
            >
              {dept}
            </span>
          ))}
          {project.involvedDepartments.length > 2 && (
            <span className="text-[10px] text-gray-600">+{project.involvedDepartments.length - 2}</span>
          )}
        </div>

        <h4 className="text-sm font-medium text-white mb-1 group-hover:text-brand-blue-light transition-colors">
          {project.name}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{project.description}</p>

        {project.cycles.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {project.cycles.map((cycle, ci) => (
              <div key={cycle.id} className="flex-1 flex items-center">
                <div
                  className="h-1 rounded-full flex-1"
                  style={{
                    background:
                      cycle.status === 'completed'
                        ? '#30D158'
                        : cycle.status === 'in-progress'
                          ? '#0A84FF'
                          : '#1E1E24',
                  }}
                />
                {ci < project.cycles.length - 1 && <div className="w-0.5 h-0.5 bg-gray-700 rounded-full mx-0.5" />}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500">{project.completedTasks}/{project.taskCount} 任务</span>
            <span className="text-xs font-mono text-gradient-blue-gold">{project.progress}%</span>
          </div>
          <AnimatedProgressBar
            progress={project.progress}
            gradient="linear-gradient(90deg, #0A84FF, #38BDF8, #D4A574)"
            height={4}
            delay={0.6 + index * 0.12}
            duration={1.0}
          />
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-tertiary">
          <div className="flex -space-x-2">
            {project.workflow.slice(0, 3).map((node) => (
              <div
                key={node.id}
                className="w-5 h-5 rounded border border-surface overflow-hidden"
                title={`${node.agentName} · ${node.responsibility || node.agentRole}`}
              >
                {node.agentAvatar ? (
                  <img src={node.agentAvatar} alt={node.agentName} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: node.departmentColor === 'blue' ? 'rgba(10,132,255,0.2)' : 'rgba(212,165,116,0.2)',
                    }}
                  >
                    <span className="text-[7px]" style={{ color: node.departmentColor === 'blue' ? '#38BDF8' : '#F0C674' }}>
                      {node.agentName[0]}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {project.workflow.length > 3 && (
              <div className="w-5 h-5 rounded border border-surface bg-surface-tertiary flex items-center justify-center">
                <span className="text-[7px] text-gray-500">+{project.workflow.length - 3}</span>
              </div>
            )}
          </div>
          <span className="text-[11px] text-gray-600">{project.deadline}</span>
        </div>
      </div>
    </ShimmerCard>
  );
}

// ==================== Activity Timeline ====================
function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const items = containerRef.current.querySelectorAll('.activity-item');
      gsap.from(items, {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.4,
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="space-y-0">
      {activities.slice(0, 6).map((activity, index) => (
        <div key={activity.id} className="activity-item flex gap-3 pb-4 relative">
          {index < 5 && <div className="absolute left-[7px] top-4 bottom-0 w-[2px] bg-surface-tertiary" />}
          <div
            className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 border-black"
            style={{ background: activity.color === 'blue' ? '#0A84FF' : '#D4A574' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm text-gray-300">{activity.user}</span>
              <span className="text-sm text-gray-500">{activity.action}</span>
              <span className="text-sm text-white">{activity.target}</span>
            </div>
            <span className="text-xs text-gray-600 mt-0.5">{activity.timestamp}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== Todo List ====================
function TodoList({ todos, onToggle, onCreate }: { todos: any[]; onToggle: (todo: any) => void; onCreate: () => void }) {
  return (
    <div className="space-y-2">
      {todos.map((todo) => {
        const priority = priorityConfig[todo.priority || 'medium'];
        return (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors group cursor-pointer"
            onClick={() => onToggle(todo)}
          >
            <button
              type="button"
              className="flex-shrink-0 text-gray-500 hover:text-brand-blue transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(todo);
              }}
            >
              {todo.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${todo.completed ? 'text-gray-600 line-through' : 'text-white group-hover:text-brand-blue-light'} transition-colors`}>
                {todo.title}
              </p>
            </div>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
              style={{ background: `${priority.color}15`, color: priority.color }}
            >
              {priority.label}
            </span>
          </div>
        );
      })}
      {todos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <ListTodo className="w-8 h-8 text-gray-700 mb-2" />
          <p className="text-xs text-gray-500">暂无待办事项</p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-brand-blue text-white text-xs font-medium rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            <Plus className="w-3 h-3" />
            创建待办
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== Task Summary ====================
function TaskSummary({ tasks, onNavigate }: { tasks: Task[]; onNavigate: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 5);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const items = containerRef.current.querySelectorAll('.task-item');
      gsap.from(items, {
        y: 10,
        opacity: 0,
        stagger: 0.06,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.5,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="space-y-2">
      {activeTasks.map((task) => (
        <div
          key={task.id}
          className="task-item flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors group cursor-pointer"
          onClick={onNavigate}
        >
          <div
            className="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center"
            style={{
              borderColor: task.priority === 'high' ? '#FF453A' : task.priority === 'medium' ? '#FFD60A' : '#6B7280',
            }}
          >
            <div className="w-2.5 h-2.5 rounded-sm bg-transparent group-hover:bg-gray-600 transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 truncate group-hover:text-white transition-colors">{task.title}</p>
            <p className="text-[11px] text-gray-600 flex items-center gap-1 mt-0.5">
              <ProjectIcon className="w-2.5 h-2.5" />
              {task.projectName}
            </p>
          </div>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
            style={{
              background: task.departmentColor === 'blue' ? 'rgba(10,132,255,0.1)' : 'rgba(212,165,116,0.1)',
              color: task.departmentColor === 'blue' ? '#0A84FF' : '#D4A574',
            }}
          >
            {task.department}
          </span>
          <img
            src={task.assigneeAvatar}
            alt=""
            className="w-5 h-5 rounded-md object-cover flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <ArrowUpRight className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  );
}

// ==================== Ring Chart ====================
function RingChart({ kpiData }: { kpiData: { totalTasks: number; completedTasks: number; inProgressTasks: number; pendingTasks: number } }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (!svgRef.current) return;
      const circles = svgRef.current.querySelectorAll('.ring-segment');
      const total = kpiData.totalTasks || 1;
      const c1Len = 2 * Math.PI * 50 * (kpiData.completedTasks / total);
      const c2Len = 2 * Math.PI * 50 * (kpiData.inProgressTasks / total);

      gsap.set(circles[1], { strokeDasharray: `${c1Len} ${2 * Math.PI * 50}`, strokeDashoffset: 0 });
      gsap.set(circles[2], { strokeDasharray: `${c2Len} ${2 * Math.PI * 50}`, strokeDashoffset: -c1Len });
      gsap.set(circles[3], {
        strokeDasharray: `${2 * Math.PI * 50 * (kpiData.pendingTasks / total)} ${2 * Math.PI * 50}`,
        strokeDashoffset: -(c1Len + c2Len),
      });

      gsap.from(circles, {
        strokeDashoffset: -2 * Math.PI * 50,
        duration: 1.5,
        ease: 'power2.out',
        stagger: 0.2,
        delay: 0.5,
      });
    },
    { scope: svgRef }
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-40 h-40">
        <svg ref={svgRef} viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1E1E24" strokeWidth="10" className="ring-segment" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#30D158" strokeWidth="10" strokeLinecap="round" className="ring-segment" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#0A84FF" strokeWidth="10" strokeLinecap="round" className="ring-segment" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#FFD60A" strokeWidth="10" strokeLinecap="round" className="ring-segment" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-white font-mono">{kpiData.totalTasks}</span>
          <span className="text-xs text-gray-500">总任务</span>
        </div>
      </div>
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-success" />
          <span className="text-xs text-gray-400">已完成 {kpiData.completedTasks}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-blue" />
          <span className="text-xs text-gray-400">进行中 {kpiData.inProgressTasks}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-warning" />
          <span className="text-xs text-gray-400">待处理 {kpiData.pendingTasks}</span>
        </div>
      </div>
    </div>
  );
}

// ==================== Quick Actions ====================
function QuickActions({ onNavigate }: { onNavigate: (path: string) => void }) {
  const actions = [
    { icon: FolderKanban, label: '新建项目', path: '/projects', color: '#0A84FF' },
    { icon: CheckCircle, label: '新建任务', path: '/tasks', color: '#30D158' },
    { icon: ListTodo, label: '新建待办', path: '/todos', color: '#FFD60A' },
    { icon: StickyNote, label: '新建文档', path: '/documents', color: '#D4A574' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            type="button"
            key={action.path}
            onClick={() => onNavigate(action.path)}
            className="flex items-center gap-3 px-4 py-3 bg-surface border border-surface-tertiary rounded-xl hover:border-brand-blue/20 transition-all group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${action.color}15` }}
            >
              <Icon className="w-4 h-4" style={{ color: action.color }} />
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ==================== Main Dashboard ====================
export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showTodoCreateModal, setShowTodoCreateModal] = useState(false);
  const { data: dashboardData, loading: dashboardLoading, refresh: refreshDashboard } = useDashboard();

  const departments = dashboardData?.departments || [];
  const projects = dashboardData?.projects || [];
  const tasks = dashboardData?.tasks || [];
  const todos = dashboardData?.todos || [];
  const activities = dashboardData?.activities || [];
  const kpiData = dashboardData?.kpi || { totalProjects: 0, inProgress: 0, completed: 0, pending: 0, totalTasks: 0, completedTasks: 0, inProgressTasks: 0, pendingTasks: 0, todoCount: 0 };

  const crossDeptProjects = projects.filter((p) => p.involvedDepartments.length > 1).length;

  const handleTodoToggle = async (todo: any) => {
    try {
      await API.todos.toggle(todo.id, !todo.completed);
      toast('success', todo.completed ? '标记为未完成' : '已完成');
      refreshDashboard();
    } catch (err: any) {
      toast('error', '操作失败: ' + err.message);
    }
  };

  const handleCreateTodo = async (data: any) => {
    await API.todos.create(data);
    toast('success', '待办创建成功');
    setShowTodoCreateModal(false);
    refreshDashboard();
  };

  return (
    <PageLayout title="总览" subtitle="启明科技 · 管理驾驶舱">
      {/* Hero */}
      <div className="relative h-56 rounded-xl overflow-hidden mb-6">
        <GalaxyCanvas />
        <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-8" style={{ zIndex: 1 }}>
          <SplitTextReveal
            text="启明科技 · 管理驾驶舱"
            tag="h2"
            type="chars"
            className="text-3xl lg:text-4xl font-semibold text-white tracking-tight font-display"
            stagger={0.04}
            duration={0.7}
            y={25}
            rotateX={-70}
          />

          <SplitTextReveal
            text={`一站式智能公司运营管理平台 · ${crossDeptProjects} 个跨部门协作项目`}
            tag="p"
            type="chars"
            className="text-sm text-gray-500 mt-3"
            stagger={0.015}
            duration={0.4}
            delay={0.5}
            y={10}
            rotateX={0}
          />

          <div className="flex items-center gap-3 mt-5" style={{ opacity: 1 }}>
            <button
              type="button"
              className="hero-btn flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue-dark transition-colors"
              onClick={() => navigate('/projects')}
            >
              <Plus className="w-4 h-4" />
              新建项目
            </button>
            <button
              type="button"
              className="hero-btn flex items-center gap-2 px-4 py-2 bg-surface-secondary border border-surface-tertiary text-gray-300 text-sm font-medium rounded-lg hover:bg-surface-tertiary transition-colors"
              onClick={() => navigate('/tasks')}
            >
              <Plus className="w-4 h-4" />
              新建任务
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions onNavigate={navigate} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={FolderKanban}
          label="项目总数"
          value={kpiData.totalProjects}
          color="#0A84FF"
          trend="跨部门协作"
          delay={0.2}
          onClick={() => navigate('/projects')}
        />
        <KpiCard
          icon={Loader}
          label="进行中"
          value={kpiData.inProgress}
          color="#38BDF8"
          trend="+1 本周"
          delay={0.35}
          onClick={() => navigate('/projects')}
        />
        <KpiCard
          icon={CheckCircle}
          label="已完成"
          value={kpiData.completed}
          color="#30D158"
          trend="+1 本周"
          delay={0.5}
          onClick={() => navigate('/projects')}
        />
        <KpiCard
          icon={Clock}
          label="待处理"
          value={kpiData.pending}
          color="#FFD60A"
          trend="待启动"
          delay={0.65}
          onClick={() => navigate('/projects')}
        />
      </div>

      {/* Departments + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">部门状态</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {departments.map((dept, i) => (
              <DepartmentCard key={dept.id} dept={dept} tasks={tasks} projects={projects} delay={0.4 + i * 0.15} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface border border-surface-tertiary rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">最近动态</h3>
            <Zap className="w-4 h-4 text-brand-gold" />
          </div>
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      {/* Projects */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">项目概览</h3>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1 text-sm text-brand-blue hover:text-brand-blue-light transition-colors"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects
            .filter((p) => p.status !== 'completed')
            .slice(0, 3)
            .map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onClick={() => setSelectedProject(project)}
              />
            ))}
        </div>
      </div>

      {/* Todos + Ring Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-surface-tertiary rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-brand-gold" />
              <h3 className="text-lg font-medium text-white">待办事项</h3>
              <span className="px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-medium">
                {kpiData.todoCount}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTodoCreateModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-blue text-white text-xs font-medium rounded-lg hover:bg-brand-blue-dark transition-colors"
            >
              <Plus className="w-3 h-3" />
              新建
            </button>
          </div>
          <TodoList todos={todos} onToggle={handleTodoToggle} onCreate={() => setShowTodoCreateModal(true)} />
          {todos.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/todos')}
              className="w-full mt-3 py-2 text-xs text-brand-blue hover:text-brand-blue-light transition-colors border-t border-surface-tertiary"
            >
              查看全部待办 →
            </button>
          )}
        </div>
        <div className="bg-surface border border-surface-tertiary rounded-xl p-5 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-white mb-4 self-start">任务统计</h3>
          <RingChart kpiData={kpiData} />
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="mt-4 flex items-center gap-1 px-4 py-2 bg-brand-blue/10 text-brand-blue text-xs font-medium rounded-lg hover:bg-brand-blue/20 transition-colors"
          >
            <ArrowUpRight className="w-3 h-3" />
            前往任务管理
          </button>
        </div>
      </div>

      {/* Tasks Summary */}
      <div className="bg-surface border border-surface-tertiary rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-blue" />
            <h3 className="text-lg font-medium text-white">活跃任务</h3>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-1 text-sm text-brand-blue hover:text-brand-blue-light transition-colors"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <TaskSummary tasks={tasks} onNavigate={() => navigate('/tasks')} />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            tasks={tasks}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      {/* Create Todo Modal */}
      <CreateModal
        title="新建待办"
        isOpen={showTodoCreateModal}
        onClose={() => setShowTodoCreateModal(false)}
        onSubmit={handleCreateTodo}
        fields={[
          { name: 'title', label: '待办标题', type: 'text', required: true, placeholder: '输入待办事项' },
          { name: 'priority', label: '优先级', type: 'select', required: true, options: [
            { value: 'high', label: '高优先级' },
            { value: 'medium', label: '中优先级' },
            { value: 'low', label: '低优先级' },
          ]},
          { name: 'dueDate', label: '截止日期', type: 'text', placeholder: 'YYYY-MM-DD' },
        ]}
      />
    </PageLayout>
  );
}

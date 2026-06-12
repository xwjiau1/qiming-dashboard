import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import {
  X,
  Plus,
  GripVertical,
  Calendar,
  Route,
  Kanban,
  ChevronRight,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import type { Project, Task, ProjectCycle, WorkflowNode } from '@/data';
import { availableAgents } from '@/data';

interface ProjectDetailModalProps {
  project: Project;
  tasks: Task[];
  onClose: () => void;
}

type TabType = 'board' | 'cycles' | 'workflow';

const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: 'board', label: '项目看板', icon: Kanban },
  { key: 'cycles', label: '周期设置', icon: Calendar },
  { key: 'workflow', label: '协作流程', icon: Route },
];

const statusColumns = [
  { key: 'todo', label: '待处理', color: '#FFD60A', bgColor: 'rgba(255,214,10,0.06)' },
  { key: 'in-progress', label: '进行中', color: '#0A84FF', bgColor: 'rgba(10,132,255,0.06)' },
  { key: 'review', label: '待审核', color: '#D4A574', bgColor: 'rgba(212,165,116,0.06)' },
  { key: 'completed', label: '已完成', color: '#30D158', bgColor: 'rgba(48,209,88,0.06)' },
];

const priorityColors: Record<string, string> = {
  high: '#FF453A',
  medium: '#FFD60A',
  low: '#6B7280',
};

// ==================== GSAP Timeline Modal Entrance ====================
function useModalEntrance(isActive: boolean) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!isActive || !modalRef.current || !contentRef.current) return;

      // Master timeline for modal entrance
      // Following gsap-timeline skill: labels, position parameter, defaults
      const tl = gsap.timeline({
        defaults: { duration: 0.4, ease: 'power2.out' },
      });

      // Backdrop fade in
      tl.from(modalRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
      });

      // Content scale + slide in
      tl.from(
        contentRef.current,
        {
          y: 30,
          scale: 0.96,
          opacity: 0,
          duration: 0.35,
          ease: 'back.out(1.2)',
        },
        '-=0.15'
      );

      // Header content stagger
      tl.from(
        '.modal-header > *',
        {
          y: 12,
          opacity: 0,
          stagger: 0.04,
          duration: 0.3,
        },
        '-=0.15'
      );

      // Tabs stagger
      tl.from(
        '.modal-tab',
        {
          y: 8,
          opacity: 0,
          stagger: 0.03,
          duration: 0.25,
        },
        '-=0.15'
      );

      return () => { tl.kill(); };
    },
    { dependencies: [isActive] }
  );

  return { modalRef, contentRef };
}

// ==================== Project Board View ====================
function ProjectBoard({ projectTasks }: { projectTasks: Task[] }) {
  const boardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!boardRef.current) return;
      const cards = boardRef.current.querySelectorAll('.board-card');
      gsap.from(cards, {
        y: 12,
        opacity: 0,
        duration: 0.35,
        stagger: 0.04,
        ease: 'power2.out',
        delay: 0.1,
      });
    },
    { scope: boardRef }
  );

  return (
    <div ref={boardRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {statusColumns.map((col) => {
        const colTasks = projectTasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="flex flex-col">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2" style={{ background: col.bgColor }}>
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="text-sm font-medium" style={{ color: col.color }}>{col.label}</span>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-black/30 text-gray-400 font-mono">
                {colTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className="board-card bg-surface border border-surface-tertiary rounded-lg p-3 hover:border-brand-blue/20 transition-all"
                >
                  <div
                    className="h-[2px] rounded-full mb-2"
                    style={{ background: `linear-gradient(90deg, ${priorityColors[task.priority]}, ${priorityColors[task.priority]}66)` }}
                  />
                  <p className="text-sm text-white mb-2 leading-relaxed">{task.title}</p>
                  {task.description && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={task.assigneeAvatar || ''}
                        alt={task.assignee}
                        className="w-5 h-5 rounded object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <span className="text-xs text-gray-500">{task.assignee}</span>
                    </div>
                    <span className="text-[10px] text-gray-600">{task.dueDate}</span>
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className="flex items-center justify-center py-6 border border-dashed border-surface-tertiary rounded-lg">
                  <p className="text-xs text-gray-600">暂无任务</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==================== Project Cycles View ====================
function ProjectCycles({ cycles }: { cycles: ProjectCycle[] }) {
  const cyclesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cyclesRef.current) return;
      const cards = cyclesRef.current.querySelectorAll('.cycle-card');
      gsap.from(cards, {
        y: 16,
        opacity: 0,
        stagger: 0.06,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.1,
      });
    },
    { scope: cyclesRef }
  );

  return (
    <div className="space-y-4">
      {/* Timeline bar */}
      <div className="relative">
        <div className="flex items-center gap-0">
          {cycles.map((cycle, index) => {
            const isLast = index === cycles.length - 1;
            return (
              <div key={cycle.id} className="flex-1 flex items-center">
                <div className="flex-1">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      background:
                        cycle.status === 'completed'
                          ? '#30D158'
                          : cycle.status === 'in-progress'
                            ? 'linear-gradient(90deg, #30D158, #0A84FF)'
                            : '#1E1E24',
                    }}
                  />
                  <div className="mt-3 px-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      {cycle.status === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                      ) : cycle.status === 'in-progress' ? (
                        <Clock className="w-3.5 h-3.5 text-brand-blue" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-white">{cycle.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{cycle.description}</p>
                    <span className="text-[11px] text-gray-600">{cycle.startDate} - {cycle.endDate}</span>
                  </div>
                </div>
                {!isLast && <ChevronRight className="w-4 h-4 text-gray-700 flex-shrink-0 mx-1 -mt-6" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cycle Cards */}
      <div ref={cyclesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
        {cycles.map((cycle, index) => (
          <div
            key={cycle.id}
            className="cycle-card bg-surface border border-surface-tertiary rounded-xl p-4 hover:border-brand-blue/15 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold"
                style={{
                  background:
                    cycle.status === 'completed'
                      ? 'rgba(48,209,88,0.15)'
                      : cycle.status === 'in-progress'
                        ? 'rgba(10,132,255,0.15)'
                        : 'rgba(107,114,128,0.15)',
                  color: cycle.color,
                }}
              >
                {index + 1}
              </div>
              <span className="text-sm font-medium text-white">{cycle.name}</span>
              <span
                className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium"
                style={{
                  background:
                    cycle.status === 'completed'
                      ? 'rgba(48,209,88,0.12)'
                      : cycle.status === 'in-progress'
                        ? 'rgba(10,132,255,0.12)'
                        : 'rgba(107,114,128,0.12)',
                  color: cycle.color,
                }}
              >
                {cycle.status === 'completed' ? '已完成' : cycle.status === 'in-progress' ? '进行中' : '待开始'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{cycle.description}</p>
            <div className="flex items-center gap-1 text-[11px] text-gray-600">
              <Calendar className="w-3 h-3" />
              {cycle.startDate} - {cycle.endDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Project Workflow View ====================
function ProjectWorkflow({ workflow }: { workflow: WorkflowNode[] }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAgentPicker, setShowAgentPicker] = useState(false);

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newNodes = [...nodes];
    const [removed] = newNodes.splice(draggedIndex, 1);
    newNodes.splice(index, 0, removed);
    setNodes(newNodes.map((n, i) => ({ ...n, order: i + 1 })));
    setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const moveNode = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === nodes.length - 1)) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newNodes = [...nodes];
    const [removed] = newNodes.splice(index, 1);
    newNodes.splice(newIndex, 0, removed);
    setNodes(newNodes.map((n, i) => ({ ...n, order: i + 1 })));
  };

  const removeNode = (index: number) => {
    const newNodes = nodes.filter((_, i) => i !== index);
    setNodes(newNodes.map((n, i) => ({ ...n, order: i + 1 })));
  };

  const addAgent = (agent: (typeof availableAgents)[0]) => {
    const newNode: WorkflowNode = {
      id: `wf-${Date.now()}`,
      agentId: agent.id,
      agentName: agent.name,
      agentAvatar: agent.avatar,
      agentRole: agent.role,
      department: agent.department,
      departmentColor: agent.departmentColor,
      order: nodes.length + 1,
      responsibility: '',
    };
    setNodes([...nodes, newNode]);
    setShowAgentPicker(false);
  };

  const agentsNotInWorkflow = availableAgents.filter((a) => !nodes.some((n) => n.agentId === a.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">拖拽调整智能体协作顺序，定义项目中各部门的协作流程</p>
        <button
          onClick={() => setShowAgentPicker(!showAgentPicker)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-medium rounded-lg hover:bg-brand-blue/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          添加智能体
        </button>
      </div>

      <AnimatePresence>
        {showAgentPicker && agentsNotInWorkflow.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-3 bg-surface-secondary rounded-xl border border-surface-tertiary">
              {agentsNotInWorkflow.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => addAgent(agent)}
                  className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg border border-surface-tertiary hover:border-brand-blue/30 transition-all"
                >
                  {agent.avatar ? (
                    <img src={agent.avatar} alt={agent.name} className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-surface-tertiary flex items-center justify-center">
                      <span className="text-[10px] text-gray-400">{agent.name[0]}</span>
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-xs text-white">{agent.name}</div>
                    <div className="text-[10px] text-gray-500">{agent.role} · {agent.department}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {nodes.map((node, index) => {
          const isBlue = node.departmentColor === 'blue';
          return (
            <div
              key={node.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-4 bg-surface border rounded-xl cursor-move hover:border-brand-blue/20 transition-all ${
                draggedIndex === index ? 'opacity-50 border-dashed border-brand-blue' : ''
              }`}
              style={{ borderColor: isBlue ? 'rgba(10,132,255,0.12)' : 'rgba(212,165,116,0.12)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0"
                style={{
                  background: isBlue
                    ? 'linear-gradient(135deg, rgba(10,132,255,0.2), rgba(56,189,248,0.1))'
                    : 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(240,198,116,0.1))',
                  color: isBlue ? '#38BDF8' : '#F0C674',
                }}
              >
                {node.order}
              </div>
              <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />
              {node.agentAvatar ? (
                <img
                  src={node.agentAvatar}
                  alt={node.agentName}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  style={{ boxShadow: isBlue ? '0 0 10px rgba(10,132,255,0.2)' : '0 0 10px rgba(212,165,116,0.2)' }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: isBlue ? 'rgba(10,132,255,0.15)' : 'rgba(212,165,116,0.15)' }}
                >
                  <span className="text-sm font-medium" style={{ color: isBlue ? '#38BDF8' : '#F0C674' }}>
                    {node.agentName[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{node.agentName}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      background: isBlue ? 'rgba(10,132,255,0.1)' : 'rgba(212,165,116,0.1)',
                      color: isBlue ? '#0A84FF' : '#D4A574',
                    }}
                  >
                    {node.department}
                  </span>
                  <span className="text-[10px] text-gray-500">{node.agentRole}</span>
                </div>
                <input
                  type="text"
                  value={node.responsibility}
                  onChange={(e) => {
                    const newNodes = [...nodes];
                    newNodes[index] = { ...node, responsibility: e.target.value };
                    setNodes(newNodes);
                  }}
                  placeholder="点击输入该节点的协作职责..."
                  className="w-full mt-1 text-xs bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none focus:text-gray-300"
                />
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => moveNode(index, 'up')}
                  disabled={index === 0}
                  className="w-7 h-7 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-surface-secondary disabled:opacity-30 transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveNode(index, 'down')}
                  disabled={index === nodes.length - 1}
                  className="w-7 h-7 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-surface-secondary disabled:opacity-30 transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => removeNode(index)}
                  className="w-7 h-7 rounded flex items-center justify-center text-gray-600 hover:text-status-error hover:bg-status-error/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {nodes.length > 1 && (
        <div className="flex justify-center py-2">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            <span>按顺序协作</span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Main Modal ====================
export default function ProjectDetailModal({ project, tasks, onClose }: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('board');
  const { modalRef, contentRef } = useModalEntrance(true);

  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto" onClick={onClose}>
      <div ref={modalRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        ref={contentRef}
        className="relative w-full max-w-5xl bg-[#0a0a0c] border border-surface-tertiary rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-surface-tertiary">
          <div className="modal-header flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-white">{project.name}</h2>
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
              </div>
              <p className="text-sm text-gray-500 mb-3">{project.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span>参与: {project.involvedDepartments.join('、')}</span>
                <span>{project.startDate} - {project.deadline}</span>
                <span>{project.completedTasks}/{project.taskCount} 任务完成</span>
              </div>
              <div className="mt-3 h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${project.progress}%`,
                    background: 'linear-gradient(90deg, #0A84FF, #38BDF8, #D4A574)',
                  }}
                />
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-surface-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-surface-tertiary">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`modal-tab flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.key
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {activeTab === 'board' && (
              <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <ProjectBoard projectTasks={projectTasks} />
              </motion.div>
            )}
            {activeTab === 'cycles' && (
              <motion.div key="cycles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <ProjectCycles cycles={project.cycles} />
              </motion.div>
            )}
            {activeTab === 'workflow' && (
              <motion.div key="workflow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <ProjectWorkflow workflow={project.workflow} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

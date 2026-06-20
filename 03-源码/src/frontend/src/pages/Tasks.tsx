import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Plus, LayoutGrid, List, GripVertical, FolderKanban,
  Trash2, Edit2, X
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useTasks, useProjects } from '@/hooks/useApiData';
import { API } from '@/api';
import CreateModal from '@/components/CreateModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from '@/components/Toast';
import type { Task } from '@/data';
import { priorityConfig } from '@/data';

type ViewMode = 'board' | 'list';
type StatusColumn = 'todo' | 'in-progress' | 'review' | 'completed';

const columns: { key: StatusColumn; label: string; color: string; bgColor: string }[] = [
  { key: 'todo', label: '待处理', color: '#FFD60A', bgColor: 'rgba(255,214,10,0.06)' },
  { key: 'in-progress', label: '进行中', color: '#0A84FF', bgColor: 'rgba(10,132,255,0.06)' },
  { key: 'review', label: '待审核', color: '#D4A574', bgColor: 'rgba(212,165,116,0.06)' },
  { key: 'completed', label: '已完成', color: '#30D158', bgColor: 'rgba(48,209,88,0.06)' },
];

const statusLabels: Record<string, string> = {
  todo: '待处理',
  'in-progress': '进行中',
  review: '待审核',
  completed: '已完成',
};

function TaskCard({
  task, index, columnIndex, onDragStart, onClick, onToggleStatus,
}: {
  task: Task;
  index: number;
  columnIndex: number;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onClick: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
}) {
  const isBlue = task.departmentColor === 'blue';
  const priority = priorityConfig[task.priority];

  return (
    <motion.div
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, task.id)}
      onClick={() => onClick(task)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: columnIndex * 0.05 + index * 0.03 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-surface border border-surface-tertiary rounded-xl p-4 hover:border-brand-blue/20 hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
    >
      <div className="h-[3px] rounded-full mb-3 -mx-4 -mt-4" style={{ background: `linear-gradient(90deg, ${priority.color}, ${priority.color}66)` }} />

      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-secondary border border-surface-tertiary text-gray-400">
          <FolderKanban className="w-2.5 h-2.5" />
          {task.projectName}
        </span>
      </div>

      <p className="text-sm text-white mb-2 group-hover:text-brand-blue-light transition-colors leading-relaxed">{task.title}</p>

      {task.description && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium border-l-[3px]" style={{ background: isBlue ? 'rgba(10,132,255,0.08)' : 'rgba(212,165,116,0.08)', color: isBlue ? '#0A84FF' : '#D4A574', borderLeftColor: isBlue ? '#0A84FF' : '#D4A574' }}>{task.department}</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: `${priority.color}15`, color: priority.color }}>{priority.label}</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-tertiary text-gray-500">{task.type}</span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-tertiary/50">
        <div className="flex items-center gap-2">
          <img src={task.assigneeAvatar} alt={task.assignee} className="w-5 h-5 rounded-md object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="text-xs text-gray-500">{task.assignee}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 完成/未完成切换按钮 */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStatus(task); }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${task.status === 'completed' ? 'text-status-success bg-status-success/10' : 'text-gray-600 hover:text-gray-400 hover:bg-surface-tertiary'}`}
            title={task.status === 'completed' ? '标记为未完成' : '标记为已完成'}
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-gray-600">{task.dueDate}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ListRow({ task, index, onClick, onDelete, onToggleStatus }: { task: Task; index: number; onClick: (task: Task) => void; onDelete: (task: Task) => void; onToggleStatus: (task: Task) => void }) {
  const isBlue = task.departmentColor === 'blue';
  const priority = priorityConfig[task.priority];
  const status = statusLabels[task.status];
  const statusColors: Record<string, { bg: string; text: string }> = {
    '待处理': { bg: 'rgba(255,214,10,0.12)', text: '#FFD60A' },
    '进行中': { bg: 'rgba(10,132,255,0.12)', text: '#38BDF8' },
    '待审核': { bg: 'rgba(212,165,116,0.12)', text: '#D4A574' },
    '已完成': { bg: 'rgba(48,209,88,0.12)', text: '#30D158' },
  };
  const sc = statusColors[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={() => onClick(task)}
      className="flex items-center gap-4 px-4 py-3 hover:bg-surface-secondary transition-colors group border-b border-surface-tertiary/50 last:border-b-0 cursor-pointer"
    >
      <GripVertical className="w-4 h-4 text-gray-700 flex-shrink-0" />
      <button
        onClick={(e) => { e.stopPropagation(); onToggleStatus(task); }}
        className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${task.status === 'completed' ? 'border-status-success bg-status-success/10' : 'hover:brightness-150'}`}
        style={{ borderColor: task.status === 'completed' ? '#30D158' : priority.color }}
        title={task.status === 'completed' ? '标记为未完成' : '标记为已完成'}
      >
        {task.status === 'completed' && <CheckSquare className="w-3.5 h-3.5 text-status-success" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm truncate ${task.status === 'completed' ? 'text-gray-600 line-through' : 'text-white group-hover:text-brand-blue-light'} transition-colors`}>{task.title}</p>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-secondary border border-surface-tertiary text-gray-500 flex-shrink-0"><FolderKanban className="w-2.5 h-2.5" />{task.projectName}</span>
        </div>
      </div>
      <span className="px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0 hidden sm:block" style={{ background: `${priority.color}15`, color: priority.color }}>{priority.label}</span>
      <span className="px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0 hidden md:block border-l-[3px]" style={{ background: isBlue ? 'rgba(10,132,255,0.08)' : 'rgba(212,165,116,0.08)', color: isBlue ? '#0A84FF' : '#D4A574', borderLeftColor: isBlue ? '#0A84FF' : '#D4A574' }}>{task.department}</span>
      <span className="px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0" style={{ background: sc.bg, color: sc.text }}>{status}</span>
      <div className="flex items-center gap-2 flex-shrink-0 hidden lg:flex">
        <img src={task.assigneeAvatar} alt={task.assignee} className="w-5 h-5 rounded-md object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <span className="text-xs text-gray-400">{task.assignee}</span>
      </div>
      <span className="text-xs text-gray-600 flex-shrink-0 hidden sm:block">{task.dueDate}</span>
      {/* 删除按钮：hover 时显示 */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(task); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
        title="删除任务"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function Tasks() {
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [detailTask, setDetailTask] = useState<any>(null);
  const { data: apiTasks, refresh: refreshTasks } = useTasks();
  const { data: apiProjects } = useProjects();

  const tasks = apiTasks || [];
  const projects = apiProjects || [];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [projectFilter, priorityFilter, tasks]);

  const handleCreate = async (data: any) => {
    await API.tasks.create(data);
    toast('success', '任务创建成功');
    setShowCreateModal(false);
    refreshTasks();
  };

  const handleEdit = async (data: any) => {
    if (!editingTask) return;
    await API.tasks.update(editingTask.id, data);
    toast('success', '任务更新成功');
    setShowEditModal(false);
    setEditingTask(null);
    refreshTasks();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.tasks.delete(deleteTarget.id);
      toast('success', '任务已删除');
      setDeleteTarget(null);
      refreshTasks();
    } catch (err: any) {
      toast('error', '删除失败: ' + err.message);
    }
  };

  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  }, []);

  const handleColumnDrop = async (columnKey: StatusColumn) => {
    const taskId = dragTaskId;
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === columnKey) return;
    try {
      await API.tasks.updateStatus(taskId, columnKey);
      toast('success', `任务移至「${statusLabels[columnKey]}」`);
      refreshTasks();
    } catch (err: any) {
      toast('error', '移动失败: ' + err.message);
    }
    setDragTaskId(null);
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await API.tasks.update(task.id, { status: newStatus });
      toast('success', newStatus === 'completed' ? '任务已完成' : '任务已恢复');
      refreshTasks();
    } catch (err: any) {
      toast('error', '状态更新失败: ' + err.message);
    }
  };

  const openEdit = (task: any) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const editFields = [
    { name: 'title', label: '任务标题', type: 'text' as const, required: true },
    { name: 'priority', label: '优先级', type: 'select' as const, required: true, options: [{ value: 'high', label: '高优先级' }, { value: 'medium', label: '中优先级' }, { value: 'low', label: '低优先级' }] },
    { name: 'status', label: '状态', type: 'select' as const, required: true, options: [{ value: 'todo', label: '待处理' }, { value: 'in-progress', label: '进行中' }, { value: 'review', label: '待审核' }, { value: 'completed', label: '已完成' }] },
    { name: 'projectId', label: '所属项目', type: 'select' as const, required: true, options: projects.map((p) => ({ value: p.id, label: p.name })) },
    { name: 'department', label: '指派部门', type: 'select' as const, required: true, options: [{ value: '技术部', label: '技术部' }, { value: '设计部', label: '设计部' }] },
    { name: 'dueDate', label: '截止日期', type: 'text' as const, placeholder: 'YYYY-MM-DD' },
  ];

  return (
    <PageLayout title="任务管理" subtitle="追踪任务进度，任务与项目关联">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-surface border border-surface-tertiary rounded-lg p-1">
            <button onClick={() => setViewMode('board')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === 'board' ? 'bg-brand-blue text-white' : 'text-gray-500 hover:text-gray-300'}`}><LayoutGrid className="w-4 h-4" />看板</button>
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === 'list' ? 'bg-brand-blue text-white' : 'text-gray-500 hover:text-gray-300'}`}><List className="w-4 h-4" />列表</button>
          </div>
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="h-9 px-3 bg-surface border border-surface-tertiary rounded-lg text-sm text-gray-400 focus:outline-none focus:border-brand-blue">
            <option value="all">全部项目</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="h-9 px-3 bg-surface border border-surface-tertiary rounded-lg text-sm text-gray-400 focus:outline-none focus:border-brand-blue">
            <option value="all">全部优先级</option>
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue-dark transition-colors">
          <Plus className="w-4 h-4" />新建任务
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'board' ? (
          <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((col, colIndex) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.key);
              return (
                <div
                  key={col.key}
                  className="flex flex-col"
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => { e.preventDefault(); setDragTaskId(e.dataTransfer.getData('taskId')); handleColumnDrop(col.key); }}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-3" style={{ background: col.bgColor }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-sm font-medium" style={{ color: col.color }}>{col.label}</span>
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-black/30 text-gray-400 font-mono">{colTasks.length}</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {colTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} columnIndex={colIndex} onDragStart={handleDragStart} onClick={(t) => setDetailTask(t)} onToggleStatus={handleToggleComplete} />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="flex items-center justify-center py-8 border border-dashed border-surface-tertiary rounded-xl">
                        <p className="text-xs text-gray-600">暂无任务</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-surface border border-surface-tertiary rounded-xl overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3 border-b border-surface-tertiary bg-surface-secondary/50">
              <div className="w-4 flex-shrink-0" /><div className="w-5 flex-shrink-0" />
              <div className="flex-1 text-xs text-gray-500 font-medium">任务名称 / 项目</div>
              <div className="text-xs text-gray-500 font-medium hidden sm:block w-12 text-center">优先级</div>
              <div className="text-xs text-gray-500 font-medium hidden md:block w-16 text-center">部门</div>
              <div className="text-xs text-gray-500 font-medium w-14 text-center">状态</div>
              <div className="text-xs text-gray-500 font-medium hidden lg:block w-20 text-center">负责人</div>
              <div className="text-xs text-gray-500 font-medium hidden sm:block w-16 text-right">截止</div>
              <div className="w-7 flex-shrink-0" /> {/* 删除按钮占位 */}
            </div>
            {filteredTasks.map((task, index) => (
              <ListRow key={task.id} task={task} index={index} onClick={(t) => setDetailTask(t)} onDelete={setDeleteTarget} onToggleStatus={handleToggleComplete} />
            ))}
            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <CheckSquare className="w-10 h-10 text-gray-700 mb-3 animate-float" />
                <p className="text-sm text-gray-500">暂无任务</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CreateModal title="新建任务" isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} fields={[
        { name: 'title', label: '任务标题', type: 'text', required: true, placeholder: '输入任务标题' },
        { name: 'priority', label: '优先级', type: 'select', required: true, options: [{ value: 'high', label: '高优先级' }, { value: 'medium', label: '中优先级' }, { value: 'low', label: '低优先级' }] },
        { name: 'projectId', label: '所属项目', type: 'select', required: true, options: projects.map((p) => ({ value: p.id, label: p.name })) },
        { name: 'department', label: '指派部门', type: 'select', required: true, options: [{ value: '技术部', label: '技术部' }, { value: '设计部', label: '设计部' }] },
        { name: 'dueDate', label: '截止日期', type: 'text', placeholder: 'YYYY-MM-DD' },
      ]} />

      <CreateModal title="编辑任务" isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingTask(null); }} onSubmit={handleEdit} mode="edit"
        initialValues={editingTask ? { title: editingTask.title, priority: editingTask.priority, status: editingTask.status, projectId: editingTask.projectId, department: editingTask.department, dueDate: editingTask.dueDate } : undefined}
        fields={editFields} />

      <ConfirmDialog isOpen={!!deleteTarget} title="删除任务" message={`确定要删除「${deleteTarget?.title}」吗？此操作不可撤销。`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      {/* 任务详情 Drawer */}
      <AnimatePresence>
        {detailTask && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setDetailTask(null)} />
            <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} transition={{ duration: 0.3 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-surface border-l border-surface-tertiary z-50 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">任务详情</h3>
                <button onClick={() => setDetailTask(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-surface-secondary transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">任务标题</label>
                  <p className="text-sm text-white">{detailTask.title}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">优先级</label>
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${priorityConfig[detailTask.priority].color}15`, color: priorityConfig[detailTask.priority].color }}>{priorityConfig[detailTask.priority].label}</span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">状态</label>
                    <span className="px-2 py-0.5 rounded text-xs font-medium">{statusLabels[detailTask.status]}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">项目</label>
                  <p className="text-sm text-white">{detailTask.projectName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">部门</label>
                  <p className="text-sm text-white">{detailTask.department}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">负责人</label>
                  <div className="flex items-center gap-2">
                    <img src={detailTask.assigneeAvatar} alt={detailTask.assignee} className="w-6 h-6 rounded-md object-cover" />
                    <span className="text-sm text-white">{detailTask.assignee}</span>
                  </div>
                </div>
                {detailTask.dueDate && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">截止日期</label>
                    <p className="text-sm text-white">{detailTask.dueDate}</p>
                  </div>
                )}
                {detailTask.description && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">描述</label>
                    <p className="text-sm text-gray-300 leading-relaxed">{detailTask.description}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-4 border-t border-surface-tertiary">
                  <button onClick={() => { setDetailTask(null); openEdit(detailTask); }} className="flex-1 h-10 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue-dark transition-colors flex items-center justify-center gap-1.5"><Edit2 className="w-4 h-4" />编辑</button>
                  <button onClick={() => { setDetailTask(null); setDeleteTarget(detailTask); }} className="flex-1 h-10 bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"><Trash2 className="w-4 h-4" />删除</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

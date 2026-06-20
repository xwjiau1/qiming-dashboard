import { motion } from 'framer-motion';
import { CheckSquare, Plus, Trash2, Edit2, CheckCircle2, Circle, Calendar } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useState, useEffect } from 'react';
import CreateModal from '@/components/CreateModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from '@/components/Toast';
import { API } from '@/api';
import { priorityConfig } from '@/data';

export default function Todos() {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await API.todos.getAll();
      setTodos(data);
    } catch (err: any) {
      toast('error', '加载待办失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTodos(); }, []);

  const handleCreate = async (data: any) => {
    await API.todos.create(data);
    toast('success', '待办创建成功');
    setShowCreateModal(false);
    loadTodos();
  };

  const handleEdit = async (data: any) => {
    if (!editingTodo) return;
    await API.todos.update(editingTodo.id, data);
    toast('success', '待办更新成功');
    setShowEditModal(false);
    setEditingTodo(null);
    loadTodos();
  };

  const handleToggle = async (todo: any) => {
    try {
      await API.todos.toggle(todo.id, !todo.completed);
      toast('success', todo.completed ? '标记为未完成' : '已完成');
      loadTodos();
    } catch (err: any) {
      toast('error', '操作失败: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.todos.delete(deleteTarget.id);
      toast('success', '待办已删除');
      setDeleteTarget(null);
      loadTodos();
    } catch (err: any) {
      toast('error', '删除失败: ' + err.message);
    }
  };

  const openEdit = (todo: any) => {
    setEditingTodo(todo);
    setShowEditModal(true);
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <PageLayout title="待办事项" subtitle="个人待办清单，轻量高效">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface border border-surface-tertiary rounded-lg p-1">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  filter === f ? 'bg-brand-blue text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {completedCount}/{todos.length} 已完成
          </span>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建待办
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTodos.map((todo, index) => {
            const priority = priorityConfig[todo.priority];
            return (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all group ${
                  todo.completed
                    ? 'bg-surface-secondary/50 border-surface-tertiary/50'
                    : 'bg-surface border-surface-tertiary hover:border-brand-blue/20'
                }`}
              >
                <button
                  onClick={() => handleToggle(todo)}
                  className="flex-shrink-0 text-gray-500 hover:text-brand-blue transition-colors"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${todo.completed ? 'text-gray-600 line-through' : 'text-white'}`}>
                    {todo.title}
                  </p>
                  {todo.dueDate && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-gray-600" />
                      <span className="text-xs text-gray-600">{todo.dueDate}</span>
                    </div>
                  )}
                </div>

                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                  style={{ background: `${priority.color}15`, color: priority.color }}
                >
                  {priority.label}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(todo)}
                    className="p-1.5 rounded text-gray-500 hover:text-brand-blue hover:bg-surface-secondary transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(todo)}
                    className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filteredTodos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <CheckSquare className="w-10 h-10 text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">
                {filter === 'completed' ? '暂无已完成待办' : '暂无待办事项'}
              </p>
            </div>
          )}
        </div>
      )}

      <CreateModal
        title="新建待办"
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
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

      <CreateModal
        title="编辑待办"
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingTodo(null); }}
        onSubmit={handleEdit}
        mode="edit"
        initialValues={editingTodo ? {
          title: editingTodo.title,
          priority: editingTodo.priority,
          dueDate: editingTodo.dueDate,
        } : undefined}
        fields={[
          { name: 'title', label: '待办标题', type: 'text', required: true },
          { name: 'priority', label: '优先级', type: 'select', required: true, options: [
            { value: 'high', label: '高优先级' },
            { value: 'medium', label: '中优先级' },
            { value: 'low', label: '低优先级' },
          ]},
          { name: 'dueDate', label: '截止日期', type: 'text', placeholder: 'YYYY-MM-DD' },
        ]}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="删除待办"
        message={`确定要删除「${deleteTarget?.title}」吗？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageLayout>
  );
}

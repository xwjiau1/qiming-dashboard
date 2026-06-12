import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Plus,
  Search,
  SlidersHorizontal,
  Building2,
  Calendar,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ProjectDetailModal from '@/components/ProjectDetailModal';
import { API } from '@/api';
import CreateModal from '@/components/CreateModal';
import { useProjects, useTasks } from '@/hooks/useApiData';
import type { Project } from '@/data';

type StatusFilter = 'all' | 'in-progress' | 'completed' | 'planning';

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'in-progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'planning', label: '规划中' },
];

const projectStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  'in-progress': { label: '进行中', bg: 'rgba(10,132,255,0.12)', text: '#38BDF8' },
  completed: { label: '已完成', bg: 'rgba(48,209,88,0.12)', text: '#30D158' },
  planning: { label: '规划中', bg: 'rgba(107,114,128,0.12)', text: '#9CA3AF' },
};

function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  const status = projectStatusConfig[project.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.33, 1, 0.68, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.25 } }}
      onClick={onClick}
      className="bg-surface border border-surface-tertiary rounded-xl p-5 hover:border-brand-blue/20 hover:shadow-card-hover transition-all duration-250 group cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className="px-2 py-0.5 rounded-md text-[11px] font-medium"
          style={{ background: status.bg, color: status.text }}
        >
          {status.label}
        </span>
        {project.involvedDepartments.map((dept) => (
          <span
            key={dept}
            className="px-2 py-0.5 rounded-md text-[11px] font-medium border-l-[2px]"
            style={{
              background: dept === '设计部' ? 'rgba(212,165,116,0.08)' : 'rgba(10,132,255,0.08)',
              color: dept === '设计部' ? '#D4A574' : '#0A84FF',
              borderLeftColor: dept === '设计部' ? '#D4A574' : '#0A84FF',
            }}
          >
            {dept}
          </span>
        ))}
      </div>

      <h4 className="text-base font-medium text-white mb-1 group-hover:text-brand-blue-light transition-colors">
        {project.name}
      </h4>
      <p className="text-xs text-gray-500 line-clamp-2 mb-4">{project.description}</p>

      {project.cycles.length > 0 && (
        <div className="mb-3 p-2.5 bg-surface-secondary/50 rounded-lg border border-surface-tertiary/50">
          <div className="flex items-center gap-2 mb-1.5">
            <Building2 className="w-3 h-3 text-gray-500" />
            <span className="text-[11px] text-gray-500">项目周期</span>
          </div>
          <div className="flex items-center gap-1">
            {project.cycles.map((cycle, ci) => (
              <div key={cycle.id} className="flex-1 flex items-center">
                <div
                  className="h-1.5 rounded-full flex-1"
                  style={{
                    background:
                      cycle.status === 'completed'
                        ? '#30D158'
                        : cycle.status === 'in-progress'
                          ? '#0A84FF'
                          : '#1E1E24',
                  }}
                />
                {ci < project.cycles.length - 1 && (
                  <div className="w-1 h-1 bg-gray-700 rounded-full mx-0.5" />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-gray-600">
              {project.cycles.filter((c) => c.status === 'completed').length}/{project.cycles.length} 阶段
            </span>
            <span className="text-[10px] text-brand-blue">
              当前: {project.cycles.find((c) => c.status === 'in-progress')?.name || '待开始'}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            {project.completedTasks}/{project.taskCount} 任务
          </span>
          <span className="text-xs font-mono text-gradient-blue-gold">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.1 + index * 0.05 }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #0A84FF, #38BDF8, #D4A574)',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-surface-tertiary">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project.workflow.slice(0, 3).map((node) => (
              <div
                key={node.id}
                className="w-6 h-6 rounded-md border-2 border-surface overflow-hidden"
                title={`${node.agentName} · ${node.responsibility || node.agentRole}`}
              >
                {node.agentAvatar ? (
                  <img src={node.agentAvatar} alt={node.agentName} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background:
                        node.departmentColor === 'blue'
                          ? 'rgba(10,132,255,0.2)'
                          : 'rgba(212,165,116,0.2)',
                    }}
                  >
                    <span className="text-[8px]" style={{ color: node.departmentColor === 'blue' ? '#38BDF8' : '#F0C674' }}>
                      {node.agentName[0]}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {project.workflow.length > 3 && (
              <div className="w-6 h-6 rounded-md border-2 border-surface bg-surface-tertiary flex items-center justify-center">
                <span className="text-[8px] text-gray-500">+{project.workflow.length - 3}</span>
              </div>
            )}
          </div>
          <span className="text-[11px] text-gray-500">{project.workflow.length} 人协作</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] text-gray-500">
            <Calendar className="w-3 h-3" />
            {project.deadline}
          </span>
          <span className="text-[11px] text-gray-600">{project.updatedAt}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: apiProjects } = useProjects();
  const { data: apiTasks } = useTasks();

  const projects = apiProjects || [];
  const tasks = apiTasks || [];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (activeFilter !== 'all' && p.status !== activeFilter) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [activeFilter, searchQuery, projects]);

  return (
    <PageLayout title="项目管理" subtitle="公司级项目管理，跨部门协作">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 bg-surface border border-surface-tertiary rounded-lg p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.key
                  ? 'bg-brand-blue text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-surface border border-surface-tertiary rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-surface-secondary border border-surface-tertiary text-gray-400 rounded-lg hover:bg-surface-tertiary transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">排序</span>
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue-dark transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">新建项目</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            onClick={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <FolderKanban className="w-12 h-12 text-gray-700 mb-4 animate-float" />
          <p className="text-gray-500 text-sm">暂无符合条件的项目</p>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="mt-3 text-sm text-brand-blue hover:text-brand-blue-light transition-colors"
          >
            清除筛选条件
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            tasks={tasks}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      <CreateModal
        title="新建项目"
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          await API.projects.create(data);
          window.location.reload();
        }}
        fields={[
          { name: 'name', label: '项目名称', type: 'text', required: true, placeholder: '输入项目名称' },
          { name: 'description', label: '项目描述', type: 'textarea', placeholder: '简要描述项目目标' },
          { name: 'involvedDepartments', label: '参与部门', type: 'select', options: [
            { value: '技术部', label: '技术部' },
            { value: '设计部', label: '设计部' },
          ]},
          { name: 'deadline', label: '截止日期', type: 'text', placeholder: 'YYYY-MM-DD' },
          { name: 'startDate', label: '开始日期', type: 'text', placeholder: 'YYYY-MM-DD' },
        ]}
      />
    </PageLayout>
  );
}

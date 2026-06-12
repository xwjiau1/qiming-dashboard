import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Palette, ChevronDown, ChevronUp, Users, FolderKanban, Sparkles } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useDepartments, useProjects } from '@/hooks/useApiData';
import type { Department, Project } from '@/data';

function AgentStoryCard({ dept, projects }: { dept: Department; projects: Project[] }) {
  const [expanded, setExpanded] = useState(false);
  const isBlue = dept.color === 'blue';
  const Icon = isBlue ? Code : Palette;
  const deptProjects = projects.filter((p) => p.involvedDepartments.includes(dept.name));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
      className="bg-surface border rounded-xl overflow-hidden"
      style={{ borderColor: isBlue ? 'rgba(10,132,255,0.12)' : 'rgba(212,165,116,0.12)' }}
    >
      {/* Department Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isBlue
                ? 'linear-gradient(135deg, rgba(10,132,255,0.2), rgba(56,189,248,0.1))'
                : 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(240,198,116,0.1))',
            }}
          >
            <Icon className="w-6 h-6" style={{ color: dept.colorHex }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-semibold text-white">{dept.name}</h3>
              <span
                className="px-2 py-0.5 rounded-md text-xs font-medium border-l-[3px]"
                style={{
                  background: isBlue ? 'rgba(10,132,255,0.08)' : 'rgba(212,165,116,0.08)',
                  color: dept.colorHex,
                  borderLeftColor: dept.colorHex,
                }}
              >
                {dept.shortName}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                {dept.memberCount} 人
              </span>
            </div>
            <p className="text-sm text-gray-500">{dept.description}</p>
          </div>
        </div>
      </div>

      {/* Agent Card */}
      <div
        className="mx-6 mb-6 rounded-xl border overflow-hidden"
        style={{
          background: isBlue ? 'rgba(10,132,255,0.03)' : 'rgba(212,165,116,0.03)',
          borderColor: isBlue ? 'rgba(10,132,255,0.15)' : 'rgba(212,165,116,0.15)',
        }}
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div
                className="relative w-28 h-28 rounded-2xl overflow-hidden"
                style={{
                  boxShadow: isBlue
                    ? '0 0 30px rgba(10,132,255,0.3), inset 0 0 0 2px rgba(10,132,255,0.3)'
                    : '0 0 30px rgba(212,165,116,0.3), inset 0 0 0 2px rgba(212,165,116,0.3)',
                }}
              >
                <img
                  src={dept.head.avatar}
                  alt={dept.head.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur rounded-full px-1.5 py-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success" />
                  </span>
                  <span className="text-[9px] text-status-success">在线</span>
                </div>
              </div>
              <div
                className="mt-3 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: isBlue
                    ? 'linear-gradient(135deg, rgba(10,132,255,0.2), rgba(56,189,248,0.1))'
                    : 'linear-gradient(135deg, rgba(212,165,116,0.2), rgba(240,198,116,0.1))',
                  color: dept.colorHex,
                  border: `1px solid ${isBlue ? 'rgba(10,132,255,0.3)' : 'rgba(212,165,116,0.3)'}`,
                }}
              >
                {dept.head.badge}
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <h4
                className="text-2xl font-semibold tracking-tight font-display"
                style={{ color: isBlue ? '#38BDF8' : '#F0C674' }}
              >
                {dept.head.name}
              </h4>
              <p className="text-sm mt-1" style={{ color: dept.colorHex }}>
                {dept.head.title}
              </p>

              <div className="mt-4">
                <AnimatePresence mode="wait">
                  {!expanded ? (
                    <motion.p
                      key="summary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-gray-500 leading-relaxed line-clamp-2"
                    >
                      {dept.head.story.summary}
                    </motion.p>
                  ) : (
                    <motion.div
                      key="full"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                    >
                      <p className="text-sm text-gray-400 leading-relaxed">{dept.head.story.full}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 mt-2 text-xs font-medium transition-colors"
                  style={{ color: dept.colorHex }}
                >
                  {expanded ? (
                    <>
                      收起故事 <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      展开完整故事 <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {dept.head.abilities.map((ability) => (
                  <span
                    key={ability}
                    className="px-2.5 py-1 rounded-md text-xs font-medium border"
                    style={{
                      background: '#141418',
                      borderColor: isBlue ? 'rgba(10,132,255,0.2)' : 'rgba(212,165,116,0.2)',
                      color: isBlue ? '#38BDF8' : '#F0C674',
                    }}
                  >
                    {ability}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="px-6 pb-6 pt-2 border-t"
          style={{ borderColor: isBlue ? 'rgba(10,132,255,0.08)' : 'rgba(212,165,116,0.08)' }}
        >
          <h5 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <FolderKanban className="w-3.5 h-3.5" />
            负责项目
          </h5>
          <div className="space-y-2">
            {deptProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-surface-tertiary/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white truncate">{project.name}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
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
                      {project.status === 'in-progress'
                        ? '进行中'
                        : project.status === 'completed'
                          ? '已完成'
                          : '规划中'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 bg-surface-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${project.progress}%`,
                          background: isBlue
                            ? 'linear-gradient(90deg, #0A84FF, #38BDF8)'
                            : 'linear-gradient(90deg, #D4A574, #F0C674)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-500 flex-shrink-0">{project.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Departments() {
  const { data: apiDepartments } = useDepartments();
  const { data: apiProjects } = useProjects();
  const departments = apiDepartments || [];
  const projects = apiProjects || [];

  return (
    <PageLayout title="部门与智能体" subtitle="管理组织架构，了解你的 AI 智能体团队">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-brand-gold" />
          <h2 className="text-2xl font-semibold text-white font-display">你的智能体团队</h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-gray-500 mt-2 ml-9"
        >
          每个智能体都有独特的身份背景和能力，了解他们，更好地协作
        </motion.p>
      </div>

      <div className="space-y-6">
        {departments.map((dept) => (
          <AgentStoryCard key={dept.id} dept={dept} projects={projects} />
        ))}
      </div>
    </PageLayout>
  );
}

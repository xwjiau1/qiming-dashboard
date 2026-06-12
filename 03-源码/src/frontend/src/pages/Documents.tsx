import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Upload,
  FileCode,
  Palette,
  Package,
  Calendar,
  Cpu,
  Eye,
  Download,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useDocuments } from '@/hooks/useApiData';
import { API } from '@/api';
import CreateModal from '@/components/CreateModal';
import { docTypeConfig, docStatusConfig } from '@/data';
import type { Document } from '@/data';

type DocTypeFilter = 'all' | 'technical' | 'design' | 'product' | 'meeting' | 'architecture';

const typeFilters: { key: DocTypeFilter; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: '全部', icon: FileText },
  { key: 'technical', label: '技术文档', icon: FileCode },
  { key: 'design', label: '设计文档', icon: Palette },
  { key: 'product', label: '产品文档', icon: Package },
  { key: 'meeting', label: '会议记录', icon: Calendar },
  { key: 'architecture', label: '架构方案', icon: Cpu },
];

const typeIconMap: Record<string, React.ElementType> = {
  technical: FileCode,
  design: Palette,
  product: Package,
  meeting: Calendar,
  architecture: Cpu,
};

function DocumentRow({ doc, index }: { doc: Document; index: number }) {
  const isBlue = doc.departmentColor === 'blue';
  const typeConfig = docTypeConfig[doc.type];
  const statusConfig = docStatusConfig[doc.status];
  const TypeIcon = typeIconMap[doc.type] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-surface-secondary transition-colors group border-b border-surface-tertiary/50 last:border-b-0"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${typeConfig.color}15` }}
      >
        <TypeIcon className="w-4 h-4" style={{ color: typeConfig.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate group-hover:text-brand-blue-light transition-colors">
          {doc.name}
        </p>
      </div>

      <span
        className="px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0 hidden sm:block"
        style={{ background: `${typeConfig.color}15`, color: typeConfig.color }}
      >
        {typeConfig.label}
      </span>

      <span
        className="px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0 border-l-[3px] hidden md:block"
        style={{
          background: isBlue ? 'rgba(10,132,255,0.08)' : 'rgba(212,165,116,0.08)',
          color: isBlue ? '#0A84FF' : '#D4A574',
          borderLeftColor: isBlue ? '#0A84FF' : '#D4A574',
        }}
      >
        {doc.department}
      </span>

      <div className="flex items-center gap-2 flex-shrink-0 hidden lg:flex">
        {doc.updatedByAvatar ? (
          <img src={doc.updatedByAvatar} alt={doc.updatedBy} className="w-5 h-5 rounded-md object-cover" />
        ) : (
          <div className="w-5 h-5 rounded-md bg-surface-secondary flex items-center justify-center">
            <span className="text-[9px] text-gray-400">{doc.updatedBy[0]}</span>
          </div>
        )}
        <span className="text-xs text-gray-400">{doc.updatedBy}</span>
      </div>

      <span className="text-xs text-gray-500 flex-shrink-0 hidden sm:block w-16 text-right">
        {doc.updatedAt}
      </span>

      <span
        className="px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0"
        style={{ background: statusConfig.bg, color: statusConfig.text }}
      >
        {statusConfig.label}
      </span>

      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors">
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:text-brand-gold hover:bg-brand-gold/10 transition-colors">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Documents() {
  const [activeFilter, setActiveFilter] = useState<DocTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: apiDocuments } = useDocuments();

  const documents = apiDocuments || [];

  const filteredDocs = documents.filter((d) => {
    if (activeFilter !== 'all' && d.type !== activeFilter) return false;
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <PageLayout title="文档中心" subtitle="统一管理公司知识资产">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 lg:max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="搜索文档..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface border border-surface-tertiary rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all"
          />
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue-dark transition-colors">
          <Upload className="w-4 h-4" />
          上传文档
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {typeFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.key
                  ? 'bg-brand-blue text-white'
                  : 'bg-surface border border-surface-tertiary text-gray-500 hover:text-gray-300 hover:bg-surface-secondary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="bg-surface border border-surface-tertiary rounded-xl overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-surface-tertiary bg-surface-secondary/50">
          <div className="w-9 flex-shrink-0" />
          <div className="flex-1 text-xs text-gray-500 font-medium">文档名称</div>
          <div className="text-xs text-gray-500 font-medium hidden sm:block w-20 text-center">类型</div>
          <div className="text-xs text-gray-500 font-medium hidden md:block w-20 text-center">部门</div>
          <div className="text-xs text-gray-500 font-medium hidden lg:block w-24 text-center">更新者</div>
          <div className="text-xs text-gray-500 font-medium hidden sm:block w-16 text-right">时间</div>
          <div className="text-xs text-gray-500 font-medium w-16 text-right">状态</div>
          <div className="w-16 flex-shrink-0" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredDocs.map((doc, index) => (
              <DocumentRow key={doc.id} doc={doc} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredDocs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="w-10 h-10 text-gray-700 mb-3 animate-float" />
            <p className="text-sm text-gray-500">暂无文档</p>
          </div>
        )}
      </div>

      <CreateModal
        title="新建文档"
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          await API.documents.create(data);
          window.location.reload();
        }}
        fields={[
          { name: 'name', label: '文档名称', type: 'text', required: true, placeholder: '输入文档名称' },
          { name: 'type', label: '文档类型', type: 'select', required: true, options: [
            { value: 'technical', label: '技术文档' },
            { value: 'design', label: '设计文档' },
            { value: 'product', label: '产品文档' },
            { value: 'meeting', label: '会议记录' },
            { value: 'architecture', label: '架构方案' },
          ]},
          { name: 'department', label: '所属部门', type: 'select', required: true, options: [
            { value: '技术部', label: '技术部' },
            { value: '设计部', label: '设计部' },
          ]},
        ]}
      />
    </PageLayout>
  );
}

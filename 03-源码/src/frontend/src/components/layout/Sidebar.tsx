import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  FileText,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { navItems } from '@/data';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  FolderKanban,
  FileText,
  CheckSquare,
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[45] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{
          width: collapsed ? 72 : 240,
        }}
        transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
        className={`fixed left-0 top-0 h-screen bg-surface border-r border-surface-tertiary z-50 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: collapsed ? 72 : 240 }}
      >
        {/* Logo Area */}
        <div className="h-14 flex items-center px-4 border-b border-surface-tertiary">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-brand-blue to-brand-gold">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-white font-semibold text-sm whitespace-nowrap overflow-hidden"
                >
                  启明科技
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 mb-2"
              >
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">
                  管理
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={`relative w-full flex items-center gap-3 px-3 h-10 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-brand-blue/12 text-brand-blue'
                    : 'text-gray-500 hover:bg-surface-secondary hover:text-gray-300'
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-blue rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon className="w-5 h-5 flex-shrink-0" />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-surface-secondary border border-surface-tertiary rounded-md text-xs text-gray-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Area */}
        <div className="p-3 border-t border-surface-tertiary">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue/20 to-brand-gold/20 flex items-center justify-center flex-shrink-0 border border-brand-blue/20">
              <span className="text-xs font-semibold text-brand-blue">J</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden min-w-0"
                >
                  <div className="text-sm text-gray-300 truncate">JiaWen</div>
                  <div className="text-xs text-gray-500 truncate">创始人</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 bg-surface-secondary border border-surface-tertiary rounded-full items-center justify-center text-gray-500 hover:text-gray-300 transition-colors z-50"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-[60] w-10 h-10 bg-surface-secondary/80 backdrop-blur border border-surface-tertiary rounded-lg flex items-center justify-center text-gray-300"
      >
        <LayoutDashboard className="w-5 h-5" />
      </button>
    </>
  );
}

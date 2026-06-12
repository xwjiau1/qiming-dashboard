import { Search, Bell } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekStr = weekDays[today.getDay()];

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-14 bg-glass border-b border-surface-tertiary/50 z-40 flex items-center justify-between px-6">
      {/* Left - Title */}
      <div className="ml-10 lg:ml-0">
        <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 hidden sm:block">
          {dateStr} {weekStr}
        </span>

        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-surface-secondary hover:text-gray-300 transition-all duration-200">
          <Search className="w-4 h-4" />
        </button>

        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-surface-secondary hover:text-gray-300 transition-all duration-200">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full" />
        </button>
      </div>
    </header>
  );
}

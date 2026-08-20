import React from 'react';
import { 
  Folder, 
  Laptop, 
  Star, 
  Users, 
  Trash2, 
  PieChart, 
  BookOpen, 
  HardDrive,
  Plus,
  CloudCheck
} from 'lucide-react';
import { NavTab, DriveAboutInfo } from '../types/drive';
import { formatBytes } from '../lib/driveUtils';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewItem: () => void;
  aboutInfo: DriveAboutInfo | null;
  onOpenStorageAnalyzer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewItem,
  aboutInfo,
  onOpenStorageAnalyzer,
}) => {
  const usageBytes = aboutInfo?.storageQuota?.usage ? parseInt(aboutInfo.storageQuota.usage, 10) : 0;
  const limitBytes = aboutInfo?.storageQuota?.limit ? parseInt(aboutInfo.storageQuota.limit, 10) : 0;
  const percentage = limitBytes > 0 ? Math.min(100, Math.round((usageBytes / limitBytes) * 100)) : 0;

  const navItems = [
    {
      id: 'my-drive' as NavTab,
      label: 'My Drive',
      icon: Folder,
      description: 'All folders & documents',
    },
    {
      id: 'chromebook-backups' as NavTab,
      label: 'Chromebook Backups',
      icon: Laptop,
      badge: 'ChromeOS',
      description: 'Downloads & local syncs',
    },
    {
      id: 'starred' as NavTab,
      label: 'Starred Items',
      icon: Star,
      description: 'Favorite files',
    },
    {
      id: 'shared' as NavTab,
      label: 'Shared with Me',
      icon: Users,
      description: 'Collaborative files',
    },
    {
      id: 'trash' as NavTab,
      label: 'Trash',
      icon: Trash2,
      description: 'Deleted files',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col justify-between p-4 shadow-2xl">
      <div>
        {/* Primary Action Button */}
        <div className="mb-5">
          <button
            id="sidebar-new-btn"
            onClick={onOpenNewItem}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span>New Item</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all text-left relative group ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-inner'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400 shrink-0" />
                )}
                {item.badge && !isActive && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-400/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tools Section */}
        <div className="mt-6 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-400">
            Tools & Guide
          </div>
          
          <button
            id="sidebar-nav-storage"
            onClick={() => onSelectTab('storage-analyzer')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all text-left ${
              currentTab === 'storage-analyzer'
                ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-inner'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <PieChart className={`w-4 h-4 shrink-0 ${currentTab === 'storage-analyzer' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="truncate">Storage Analyzer</span>
            </div>
            {currentTab === 'storage-analyzer' && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400 shrink-0" />
            )}
          </button>

          <button
            id="sidebar-nav-guide"
            onClick={() => onSelectTab('chromebook-guide')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all text-left ${
              currentTab === 'chromebook-guide'
                ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-inner'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <BookOpen className={`w-4 h-4 shrink-0 ${currentTab === 'chromebook-guide' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="truncate">Chromebook Guide</span>
            </div>
            {currentTab === 'chromebook-guide' && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Storage Meter Card at Bottom */}
      <div className="mt-6 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-200 flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            Drive Storage
          </span>
          <span className="font-mono text-slate-400 text-[11px]">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage > 90
                ? 'bg-rose-500'
                : percentage > 75
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-blue-500 to-cyan-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatBytes(usageBytes)} used</span>
          <span>{limitBytes > 0 ? formatBytes(limitBytes) : '15 GB'}</span>
        </div>

        <button
          onClick={onOpenStorageAnalyzer}
          className="mt-3.5 w-full py-2 text-center text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-white/5 rounded-xl transition-all border border-blue-400/20 active:scale-[0.98]"
        >
          Manage Drive Space
        </button>
      </div>
    </aside>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Search, 
  RefreshCw, 
  UploadCloud, 
  HelpCircle, 
  LogOut, 
  CheckCircle2,
  Wifi,
  WifiOff,
  X
} from 'lucide-react';
import { DriveAboutInfo } from '../types/drive';
import { formatBytes } from '../lib/driveUtils';
import { AutoSyncControl } from './AutoSyncControl';

interface HeaderProps {
  aboutInfo: DriveAboutInfo | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  onOpenGuide: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  isLoading: boolean;
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  autoSyncInterval: number;
  onChangeAutoSyncInterval: (interval: number) => void;
  autoSyncCountdown: number;
  isAutoSyncing: boolean;
  lastSyncedAt: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  aboutInfo,
  searchQuery,
  onSearchChange,
  onOpenUpload,
  onOpenGuide,
  onRefresh,
  onLogout,
  isLoading,
  autoSyncEnabled,
  onToggleAutoSync,
  autoSyncInterval,
  onChangeAutoSyncInterval,
  autoSyncCountdown,
  isAutoSyncing,
  lastSyncedAt,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => 
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const usageBytes = aboutInfo?.storageQuota?.usage ? parseInt(aboutInfo.storageQuota.usage, 10) : 0;
  const limitBytes = aboutInfo?.storageQuota?.limit ? parseInt(aboutInfo.storageQuota.limit, 10) : 0;
  const usageFormatted = formatBytes(usageBytes);
  const limitFormatted = limitBytes > 0 ? formatBytes(limitBytes) : 'Unlimited';

  return (
    <header className="sticky top-0 z-30 bg-slate-900/60 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/10">
      {/* Offline Alert Strip when disconnected */}
      {!isOnline && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-200 px-4 py-1 text-xs flex items-center justify-center gap-2 backdrop-blur-md">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium">You are offline. Reconnect to the internet to sync files with Google Drive.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo, Device Badge & Online Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-100 leading-none">Chromebook Drive Bridge</h1>
                
                {/* Online / Offline Connectivity Indicator */}
                {isOnline ? (
                  <span 
                    id="connectivity-status-online"
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    title="Connected to internet & synced with Google Drive"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="hidden sm:inline">Online</span>
                  </span>
                ) : (
                  <span 
                    id="connectivity-status-offline"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse"
                    title="Offline - No internet connection. Drive sync paused."
                  >
                    <WifiOff className="w-3 h-3 text-rose-400" />
                    <span>Offline</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">ChromeOS & Google Drive Sync</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="drive-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search files and folders in Drive..."
                className="w-full pl-9 pr-9 py-2 bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 text-sm text-slate-100 placeholder:text-slate-400 border border-white/10 focus:border-blue-400/50 rounded-2xl outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Auto-Sync Toggle & Interval Config */}
            <AutoSyncControl
              enabled={autoSyncEnabled}
              onToggle={onToggleAutoSync}
              interval={autoSyncInterval}
              onIntervalChange={onChangeAutoSyncInterval}
              countdown={autoSyncCountdown}
              isSyncing={isAutoSyncing || isLoading}
              lastSyncedAt={lastSyncedAt}
              onSyncNow={onRefresh}
            />

            {/* Quick Upload Button */}
            <button
              id="header-upload-btn"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
              title="Upload files from Chromebook"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden lg:inline">Upload</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              id="header-refresh-btn"
              onClick={onRefresh}
              disabled={isLoading || isAutoSyncing}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-50"
              title="Refresh Drive files now"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading || isAutoSyncing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* Chromebook Guide Button */}
            <button
              id="header-guide-btn"
              onClick={onOpenGuide}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
              title="Chromebook Sync Guide & Shortcuts"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Avatar & Storage Quota Pill */}
            {aboutInfo?.user && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                <div className="hidden xl:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {aboutInfo.user.displayName}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {usageFormatted} / {limitFormatted}
                  </span>
                </div>

                {aboutInfo.user.photoLink ? (
                  <img
                    src={aboutInfo.user.photoLink}
                    alt={aboutInfo.user.displayName}
                    className="w-8 h-8 rounded-full ring-2 ring-white/20 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/20">
                    {aboutInfo.user.displayName?.charAt(0) || 'G'}
                  </div>
                )}

                <button
                  id="header-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Sign out of Google Drive"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files in Drive..."
              className="w-full pl-9 pr-9 py-2 bg-white/5 text-sm text-slate-100 placeholder:text-slate-400 rounded-2xl border border-white/10 focus:border-blue-400/50 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

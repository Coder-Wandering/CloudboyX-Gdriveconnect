import React, { useState, useRef, useEffect } from 'react';
import { 
  RefreshCw, 
  ChevronDown, 
  Check, 
  Clock, 
  Zap, 
  BatteryCharging, 
  Activity,
  Play,
  Pause
} from 'lucide-react';

export interface SyncIntervalOption {
  value: number; // in seconds
  label: string;
  sublabel: string;
  icon?: React.ReactNode;
}

export const SYNC_INTERVALS: SyncIntervalOption[] = [
  { value: 15, label: '15 seconds', sublabel: 'Fast / Real-time' },
  { value: 30, label: '30 seconds', sublabel: 'Recommended' },
  { value: 60, label: '1 minute', sublabel: 'Standard' },
  { value: 120, label: '2 minutes', sublabel: 'Balanced' },
  { value: 300, label: '5 minutes', sublabel: 'Battery Saver' },
];

interface AutoSyncControlProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  interval: number;
  onIntervalChange: (interval: number) => void;
  countdown: number;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  onSyncNow: () => void;
}

export const AutoSyncControl: React.FC<AutoSyncControlProps> = ({
  enabled,
  onToggle,
  interval,
  onIntervalChange,
  countdown,
  isSyncing,
  lastSyncedAt,
  onSyncNow,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentOption = SYNC_INTERVALS.find((opt) => opt.value === interval) || SYNC_INTERVALS[1];

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getIntervalShortLabel = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    return `${Math.round(sec / 60)}m`;
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      {/* Combined Auto-Sync Widget */}
      <div className={`flex items-center rounded-2xl border transition-all ${
        enabled
          ? 'bg-white/10 border-white/20 shadow-md shadow-cyan-500/5'
          : 'bg-white/5 border-white/10 opacity-80 hover:opacity-100'
      }`}>
        
        {/* Toggle Button */}
        <button
          id="autosync-toggle-btn"
          type="button"
          onClick={() => onToggle(!enabled)}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-l-2xl text-xs font-semibold transition-all hover:bg-white/10 active:scale-95"
          title={enabled ? `Auto-Sync is ON (Every ${currentOption.label}). Click to pause.` : 'Auto-Sync is OFF. Click to enable periodic sync.'}
        >
          {/* Status Indicator Dot / Icon */}
          <div className="relative flex items-center justify-center">
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ) : enabled ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
            )}
          </div>

          <div className="flex flex-col items-start leading-none text-left">
            <span className={`text-[11px] font-bold ${enabled ? 'text-slate-100' : 'text-slate-400'}`}>
              Auto-Sync
            </span>
            <span className="text-[9px] font-mono text-slate-400 mt-0.5">
              {isSyncing 
                ? 'Syncing...' 
                : enabled 
                ? `${countdown}s` 
                : 'Paused'}
            </span>
          </div>
        </button>

        {/* Separator */}
        <div className="h-4 w-[1px] bg-white/15" />

        {/* Interval Dropdown Trigger */}
        <button
          id="autosync-interval-menu-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-r-2xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all font-mono"
          title="Configure Auto-Sync interval"
        >
          <span className="text-[11px] font-medium text-cyan-300">
            {getIntervalShortLabel(interval)}
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Interval Selector Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Auto-Sync Settings</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {enabled ? 'Active' : 'Paused'}
            </span>
          </div>

          {/* Quick Toggle Inside Popover */}
          <div className="p-2 border-b border-white/10">
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white/5">
              <div className="flex items-center gap-2">
                {enabled ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-200">Periodic Sync</p>
                  <p className="text-[10px] text-slate-400">
                    {enabled ? `Fetching every ${currentOption.label}` : 'Syncing is paused'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggle(!enabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabled ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Interval List Options */}
          <div className="py-2 space-y-1">
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Sync Frequency
            </div>

            {SYNC_INTERVALS.map((opt) => {
              const isSelected = opt.value === interval;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onIntervalChange(opt.value);
                    if (!enabled) onToggle(true);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 text-white font-semibold border border-blue-400/40 shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 text-left">
                    {opt.value === 15 ? (
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    ) : opt.value === 300 ? (
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <div>
                      <p className="leading-tight">{opt.label}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer with Last Synced & Sync Now */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] px-2">
            <span className="text-slate-400 truncate max-w-[120px]" title={lastSyncedAt ? lastSyncedAt.toLocaleString() : 'Never'}>
              Last: <span className="font-mono text-slate-300">{formatLastSync(lastSyncedAt)}</span>
            </span>

            <button
              type="button"
              onClick={() => {
                onSyncNow();
                setIsOpen(false);
              }}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { 
  X, 
  Laptop, 
  Command, 
  FolderDown, 
  WifiOff, 
  HardDrive, 
  Check, 
  ExternalLink,
  Keyboard
} from 'lucide-react';

interface ChromebookGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChromebookGuideModal: React.FC<ChromebookGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Alt + Shift + M', desc: 'Open native ChromeOS Files app' },
    { key: 'Ctrl + O', desc: 'Open file picker on Chromebook' },
    { key: 'Spacebar', desc: 'Quick look / preview selected file' },
    { key: 'Ctrl + Shift + S', desc: 'Chromebook screen capture / screenshot' },
    { key: 'Ctrl + E', desc: 'Create new folder in Files app' },
    { key: 'Alt + Backspace', desc: 'Delete file (Move to Drive trash)' },
    { key: 'Ctrl + Enter', desc: 'Open file in new tab' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center shadow-lg">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">
                Chromebook & Google Drive Integration Guide
              </h2>
              <p className="text-xs text-slate-400">Tips, shortcuts, and best practices for ChromeOS users</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-200">
          
          {/* Section 1: How Google Drive works on Chromebooks */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4" />
              1. Native ChromeOS Files App Integration
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Chromebooks come with Google Drive built right into the system. With this Drive Bridge app connected, you can browse, upload, and organize cloud storage without filling up your Chromebook's internal storage disk.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <p className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                  <FolderDown className="w-4 h-4 text-blue-400" />
                  Auto-Sync Downloads
                </p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  You can set Chrome's default download directory to a Google Drive folder by opening <code className="bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded text-[10px] font-mono">chrome://settings/downloads</code> on your Chromebook.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <p className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  Available Offline
                </p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  In the ChromeOS Files app, right-click any Drive file and toggle <strong className="text-slate-200">"Available offline"</strong> to edit files even without Wi-Fi.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Essential Chromebook Keyboard Shortcuts */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4" />
              2. Essential Chromebook File Shortcuts
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {shortcuts.map((sc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10 text-xs"
                >
                  <span className="text-slate-300">{sc.desc}</span>
                  <kbd className="px-2.5 py-1 bg-white/10 border border-white/15 rounded-lg font-mono text-[10px] font-semibold text-cyan-300 shadow-sm">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Recommended Chromebook Backup Strategy */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Laptop className="w-4 h-4" />
              3. Chromebook Backup & Cloud Workflow
            </h3>
            
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  <strong className="text-slate-100">Use the "Chromebook Backups" folder:</strong> Keep your local screenshots, camera rolls, and class project downloads in the dedicated backup folder.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  <strong className="text-slate-100">Check Storage Analyzer regularly:</strong> Use the built-in Storage Analyzer tab to empty your Drive Trash and remove large duplicate downloads.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  <strong className="text-slate-100">Direct Multi-File Upload:</strong> Use the drag-and-drop uploader to quickly move bulk folders and photos from your Chromebook.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};

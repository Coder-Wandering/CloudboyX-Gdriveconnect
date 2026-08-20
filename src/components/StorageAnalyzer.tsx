import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  HardDrive, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  RefreshCw
} from 'lucide-react';
import { DriveAboutInfo, DriveFile } from '../types/drive';
import { formatBytes } from '../lib/driveUtils';
import { listDriveFiles, emptyDriveTrash } from '../services/driveApi';
import { FileIcon } from './FileIcon';

interface StorageAnalyzerProps {
  token: string;
  aboutInfo: DriveAboutInfo | null;
  onRefreshAbout: () => void;
  onPreviewFile: (file: DriveFile) => void;
  onDownloadFile: (file: DriveFile) => void;
  onTrashFile: (file: DriveFile, trashed: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const StorageAnalyzer: React.FC<StorageAnalyzerProps> = ({
  token,
  aboutInfo,
  onRefreshAbout,
  onPreviewFile,
  onDownloadFile,
  onTrashFile,
  showToast,
}) => {
  const [largeFiles, setLargeFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);

  useEffect(() => {
    loadLargeFiles();
  }, [token]);

  const loadLargeFiles = async () => {
    setIsLoadingFiles(true);
    try {
      // Order files by quotaBytesUsed descending
      const files = await listDriveFiles(token, {
        sortField: 'quotaBytesUsed',
        sortOrder: 'desc',
        pageSize: 30,
      });
      // Exclude folders
      setLargeFiles(files.filter((f) => f.mimeType !== 'application/vnd.google-apps.folder'));
    } catch (err: any) {
      console.error('Failed to load largest files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to permanently empty all items in your Google Drive trash? This cannot be undone.')) {
      return;
    }

    setIsEmptyingTrash(true);
    try {
      await emptyDriveTrash(token);
      showToast('Google Drive trash emptied successfully', 'success');
      onRefreshAbout();
    } catch (err: any) {
      showToast(err.message || 'Failed to empty trash', 'error');
    } finally {
      setIsEmptyingTrash(false);
    }
  };

  const usageBytes = aboutInfo?.storageQuota?.usage ? parseInt(aboutInfo.storageQuota.usage, 10) : 0;
  const limitBytes = aboutInfo?.storageQuota?.limit ? parseInt(aboutInfo.storageQuota.limit, 10) : 0;
  const trashBytes = aboutInfo?.storageQuota?.usageInDriveTrash ? parseInt(aboutInfo.storageQuota.usageInDriveTrash, 10) : 0;
  const percentage = limitBytes > 0 ? Math.min(100, Math.round((usageBytes / limitBytes) * 100)) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center shadow-lg">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 leading-tight">Chromebook Storage & Quota Analyzer</h2>
              <p className="text-xs text-slate-400 mt-0.5">Optimize and clean up Google Drive storage for your ChromeOS device</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRefreshAbout();
                loadLargeFiles();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Quota</span>
            </button>
            <button
              onClick={handleEmptyTrash}
              disabled={isEmptyingTrash}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isEmptyingTrash ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Empty Drive Trash ({formatBytes(trashBytes)})</span>
            </button>
          </div>
        </div>

        {/* Quota Progress meter */}
        <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold mb-2.5">
            <span className="text-slate-200 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-blue-400" />
              Total Google Storage Used
            </span>
            <span className="text-slate-300 font-mono">{formatBytes(usageBytes)} of {limitBytes > 0 ? formatBytes(limitBytes) : '15 GB'} ({percentage}%)</span>
          </div>

          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage > 90
                  ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                  : percentage > 75
                  ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-sm shadow-blue-500/50'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-slate-400">Available Space</p>
              <p className="text-sm font-bold text-slate-100 mt-0.5">
                {limitBytes > usageBytes ? formatBytes(limitBytes - usageBytes) : 'Available'}
              </p>
            </div>
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-slate-400">Trash Storage</p>
              <p className="text-sm font-bold text-slate-100 mt-0.5 font-mono">
                {formatBytes(trashBytes)}
              </p>
            </div>
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-slate-400">Device Target</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">
                ChromeOS Cloud Storage
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Largest Files Table */}
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Largest Files on Drive</h3>
            <p className="text-xs text-slate-400">Review large videos, installers, or archives taking up quota</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{largeFiles.length} files found</span>
        </div>

        {isLoadingFiles ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            <span>Analyzing files...</span>
          </div>
        ) : largeFiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No large files detected. Your Google Drive storage is well-optimized!
          </div>
        ) : (
          <div className="space-y-2">
            {largeFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <div 
                  onClick={() => onPreviewFile(file)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer mr-3"
                >
                  <FileIcon mimeType={file.mimeType} fileName={file.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{file.mimeType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-300 w-20 text-right">
                    {formatBytes(file.size)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDownloadFile(file)}
                      className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/10 rounded-xl transition-colors"
                      title="Download to Chromebook"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onTrashFile(file, true)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

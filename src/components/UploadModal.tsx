import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Laptop,
  Folder
} from 'lucide-react';
import { DriveFile, FolderBreadcrumb } from '../types/drive';
import { uploadFileWithProgress } from '../services/driveApi';
import { formatBytes } from '../lib/driveUtils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  currentFolder: FolderBreadcrumb;
  chromebookBackupFolder: DriveFile | null;
  onUploadCompleted: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface FileQueueItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  token,
  currentFolder,
  chromebookBackupFolder,
  onUploadCompleted,
  showToast,
}) => {
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
  const [targetDestination, setTargetDestination] = useState<'current' | 'chromebook' | 'root'>('current');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: FileQueueItem[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending',
    }));
    setFileQueue((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeQueueItem = (id: string) => {
    if (isUploading) return;
    setFileQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const startUpload = async () => {
    if (fileQueue.length === 0 || isUploading) return;

    let targetFolderId: string | null = null;
    if (targetDestination === 'current') {
      targetFolderId = currentFolder.id === 'root' ? null : currentFolder.id;
    } else if (targetDestination === 'chromebook') {
      targetFolderId = chromebookBackupFolder?.id || null;
    }

    setIsUploading(true);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < fileQueue.length; i++) {
      const item = fileQueue[i];
      if (item.status === 'completed') continue;

      setFileQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'uploading', progress: 0 } : q))
      );

      try {
        await uploadFileWithProgress(
          token,
          item.file,
          targetFolderId,
          (percent) => {
            setFileQueue((prev) =>
              prev.map((q, idx) => (idx === i ? { ...q, progress: percent } : q))
            );
          }
        );

        setFileQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'completed', progress: 100 } : q))
        );
        successCount++;
      } catch (err: any) {
        setFileQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'error', error: err.message || 'Upload failed' } : q
          )
        );
        failCount++;
      }
    }

    setIsUploading(false);
    onUploadCompleted();

    if (successCount > 0 && failCount === 0) {
      showToast(`Successfully uploaded ${successCount} ${successCount === 1 ? 'file' : 'files'} to Google Drive!`, 'success');
    } else if (failCount > 0) {
      showToast(`Uploaded ${successCount} files with ${failCount} errors`, 'error');
    }
  };

  const targetLabel =
    targetDestination === 'current'
      ? currentFolder.name
      : targetDestination === 'chromebook'
      ? 'Chromebook Backups'
      : 'My Drive (Root)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">Upload from Chromebook</h2>
              <p className="text-xs text-slate-400">Sync local files directly to your Google Drive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Target Folder Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Target Destination in Drive
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetDestination('current')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left text-xs font-medium transition-all ${
                  targetDestination === 'current'
                    ? 'border-blue-400 bg-blue-600/20 text-white ring-1 ring-blue-400/40 shadow-sm'
                    : 'border-white/10 bg-white/5 hover:border-white/20 text-slate-300'
                }`}
              >
                <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">Current Folder</p>
                  <p className="text-slate-400 truncate text-[11px]">{currentFolder.name}</p>
                </div>
              </button>

              {chromebookBackupFolder && (
                <button
                  type="button"
                  onClick={() => setTargetDestination('chromebook')}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left text-xs font-medium transition-all ${
                    targetDestination === 'chromebook'
                      ? 'border-blue-400 bg-blue-600/20 text-white ring-1 ring-blue-400/40 shadow-sm'
                      : 'border-white/10 bg-white/5 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Chromebook Backups</p>
                    <p className="text-slate-400 truncate text-[11px]">Dedicated backup folder</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/[0.08]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 shadow-md">
              <FileUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Drag & Drop files here, or <span className="text-blue-400 hover:underline">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports documents, photos, videos, code, Chromebook Downloads, and archives
            </p>
          </div>

          {/* File Queue List */}
          {fileQueue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Selected Files ({fileQueue.length})</span>
                {!isUploading && (
                  <button
                    onClick={() => setFileQueue([])}
                    className="text-rose-400 hover:underline font-normal"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {fileQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-100 truncate">{item.file.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{formatBytes(item.file.size)}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === 'pending' && !isUploading && (
                          <button
                            onClick={() => removeQueueItem(item.id)}
                            className="text-slate-400 hover:text-rose-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {item.status === 'uploading' && (
                          <span className="text-xs font-mono font-medium text-blue-400 flex items-center gap-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            {item.progress}%
                          </span>
                        )}
                        {item.status === 'completed' && (
                          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Done
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-xs font-medium text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Failed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar for uploading item */}
                    {item.status === 'uploading' && (
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <div className="text-xs text-slate-400">
            Destination: <span className="font-semibold text-slate-200">{targetLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              id="start-upload-btn"
              onClick={startUpload}
              disabled={fileQueue.length === 0 || isUploading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/25"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Start Upload ({fileQueue.length})
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

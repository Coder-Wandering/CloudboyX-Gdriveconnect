import React, { useState, useEffect } from 'react';
import { X, FolderInput, Folder, Loader2, Home, Laptop } from 'lucide-react';
import { DriveFile } from '../types/drive';
import { listDriveFiles, moveDriveFile } from '../services/driveApi';

interface MoveModalProps {
  file: DriveFile | null;
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onMoved: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const MoveModal: React.FC<MoveModalProps> = ({
  file,
  isOpen,
  onClose,
  token,
  onMoved,
  showToast,
}) => {
  const [folders, setFolders] = useState<DriveFile[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('root');
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      loadFolders();
    }
  }, [isOpen, token]);

  const loadFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const allFiles = await listDriveFiles(token, {
        category: 'folders',
        pageSize: 50,
      });
      // Filter out the current folder itself if it's moving a folder
      const filtered = file?.mimeType === 'application/vnd.google-apps.folder'
        ? allFiles.filter((f) => f.id !== file.id)
        : allFiles;
      setFolders(filtered);
    } catch (err: any) {
      console.error('Failed to load folders for move:', err);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  if (!isOpen || !file) return null;

  const handleMove = async () => {
    setIsSubmitting(true);
    const currentParentId = file.parents && file.parents.length > 0 ? file.parents[0] : undefined;

    try {
      await moveDriveFile(token, file.id, selectedFolderId, currentParentId);
      showToast(`Moved "${file.name}" successfully`, 'success');
      onMoved();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to move item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh] text-slate-100">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center">
              <FolderInput className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">Move Item</h2>
              <p className="text-xs text-slate-400 truncate max-w-[280px]">{file.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Select Destination Folder
          </label>

          {/* Root Option */}
          <button
            type="button"
            onClick={() => setSelectedFolderId('root')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-medium transition-all ${
              selectedFolderId === 'root'
                ? 'border-blue-400 bg-blue-600/20 text-white ring-1 ring-blue-400/40 shadow-sm'
                : 'border-white/10 bg-white/5 hover:border-white/20 text-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">My Drive (Root)</p>
              <p className="text-slate-400 text-[11px]">Top-level drive storage</p>
            </div>
          </button>

          {isLoadingFolders ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              Loading folders...
            </div>
          ) : (
            <div className="space-y-1.5">
              {folders.map((folder) => {
                const isSelected = selectedFolderId === folder.id;
                const isChromebookFolder = folder.name === 'Chromebook Backups';
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-600/20 text-white ring-1 ring-blue-400/40 shadow-sm'
                        : 'border-white/10 bg-white/5 hover:border-white/20 text-slate-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                      isChromebookFolder
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {isChromebookFolder ? <Laptop className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5" />}
                    </div>
                    <span className="truncate font-medium flex-1">{folder.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Moving...
              </>
            ) : (
              'Move Here'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Edit3, Loader2 } from 'lucide-react';
import { DriveFile } from '../types/drive';
import { updateFileMetadata } from '../services/driveApi';

interface RenameModalProps {
  file: DriveFile | null;
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onRenamed: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  file,
  isOpen,
  onClose,
  token,
  onRenamed,
  showToast,
}) => {
  const [newName, setNewName] = useState(file?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (file) {
      setNewName(file.name);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateFileMetadata(token, file.id, { name: newName.trim() });
      showToast(`Renamed to "${newName.trim()}"`, 'success');
      onRenamed();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to rename file', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 text-slate-100">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-100 leading-tight">Rename Item</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Item Name
            </label>
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/15 rounded-2xl text-slate-100 focus:bg-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
            />
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
              type="submit"
              disabled={!newName.trim() || isSubmitting || newName === file.name}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

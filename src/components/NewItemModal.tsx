import React, { useState } from 'react';
import { 
  X, 
  FolderPlus, 
  FileText, 
  Table2, 
  Presentation, 
  FileCode, 
  Loader2 
} from 'lucide-react';
import { createDriveFolder, createGoogleWorkspaceDocument } from '../services/driveApi';
import { FolderBreadcrumb } from '../types/drive';

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  currentFolder: FolderBreadcrumb;
  onItemCreated: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type ItemType = 'folder' | 'doc' | 'sheet' | 'slide' | 'note';

export const NewItemModal: React.FC<NewItemModalProps> = ({
  isOpen,
  onClose,
  token,
  currentFolder,
  onItemCreated,
  showToast,
}) => {
  const [selectedType, setSelectedType] = useState<ItemType>('folder');
  const [itemName, setItemName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const itemOptions: { id: ItemType; label: string; icon: any; color: string; bgColor: string; placeholder: string }[] = [
    {
      id: 'folder',
      label: 'New Folder',
      icon: FolderPlus,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      placeholder: 'e.g. Science Project, Receipts, Downloads',
    },
    {
      id: 'doc',
      label: 'Google Doc',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      placeholder: 'e.g. Meeting Notes, Essay Draft',
    },
    {
      id: 'sheet',
      label: 'Google Sheet',
      icon: Table2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      placeholder: 'e.g. Budget 2026, Tracker',
    },
    {
      id: 'slide',
      label: 'Google Slide',
      icon: Presentation,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      placeholder: 'e.g. Presentation Deck, Pitch',
    },
    {
      id: 'note',
      label: 'Plain Text Note',
      icon: FileCode,
      color: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
      placeholder: 'e.g. Todo.txt, Scratchpad',
    },
  ];

  const currentOption = itemOptions.find((o) => o.id === selectedType)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const parentId = currentFolder.id === 'root' ? null : currentFolder.id;

    try {
      if (selectedType === 'folder') {
        await createDriveFolder(token, itemName.trim(), parentId);
        showToast(`Created folder "${itemName.trim()}" in ${currentFolder.name}`, 'success');
      } else {
        await createGoogleWorkspaceDocument(token, itemName.trim(), selectedType, parentId);
        showToast(`Created ${currentOption.label} "${itemName.trim()}"`, 'success');
      }
      setItemName('');
      onItemCreated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to create item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-slate-100 leading-tight">Create in Drive</h2>
            <p className="text-xs text-slate-400">Inside: {currentFolder.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            
            {/* Type selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Item Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {itemOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedType(opt.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-blue-400 bg-blue-600/20 text-white ring-1 ring-blue-400/40 shadow-sm'
                          : 'border-white/10 hover:border-white/20 text-slate-300 bg-white/5 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl ${opt.bgColor} ${opt.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Item Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {currentOption.label} Name
              </label>
              <input
                type="text"
                autoFocus
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder={currentOption.placeholder}
                className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/15 rounded-2xl text-slate-100 placeholder-slate-500 focus:bg-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer */}
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
              disabled={!itemName.trim() || isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Item'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

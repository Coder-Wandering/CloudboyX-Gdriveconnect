import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Eye, 
  ExternalLink, 
  Download, 
  Star, 
  Edit2, 
  Trash2, 
  RotateCcw,
  Share2,
  FolderInput
} from 'lucide-react';
import { DriveFile } from '../types/drive';

interface FileActionMenuProps {
  file: DriveFile;
  onPreview: (file: DriveFile) => void;
  onDownload: (file: DriveFile) => void;
  onToggleStar: (file: DriveFile) => void;
  onRename: (file: DriveFile) => void;
  onMove: (file: DriveFile) => void;
  onTrash: (file: DriveFile, trashed: boolean) => void;
  onPermanentDelete?: (file: DriveFile) => void;
  onCopyLink: (file: DriveFile) => void;
  isTrashedTab?: boolean;
}

export const FileActionMenu: React.FC<FileActionMenuProps> = ({
  file,
  onPreview,
  onDownload,
  onToggleStar,
  onRename,
  onMove,
  onTrash,
  onPermanentDelete,
  onCopyLink,
  isTrashedTab = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/10 rounded-lg transition-colors"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1 w-52 bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
        >
          {isTrashedTab ? (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onTrash(file, false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 text-left transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                Restore from Trash
              </button>
              {onPermanentDelete && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onPermanentDelete(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/20 text-left transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Delete Permanently
                </button>
              )}
            </>
          ) : (
            <>
              {!isFolder && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onPreview(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 text-left transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  Quick Preview
                </button>
              )}

              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 text-left transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  Open in Google Drive
                </a>
              )}

              {!isFolder && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onDownload(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 text-left transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  Download to Chromebook
                </button>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  onToggleStar(file);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 text-left transition-colors"
              >
                <Star className={`w-3.5 h-3.5 ${file.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                {file.starred ? 'Remove from Starred' : 'Add to Starred'}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onRename(file);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 text-left transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                Rename
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onMove(file);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 text-left transition-colors"
              >
                <FolderInput className="w-3.5 h-3.5 text-slate-400" />
                Move to Folder
              </button>

              {file.webViewLink && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onCopyLink(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 text-left transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  Copy Share Link
                </button>
              )}

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  onTrash(file, true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/20 text-left transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                Move to Trash
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

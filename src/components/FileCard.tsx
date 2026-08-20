import React from 'react';
import { Star, Check } from 'lucide-react';
import { DriveFile } from '../types/drive';
import { FileIcon } from './FileIcon';
import { FileActionMenu } from './FileActionMenu';
import { formatBytes, formatDate, getFileTypeInfo } from '../lib/driveUtils';

interface FileCardProps {
  file: DriveFile;
  isSelected: boolean;
  onSelect: (file: DriveFile, e: React.MouseEvent) => void;
  onClick: (file: DriveFile) => void;
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

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected,
  onSelect,
  onClick,
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
  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
  const typeInfo = getFileTypeInfo(file.mimeType, file.name);

  return (
    <div
      id={`file-card-${file.id}`}
      onClick={() => onClick(file)}
      className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none backdrop-blur-xl ${
        isSelected
          ? 'bg-blue-600/20 border-blue-400 ring-2 ring-blue-400/30 shadow-lg shadow-blue-500/10'
          : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-xl hover:shadow-black/20'
      }`}
    >
      {/* Top row: Checkbox, File Type Badge / Star, Action Menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Multi-select checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(file, e);
            }}
            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
              isSelected
                ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                : 'border-white/20 bg-white/5 opacity-0 group-hover:opacity-100 hover:border-white/40'
            }`}
            title="Select file"
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${typeInfo.bgColor} ${typeInfo.color} border ${typeInfo.borderColor}`}>
            {typeInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {!isTrashedTab && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(file);
              }}
              className={`p-1 rounded-lg transition-colors ${
                file.starred
                  ? 'text-amber-400 opacity-100'
                  : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-400'
              }`}
              title={file.starred ? 'Starred' : 'Add star'}
            >
              <Star className={`w-4 h-4 ${file.starred ? 'fill-amber-400' : ''}`} />
            </button>
          )}

          <FileActionMenu
            file={file}
            onPreview={onPreview}
            onDownload={onDownload}
            onToggleStar={onToggleStar}
            onRename={onRename}
            onMove={onMove}
            onTrash={onTrash}
            onPermanentDelete={onPermanentDelete}
            onCopyLink={onCopyLink}
            isTrashedTab={isTrashedTab}
          />
        </div>
      </div>

      {/* Main Content: Icon and Name */}
      <div className="flex items-center gap-3.5 my-1">
        <FileIcon
          mimeType={file.mimeType}
          fileName={file.name}
          size="lg"
          thumbnailLink={file.thumbnailLink}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100 truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {isFolder ? 'Folder' : formatBytes(file.size)}
          </p>
        </div>
      </div>

      {/* Bottom row: modified time */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Modified</span>
        <span>{formatDate(file.modifiedTime)}</span>
      </div>
    </div>
  );
};

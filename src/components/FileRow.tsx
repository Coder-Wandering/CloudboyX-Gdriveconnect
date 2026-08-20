import React from 'react';
import { Star, Check, ExternalLink } from 'lucide-react';
import { DriveFile } from '../types/drive';
import { FileIcon } from './FileIcon';
import { FileActionMenu } from './FileActionMenu';
import { formatBytes, formatDate, getFileTypeInfo } from '../lib/driveUtils';

interface FileRowProps {
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

export const FileRow: React.FC<FileRowProps> = ({
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
      id={`file-row-${file.id}`}
      onClick={() => onClick(file)}
      className={`group flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all cursor-pointer select-none backdrop-blur-xl ${
        isSelected
          ? 'bg-blue-600/20 border-blue-400 ring-1 ring-blue-400/30'
          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08]'
      }`}
    >
      {/* Left: Checkbox, Icon, Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(file, e);
          }}
          className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
            isSelected
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'border-white/20 bg-white/5 opacity-0 group-hover:opacity-100 hover:border-white/40'
          }`}
          title="Select item"
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        <FileIcon
          mimeType={file.mimeType}
          fileName={file.name}
          size="sm"
          thumbnailLink={file.thumbnailLink}
        />

        <span className="text-sm font-medium text-slate-100 truncate" title={file.name}>
          {file.name}
        </span>

        {!isTrashedTab && file.starred && (
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
        )}
      </div>

      {/* Middle: Type badge, Owner, Modified Date, Size */}
      <div className="hidden sm:flex items-center gap-6 text-xs text-slate-400 shrink-0">
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${typeInfo.bgColor} ${typeInfo.color} border ${typeInfo.borderColor} hidden md:inline-block`}>
          {typeInfo.label}
        </span>

        <span className="w-28 text-right font-mono text-[11px]">
          {formatDate(file.modifiedTime)}
        </span>

        <span className="w-20 text-right font-mono text-[11px]">
          {isFolder ? '--' : formatBytes(file.size)}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
        {!isTrashedTab && (
          <button
            onClick={() => onToggleStar(file)}
            className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
              file.starred
                ? 'text-amber-400'
                : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:text-amber-400'
            }`}
            title={file.starred ? 'Starred' : 'Add star'}
          >
            <Star className={`w-3.5 h-3.5 ${file.starred ? 'fill-amber-400' : ''}`} />
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
  );
};

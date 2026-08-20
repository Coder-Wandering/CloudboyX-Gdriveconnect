import React, { useState } from 'react';
import { 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  UploadCloud, 
  FolderPlus, 
  Download, 
  Star, 
  Trash2, 
  RotateCcw, 
  X,
  FileQuestion,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { 
  DriveFile, 
  FolderBreadcrumb, 
  ViewMode, 
  FileFilterCategory, 
  SortField, 
  SortOrder, 
  NavTab 
} from '../types/drive';
import { Breadcrumbs } from './Breadcrumbs';
import { FileCard } from './FileCard';
import { FileRow } from './FileRow';

interface DriveExplorerProps {
  files: DriveFile[];
  isLoading: boolean;
  currentTab: NavTab;
  breadcrumbs: FolderBreadcrumb[];
  onNavigateBreadcrumb: (index: number) => void;
  onGoBackFolder: () => void;
  onOpenFolder: (folder: DriveFile) => void;
  onPreviewFile: (file: DriveFile) => void;
  onDownloadFile: (file: DriveFile) => void;
  onToggleStarFile: (file: DriveFile) => void;
  onRenameFile: (file: DriveFile) => void;
  onMoveFile: (file: DriveFile) => void;
  onTrashFile: (file: DriveFile, trashed: boolean) => void;
  onPermanentDeleteFile?: (file: DriveFile) => void;
  onCopyLink: (file: DriveFile) => void;
  onOpenUpload: () => void;
  onOpenNewItem: () => void;
  selectedCategory: FileFilterCategory;
  onSelectCategory: (cat: FileFilterCategory) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  searchQuery?: string;
  onBatchTrash: (files: DriveFile[]) => void;
  onBatchDownload: (files: DriveFile[]) => void;
}

export const DriveExplorer: React.FC<DriveExplorerProps> = ({
  files,
  isLoading,
  currentTab,
  breadcrumbs,
  onNavigateBreadcrumb,
  onGoBackFolder,
  onOpenFolder,
  onPreviewFile,
  onDownloadFile,
  onToggleStarFile,
  onRenameFile,
  onMoveFile,
  onTrashFile,
  onPermanentDeleteFile,
  onCopyLink,
  onOpenUpload,
  onOpenNewItem,
  selectedCategory,
  onSelectCategory,
  sortField,
  sortOrder,
  onSortChange,
  searchQuery,
  onBatchTrash,
  onBatchDownload,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  const isTrashedTab = currentTab === 'trash';

  const categories: { id: FileFilterCategory; label: string }[] = [
    { id: 'all', label: 'All Files' },
    { id: 'folders', label: 'Folders' },
    { id: 'documents', label: 'Documents' },
    { id: 'spreadsheets', label: 'Spreadsheets' },
    { id: 'presentations', label: 'Presentations' },
    { id: 'pdfs', label: 'PDFs' },
    { id: 'images', label: 'Photos & Images' },
    { id: 'media', label: 'Audio & Video' },
    { id: 'archives', label: 'Archives' },
  ];

  const handleSelectFile = (file: DriveFile, e: React.MouseEvent) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(file.id)) {
        next.delete(file.id);
      } else {
        next.add(file.id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedFileIds.size === files.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(files.map((f) => f.id)));
    }
  };

  const selectedFilesList = files.filter((f) => selectedFileIds.has(f.id));

  const handleItemClick = (file: DriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      onOpenFolder(file);
    } else {
      onPreviewFile(file);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Breadcrumbs Navigation (Shown on folder navigation tabs) */}
      {(currentTab === 'my-drive' || currentTab === 'chromebook-backups') && !searchQuery && (
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          onNavigate={onNavigateBreadcrumb}
          onGoBack={onGoBackFolder}
          totalFiles={files.length}
        />
      )}

      {/* Search Header Banner */}
      {searchQuery && (
        <div className="p-3.5 bg-blue-500/10 backdrop-blur-md rounded-2xl border border-blue-400/20 flex items-center justify-between text-xs text-blue-200">
          <span className="font-medium">
            Search results for "<strong className="text-white">{searchQuery}</strong>"
          </span>
          <span className="font-mono text-blue-400 font-semibold">{files.length} found</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-white/10">
        
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* View Mode & Sort Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as [SortField, SortOrder];
                onSortChange(f, o);
              }}
              className="bg-transparent text-xs font-semibold text-slate-300 outline-none px-2 py-0.5 cursor-pointer [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="modifiedTime-desc">Recently Modified</option>
              <option value="modifiedTime-asc">Oldest Modified</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {selectedFileIds.size > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-white/10 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-100">
              {selectedFileIds.size} {selectedFileIds.size === 1 ? 'item' : 'items'} selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
            >
              {selectedFileIds.size === files.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBatchDownload(selectedFilesList)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-100 text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Download Selected</span>
            </button>

            <button
              onClick={() => {
                onBatchTrash(selectedFilesList);
                setSelectedFileIds(new Set());
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isTrashedTab ? 'Delete Selected' : 'Move to Trash'}</span>
            </button>

            <button
              onClick={() => setSelectedFileIds(new Set())}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/10 transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="text-sm font-medium">Syncing Google Drive files...</span>
        </div>
      ) : files.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-100">No items found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
            {searchQuery
              ? 'No files matched your search. Try checking your spelling or clearing filters.'
              : currentTab === 'chromebook-backups'
              ? 'Your Chromebook backup folder is empty. Upload files from your Chromebook downloads to sync.'
              : currentTab === 'starred'
              ? 'You have not starred any files in Google Drive yet.'
              : currentTab === 'trash'
              ? 'Trash is empty.'
              : 'This folder is empty. Start by uploading files or creating new documents.'}
          </p>

          {!isTrashedTab && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
              >
                <UploadCloud className="w-4 h-4" />
                Upload from Chromebook
              </button>
              <button
                onClick={onOpenNewItem}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
              >
                <FolderPlus className="w-4 h-4" />
                Create New Folder
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Files Container */
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedFileIds.has(file.id)}
                onSelect={handleSelectFile}
                onClick={handleItemClick}
                onPreview={onPreviewFile}
                onDownload={onDownloadFile}
                onToggleStar={onToggleStarFile}
                onRename={onRenameFile}
                onMove={onMoveFile}
                onTrash={onTrashFile}
                onPermanentDelete={onPermanentDeleteFile}
                onCopyLink={onCopyLink}
                isTrashedTab={isTrashedTab}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {files.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                isSelected={selectedFileIds.has(file.id)}
                onSelect={handleSelectFile}
                onClick={handleItemClick}
                onPreview={onPreviewFile}
                onDownload={onDownloadFile}
                onToggleStar={onToggleStarFile}
                onRename={onRenameFile}
                onMove={onMoveFile}
                onTrash={onTrashFile}
                onPermanentDelete={onPermanentDeleteFile}
                onCopyLink={onCopyLink}
                isTrashedTab={isTrashedTab}
              />
            ))}
          </div>
        )
      )}

    </div>
  );
};

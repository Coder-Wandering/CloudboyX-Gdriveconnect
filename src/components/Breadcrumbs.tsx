import React from 'react';
import { ChevronRight, Home, ArrowLeft, Folder } from 'lucide-react';
import { FolderBreadcrumb } from '../types/drive';

interface BreadcrumbsProps {
  breadcrumbs: FolderBreadcrumb[];
  onNavigate: (index: number) => void;
  onGoBack: () => void;
  currentFolderName?: string;
  totalFiles: number;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  breadcrumbs,
  onNavigate,
  onGoBack,
  totalFiles,
}) => {
  const canGoBack = breadcrumbs.length > 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg shadow-black/10">
      <div className="flex items-center gap-1.5 flex-wrap">
        {canGoBack && (
          <button
            onClick={onGoBack}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors mr-1 border border-white/5"
            title="Go up one folder level"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          const isRoot = idx === 0;

          return (
            <React.Fragment key={crumb.id || idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
              <button
                onClick={() => onNavigate(idx)}
                disabled={isLast}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all ${
                  isLast
                    ? 'font-semibold text-white bg-white/15 border border-white/20 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-medium'
                }`}
              >
                {isRoot ? (
                  <>
                    <Home className="w-3.5 h-3.5 text-blue-400" />
                    <span>{crumb.name}</span>
                  </>
                ) : (
                  <>
                    <Folder className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate max-w-[150px]">{crumb.name}</span>
                  </>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <div className="text-xs text-slate-400 font-mono">
        {totalFiles} {totalFiles === 1 ? 'item' : 'items'}
      </div>
    </div>
  );
};

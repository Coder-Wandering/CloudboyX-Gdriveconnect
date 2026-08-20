import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Download, 
  Star, 
  Trash2, 
  FileText, 
  Calendar, 
  HardDrive, 
  User, 
  Loader2,
  FileCode,
  Eye
} from 'lucide-react';
import { DriveFile } from '../types/drive';
import { getFileTypeInfo, formatBytes, formatDate } from '../lib/driveUtils';
import { getFileTextPreview, downloadDriveFile } from '../services/driveApi';
import { FileIcon } from './FileIcon';

interface FilePreviewModalProps {
  file: DriveFile | null;
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onToggleStar: (file: DriveFile) => void;
  onTrash: (file: DriveFile, trashed: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  token,
  onToggleStar,
  onTrash,
  showToast,
}) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && file && (file.mimeType.startsWith('text/') || file.mimeType.includes('json') || file.mimeType.includes('javascript') || file.mimeType.includes('typescript') || file.mimeType === 'text/csv')) {
      loadTextPreview(file.id);
    } else {
      setTextContent(null);
    }
  }, [isOpen, file]);

  const loadTextPreview = async (fileId: string) => {
    setIsLoadingText(true);
    try {
      const content = await getFileTextPreview(token, fileId);
      setTextContent(content);
    } catch (err: any) {
      console.warn('Could not load text preview:', err);
      setTextContent(null);
    } finally {
      setIsLoadingText(false);
    }
  };

  if (!isOpen || !file) return null;

  const typeInfo = getFileTypeInfo(file.mimeType, file.name);
  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');
  const isAudio = file.mimeType.startsWith('audio/');
  const isGoogleDoc = file.mimeType.startsWith('application/vnd.google-apps.');
  const isPdf = file.mimeType === 'application/pdf';

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadDriveFile(token, file);
      showToast(`Downloaded "${file.name}" to your Chromebook`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to download file', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
            <FileIcon mimeType={file.mimeType} fileName={file.name} size="sm" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-slate-100 truncate" title={file.name}>
                {file.name}
              </h2>
              <span className={`inline-block text-[11px] font-medium ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Drive</span>
              </a>
            )}

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download</span>
            </button>

            <button
              onClick={() => onToggleStar(file)}
              className={`p-1.5 rounded-xl border transition-all ${
                file.starred
                  ? 'border-amber-400/40 bg-amber-500/20 text-amber-300'
                  : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title={file.starred ? 'Starred' : 'Add star'}
            >
              <Star className={`w-4 h-4 ${file.starred ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/10 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content & Metadata Panels */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950/40">
          
          {/* Main Preview Area */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-auto relative">
            
            {/* Image Preview */}
            {isImage && file.thumbnailLink && (
              <div className="max-w-full max-h-full flex items-center justify-center p-2">
                <img
                  src={file.thumbnailLink.replace(/=s\d+/, '=s1600')}
                  alt={file.name}
                  className="max-h-[65vh] max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Text Preview */}
            {textContent !== null && (
              <div className="w-full h-full bg-slate-900/90 rounded-2xl border border-white/10 shadow-lg p-5 overflow-auto">
                <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap break-all leading-relaxed">
                  {textContent}
                </pre>
              </div>
            )}

            {isLoadingText && (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                <span>Loading preview...</span>
              </div>
            )}

            {/* Google Docs/Sheets/Slides or PDF Preview via iframe */}
            {(isGoogleDoc || isPdf) && file.webViewLink && !textContent && (
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg bg-white border border-white/10 flex flex-col">
                <iframe
                  src={file.webViewLink.replace('/view', '/preview')}
                  className="w-full h-full border-0"
                  title={file.name}
                  allow="autoplay"
                />
              </div>
            )}

            {/* Generic Fallback */}
            {!isImage && !isVideo && !isAudio && !isGoogleDoc && !isPdf && textContent === null && !isLoadingText && (
              <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/10 shadow-lg max-w-sm">
                <FileIcon mimeType={file.mimeType} fileName={file.name} size="lg" />
                <h3 className="mt-4 font-bold text-slate-100 text-sm">{file.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Preview not directly supported in viewer. Open in Google Drive or download to your Chromebook.
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                    >
                      Open in Drive
                    </a>
                  )}
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-80 bg-slate-900/60 border-t md:border-t-0 md:border-l border-white/10 p-6 overflow-y-auto space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              File Details
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <HardDrive className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">File Size</p>
                  <p className="font-semibold text-slate-200 font-mono">
                    {file.mimeType.startsWith('application/vnd.google-apps.') ? 'Google Workspace file' : formatBytes(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">Last Modified</p>
                  <p className="font-semibold text-slate-200">{formatDate(file.modifiedTime)}</p>
                </div>
              </div>

              {file.createdTime && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400">Created</p>
                    <p className="font-semibold text-slate-200">{formatDate(file.createdTime)}</p>
                  </div>
                </div>
              )}

              {file.owners && file.owners.length > 0 && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400">Owner</p>
                    <p className="font-semibold text-slate-200">{file.owners[0].displayName}</p>
                    <p className="text-slate-400 text-[11px]">{file.owners[0].emailAddress}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <FileCode className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-400">MIME Type</p>
                  <p className="font-mono text-[11px] text-slate-300 break-all">{file.mimeType}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  onTrash(file, true);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 rounded-2xl transition-colors border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Move to Trash
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

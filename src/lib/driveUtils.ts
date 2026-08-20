export const formatBytes = (bytesStr?: string | number, decimals = 1): string => {
  if (bytesStr === undefined || bytesStr === null || bytesStr === '') return '--';
  const bytes = typeof bytesStr === 'string' ? parseInt(bytesStr, 10) : bytesStr;
  if (isNaN(bytes) || bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '--';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24 && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

export interface FileTypeInfo {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: 'folder' | 'file-text' | 'table' | 'presentation' | 'file' | 'image' | 'video' | 'music' | 'archive' | 'code';
}

export const getFileTypeInfo = (mimeType?: string, fileName?: string): FileTypeInfo => {
  if (!mimeType) {
    return {
      label: 'File',
      color: 'text-zinc-600',
      bgColor: 'bg-zinc-100',
      borderColor: 'border-zinc-200',
      iconName: 'file',
    };
  }

  if (mimeType === 'application/vnd.google-apps.folder') {
    return {
      label: 'Folder',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconName: 'folder',
    };
  }

  if (mimeType === 'application/vnd.google-apps.document' || mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
    return {
      label: 'Google Doc',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconName: 'file-text',
    };
  }

  if (mimeType === 'application/vnd.google-apps.spreadsheet' || mimeType.includes('spreadsheetml') || mimeType.includes('excel') || mimeType === 'text/csv') {
    return {
      label: 'Google Sheet',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      iconName: 'table',
    };
  }

  if (mimeType === 'application/vnd.google-apps.presentation' || mimeType.includes('presentationml') || mimeType.includes('powerpoint')) {
    return {
      label: 'Google Slides',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconName: 'presentation',
    };
  }

  if (mimeType === 'application/pdf') {
    return {
      label: 'PDF Document',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      iconName: 'file-text',
    };
  }

  if (mimeType.startsWith('image/')) {
    return {
      label: 'Image',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconName: 'image',
    };
  }

  if (mimeType.startsWith('video/')) {
    return {
      label: 'Video',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconName: 'video',
    };
  }

  if (mimeType.startsWith('audio/')) {
    return {
      label: 'Audio',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      iconName: 'music',
    };
  }

  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed') || mimeType.includes('archive')) {
    return {
      label: 'Archive',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconName: 'archive',
    };
  }

  if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('html')) {
    return {
      label: 'Code / Text',
      color: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      iconName: 'code',
    };
  }

  return {
    label: 'File',
    color: 'text-zinc-600',
    bgColor: 'bg-zinc-100',
    borderColor: 'border-zinc-200',
    iconName: 'file',
  };
};

export const isChromebookDevice = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  return /CrOS/.test(window.navigator.userAgent);
};

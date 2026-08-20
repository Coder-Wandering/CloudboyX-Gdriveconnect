import React from 'react';
import { 
  Folder, 
  FileText, 
  Table2, 
  Presentation, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive, 
  Code2 
} from 'lucide-react';
import { getFileTypeInfo } from '../lib/driveUtils';

interface FileIconProps {
  mimeType?: string;
  fileName?: string;
  size?: 'sm' | 'md' | 'lg';
  thumbnailLink?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({
  mimeType,
  fileName,
  size = 'md',
  thumbnailLink,
}) => {
  const typeInfo = getFileTypeInfo(mimeType, fileName);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-9 h-9',
  };

  const containerSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  // If there is an image thumbnail and it's large mode, display thumbnail
  if (thumbnailLink && size === 'lg' && mimeType?.startsWith('image/')) {
    return (
      <div className={`${containerSizes[size]} overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0`}>
        <img
          src={thumbnailLink}
          alt={fileName || 'Thumbnail'}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const renderIcon = () => {
    switch (typeInfo.iconName) {
      case 'folder':
        return <Folder className={`${sizeClasses[size]} ${typeInfo.color} fill-amber-400/30`} />;
      case 'file-text':
        return <FileText className={`${sizeClasses[size]} ${typeInfo.color}`} />;
      case 'table':
        return <Table2 className={`${sizeClasses[size]} ${typeInfo.color}`} />;
      case 'presentation':
        return <Presentation className={`${sizeClasses[size]} ${typeInfo.color}`} />;
      case 'image':
        return <ImageIcon className={`${sizeClasses[size]} ${typeInfo.color}`} />;
      case 'video':
        return <Video className={`${sizeClasses[size]} ${typeInfo.color}`} />;
      case 'music':
        return <Music className={`${sizeClasses[size]} ${typeInfo.color}`} />;
      case 'archive':
        return <Archive className={`${sizeClasses[size]} ${typeInfo.color}`} />;
      case 'code':
        return <Code2 className={`${sizeClasses[size]} ${typeInfo.color}`} />;
      default:
        return <File className={`${sizeClasses[size]} ${typeInfo.color}`} />;
    }
  };

  return (
    <div className={`flex items-center justify-center shrink-0 ${containerSizes[size]} ${typeInfo.bgColor} border ${typeInfo.borderColor}`}>
      {renderIcon()}
    </div>
  );
};

export interface DriveUser {
  displayName: string;
  emailAddress: string;
  photoLink?: string;
  me?: boolean;
}

export interface StorageQuota {
  limit?: string; // Total in bytes
  usage?: string; // Used in bytes
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

export interface DriveAboutInfo {
  user: DriveUser;
  storageQuota: StorageQuota;
}

export interface DriveFileOwner {
  displayName: string;
  emailAddress: string;
  photoLink?: string;
  me?: boolean;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  parents?: string[];
  starred?: boolean;
  trashed?: boolean;
  owners?: DriveFileOwner[];
  sharedWithMeTime?: string;
}

export interface FolderBreadcrumb {
  id: string;
  name: string;
}

export type ViewMode = 'grid' | 'list';

export type NavTab = 
  | 'my-drive' 
  | 'chromebook-backups' 
  | 'recent' 
  | 'starred' 
  | 'shared' 
  | 'trash' 
  | 'storage-analyzer' 
  | 'chromebook-guide';

export type FileFilterCategory = 
  | 'all' 
  | 'folders' 
  | 'documents' 
  | 'spreadsheets' 
  | 'presentations' 
  | 'pdfs' 
  | 'images' 
  | 'media' 
  | 'archives';

export type SortField = 'name' | 'modifiedTime' | 'quotaBytesUsed';
export type SortOrder = 'asc' | 'desc';

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  driveFile?: DriveFile;
}

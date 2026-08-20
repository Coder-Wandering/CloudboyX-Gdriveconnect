import { DriveAboutInfo, DriveFile, FileFilterCategory, SortField, SortOrder } from '../types/drive';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export interface ListFilesOptions {
  folderId?: string | null;
  searchQuery?: string;
  category?: FileFilterCategory;
  starredOnly?: boolean;
  trashedOnly?: boolean;
  sharedWithMe?: boolean;
  chromebookBackupsOnly?: boolean;
  chromebookBackupFolderId?: string | null;
  sortField?: SortField;
  sortOrder?: SortOrder;
  pageSize?: number;
}

export const fetchAboutInfo = async (token: string): Promise<DriveAboutInfo> => {
  const response = await fetch(`${DRIVE_API_BASE}/about?fields=user,storageQuota`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Drive account info (${response.status})`);
  }

  return response.json();
};

export const listDriveFiles = async (
  token: string,
  options: ListFilesOptions = {}
): Promise<DriveFile[]> => {
  const queryParts: string[] = [];

  // Trashed state
  if (options.trashedOnly) {
    queryParts.push('trashed = true');
  } else {
    queryParts.push('trashed = false');
  }

  // Starred filter
  if (options.starredOnly) {
    queryParts.push('starred = true');
  }

  // Shared with me
  if (options.sharedWithMe) {
    queryParts.push('sharedWithMe = true');
  }

  // Folder filtering (only when not searching globally or when specific folder requested)
  if (!options.searchQuery && !options.starredOnly && !options.trashedOnly && !options.sharedWithMe) {
    if (options.folderId) {
      queryParts.push(`'${options.folderId}' in parents`);
    } else {
      queryParts.push(`'root' in parents`);
    }
  }

  // Text search
  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    const cleanSearch = options.searchQuery.trim().replace(/'/g, "\\'");
    queryParts.push(`name contains '${cleanSearch}'`);
  }

  // Category filter
  if (options.category && options.category !== 'all') {
    switch (options.category) {
      case 'folders':
        queryParts.push("mimeType = 'application/vnd.google-apps.folder'");
        break;
      case 'documents':
        queryParts.push("(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType contains 'text/' or mimeType contains 'wordprocessingml')");
        break;
      case 'spreadsheets':
        queryParts.push("(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType contains 'spreadsheetml' or mimeType contains 'excel' or mimeType = 'text/csv')");
        break;
      case 'presentations':
        queryParts.push("(mimeType = 'application/vnd.google-apps.presentation' or mimeType contains 'presentationml' or mimeType contains 'powerpoint')");
        break;
      case 'pdfs':
        queryParts.push("mimeType = 'application/pdf'");
        break;
      case 'images':
        queryParts.push("mimeType contains 'image/'");
        break;
      case 'media':
        queryParts.push("(mimeType contains 'video/' or mimeType contains 'audio/')");
        break;
      case 'archives':
        queryParts.push("(mimeType contains 'zip' or mimeType contains 'tar' or mimeType contains 'gzip' or mimeType contains 'compressed' or mimeType contains 'archive')");
        break;
    }
  }

  const q = queryParts.join(' and ');

  let orderBy = 'folder,';
  const sortField = options.sortField || 'name';
  const sortOrder = options.sortOrder || 'asc';
  
  if (sortField === 'name') {
    orderBy += `name ${sortOrder}`;
  } else if (sortField === 'modifiedTime') {
    orderBy += `modifiedTime ${sortOrder}`;
  } else if (sortField === 'quotaBytesUsed') {
    orderBy += `quotaBytesUsed ${sortOrder}`;
  }

  const params = new URLSearchParams({
    q,
    fields: 'files(id,name,mimeType,size,modifiedTime,createdTime,iconLink,thumbnailLink,webViewLink,webContentLink,parents,starred,trashed,owners,sharedWithMeTime)',
    pageSize: (options.pageSize || 100).toString(),
    orderBy,
  });

  const response = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to list Drive files (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
};

export const createDriveFolder = async (
  token: string,
  name: string,
  parentId?: string | null
): Promise<DriveFile> => {
  const metadata: Record<string, any> = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const response = await fetch(`${DRIVE_API_BASE}/files?fields=id,name,mimeType,modifiedTime,parents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create folder (${response.status})`);
  }

  return response.json();
};

export const findOrCreateChromebookBackupFolder = async (
  token: string
): Promise<DriveFile> => {
  // Check if "Chromebook Backups" folder exists in root
  const q = "name = 'Chromebook Backups' and mimeType = 'application/vnd.google-apps.folder' and 'root' in parents and trashed = false";
  const params = new URLSearchParams({
    q,
    fields: 'files(id,name,mimeType)',
    pageSize: '1',
  });

  const checkResponse = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (checkResponse.ok) {
    const data = await checkResponse.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
  }

  // Create folder if not found
  return createDriveFolder(token, 'Chromebook Backups', null);
};

export const createGoogleWorkspaceDocument = async (
  token: string,
  name: string,
  type: 'doc' | 'sheet' | 'slide' | 'note',
  parentId?: string | null
): Promise<DriveFile> => {
  let mimeType = 'application/vnd.google-apps.document';
  let defaultExt = '';

  if (type === 'sheet') {
    mimeType = 'application/vnd.google-apps.spreadsheet';
  } else if (type === 'slide') {
    mimeType = 'application/vnd.google-apps.presentation';
  } else if (type === 'note') {
    mimeType = 'text/plain';
    defaultExt = '.txt';
  }

  const finalName = name.endsWith(defaultExt) ? name : `${name}${defaultExt}`;

  const metadata: Record<string, any> = {
    name: finalName,
    mimeType,
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const response = await fetch(`${DRIVE_API_BASE}/files?fields=id,name,mimeType,webViewLink,iconLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create file (${response.status})`);
  }

  return response.json();
};

export const uploadFileWithProgress = (
  token: string,
  file: File,
  parentId?: string | null,
  onProgress?: (percent: number) => void
): Promise<DriveFile> => {
  return new Promise((resolve, reject) => {
    const metadata: Record<string, any> = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from disk'));
    reader.onload = () => {
      const fileData = reader.result as ArrayBuffer;

      const xhr = new XMLHttpRequest();
      xhr.open(
        'POST',
        `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink`
      );
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', `multipart/related; boundary=${boundary}`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (onProgress) onProgress(100);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid response from Google Drive'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error?.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));

      // Construct multipart body with binary payload
      const metaPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
      const fileHeader = `${delimiter}Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;
      
      const metaBlob = new Blob([metaPart]);
      const fileHeaderBlob = new Blob([fileHeader]);
      const fileBlob = new Blob([fileData]);
      const closeBlob = new Blob([closeDelimiter]);

      const multipartBody = new Blob([metaBlob, fileHeaderBlob, fileBlob, closeBlob], {
        type: `multipart/related; boundary=${boundary}`,
      });

      xhr.send(multipartBody);
    };

    reader.readAsArrayBuffer(file);
  });
};

export const updateFileMetadata = async (
  token: string,
  fileId: string,
  updates: { name?: string; starred?: boolean; trashed?: boolean }
): Promise<DriveFile> => {
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,starred,trashed,modifiedTime`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to update file (${response.status})`);
  }

  return response.json();
};

export const moveDriveFile = async (
  token: string,
  fileId: string,
  newParentId: string,
  currentParentId?: string
): Promise<DriveFile> => {
  const params = new URLSearchParams({
    addParents: newParentId,
    fields: 'id,name,parents',
  });

  if (currentParentId) {
    params.set('removeParents', currentParentId);
  }

  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?${params.toString()}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to move file (${response.status})`);
  }

  return response.json();
};

export const deleteFilePermanently = async (
  token: string,
  fileId: string
): Promise<void> => {
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete file (${response.status})`);
  }
};

export const emptyDriveTrash = async (token: string): Promise<void> => {
  const response = await fetch(`${DRIVE_API_BASE}/files/trash`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to empty trash (${response.status})`);
  }
};

export const downloadDriveFile = async (
  token: string,
  file: DriveFile
): Promise<void> => {
  let downloadUrl = `${DRIVE_API_BASE}/files/${file.id}?alt=media`;
  let filename = file.name;

  // For Google Workspace native files, export them into standard formats
  if (file.mimeType === 'application/vnd.google-apps.document') {
    downloadUrl = `${DRIVE_API_BASE}/files/${file.id}/export?mimeType=application/pdf`;
    if (!filename.endsWith('.pdf')) filename += '.pdf';
  } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
    downloadUrl = `${DRIVE_API_BASE}/files/${file.id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
    if (!filename.endsWith('.xlsx')) filename += '.xlsx';
  } else if (file.mimeType === 'application/vnd.google-apps.presentation') {
    downloadUrl = `${DRIVE_API_BASE}/files/${file.id}/export?mimeType=application/pdf`;
    if (!filename.endsWith('.pdf')) filename += '.pdf';
  }

  const response = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download file (${response.status})`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const getFileTextPreview = async (
  token: string,
  fileId: string
): Promise<string> => {
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve file content');
  }

  return response.text();
};

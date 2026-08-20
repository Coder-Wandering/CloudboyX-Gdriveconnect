import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './lib/auth';
import { 
  DriveAboutInfo, 
  DriveFile, 
  FolderBreadcrumb, 
  NavTab, 
  FileFilterCategory, 
  SortField, 
  SortOrder 
} from './types/drive';
import { 
  fetchAboutInfo, 
  listDriveFiles, 
  findOrCreateChromebookBackupFolder,
  updateFileMetadata,
  deleteFilePermanently,
  downloadDriveFile
} from './services/driveApi';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DriveExplorer } from './components/DriveExplorer';
import { UploadModal } from './components/UploadModal';
import { NewItemModal } from './components/NewItemModal';
import { RenameModal } from './components/RenameModal';
import { MoveModal } from './components/MoveModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { StorageAnalyzer } from './components/StorageAnalyzer';
import { ChromebookGuideModal } from './components/ChromebookGuideModal';
import { AuthScreen } from './components/AuthScreen';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Drive Data State
  const [aboutInfo, setAboutInfo] = useState<DriveAboutInfo | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [chromebookBackupFolder, setChromebookBackupFolder] = useState<DriveFile | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Auto-Sync State
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('chromebook_drive_autosync_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [autoSyncInterval, setAutoSyncInterval] = useState<number>(() => {
    const saved = localStorage.getItem('chromebook_drive_autosync_interval');
    return saved ? parseInt(saved, 10) || 30 : 30;
  });
  const [autoSyncCountdown, setAutoSyncCountdown] = useState<number>(30);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => new Date());

  // Navigation & Filter State
  const [currentTab, setCurrentTab] = useState<NavTab>('my-drive');
  const [breadcrumbs, setBreadcrumbs] = useState<FolderBreadcrumb[]>([
    { id: 'root', name: 'My Drive' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<FileFilterCategory>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [renamingFile, setRenamingFile] = useState<DriveFile | null>(null);
  const [movingFile, setMovingFile] = useState<DriveFile | null>(null);
  const [previewingFile, setPreviewingFile] = useState<DriveFile | null>(null);

  // Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initialize Auth on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, accessToken) => {
        setUser(authedUser);
        setToken(accessToken);
        setIsAuthChecking(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthChecking(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Google Sign-In Trigger
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        showToast('Connected to Google Drive successfully!', 'success');
      }
    } catch (err: any) {
      console.error('Sign-in failure:', err);
      setAuthError(err.message || 'Could not complete Google Sign-in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 3. Logout Trigger
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setAboutInfo(null);
      setFiles([]);
      showToast('Signed out of Google Drive', 'info');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // 4. Fetch Account & Drive About Info
  const loadAboutInfo = useCallback(async () => {
    if (!token) return;
    try {
      const info = await fetchAboutInfo(token);
      setAboutInfo(info);
    } catch (err: any) {
      console.error('Failed to load Drive about info:', err);
    }
  }, [token]);

  // 5. Initialize or Find Chromebook Backup Folder
  const initChromebookFolder = useCallback(async () => {
    if (!token) return;
    try {
      const folder = await findOrCreateChromebookBackupFolder(token);
      setChromebookBackupFolder(folder);
    } catch (err: any) {
      console.error('Failed to initialize Chromebook backup folder:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadAboutInfo();
      initChromebookFolder();
    }
  }, [token, loadAboutInfo, initChromebookFolder]);

  // 6. Fetch Drive Files depending on current tab, folder, category, and search query
  const loadFiles = useCallback(async (isBackground = false) => {
    if (!token) return;
    if (isBackground) {
      setIsAutoSyncing(true);
    } else {
      setIsLoadingFiles(true);
    }

    try {
      const currentFolder = breadcrumbs[breadcrumbs.length - 1];
      const folderId = currentFolder.id === 'root' ? null : currentFolder.id;

      let starredOnly = false;
      let trashedOnly = false;
      let sharedWithMe = false;
      let effectiveFolderId = folderId;

      if (currentTab === 'starred') {
        starredOnly = true;
      } else if (currentTab === 'trash') {
        trashedOnly = true;
      } else if (currentTab === 'shared') {
        sharedWithMe = true;
      } else if (currentTab === 'chromebook-backups' && chromebookBackupFolder) {
        // If on the root of chromebook-backups tab and no subfolder visited yet
        if (breadcrumbs.length === 1) {
          effectiveFolderId = chromebookBackupFolder.id;
        }
      }

      const fetchedFiles = await listDriveFiles(token, {
        folderId: effectiveFolderId,
        searchQuery: searchQuery.trim() || undefined,
        category: selectedCategory,
        starredOnly,
        trashedOnly,
        sharedWithMe,
        sortField,
        sortOrder,
        pageSize: 100,
      });

      setFiles(fetchedFiles);
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Failed to list files:', err);
      if (!isBackground) {
        showToast(err.message || 'Failed to sync files with Google Drive', 'error');
      }
    } finally {
      setIsLoadingFiles(false);
      setIsAutoSyncing(false);
    }
  }, [
    token, 
    currentTab, 
    breadcrumbs, 
    selectedCategory, 
    sortField, 
    sortOrder, 
    searchQuery, 
    chromebookBackupFolder, 
    showToast
  ]);

  useEffect(() => {
    if (token && currentTab !== 'storage-analyzer' && currentTab !== 'chromebook-guide') {
      loadFiles(false);
    }
  }, [token, currentTab, breadcrumbs, selectedCategory, sortField, sortOrder, searchQuery, loadFiles]);

  // Auto-Sync Control Handlers
  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    localStorage.setItem('chromebook_drive_autosync_enabled', String(enabled));
    if (enabled) {
      setAutoSyncCountdown(autoSyncInterval);
      showToast(`Auto-Sync activated (${autoSyncInterval}s interval)`, 'info');
    } else {
      showToast('Auto-Sync paused', 'info');
    }
  };

  const handleChangeAutoSyncInterval = (interval: number) => {
    setAutoSyncInterval(interval);
    setAutoSyncCountdown(interval);
    localStorage.setItem('chromebook_drive_autosync_interval', String(interval));
    const intervalLabel = interval < 60 ? `${interval} seconds` : `${Math.round(interval / 60)} minute(s)`;
    showToast(`Auto-Sync interval set to ${intervalLabel}`, 'info');
  };

  const handleManualRefresh = async () => {
    setAutoSyncCountdown(autoSyncInterval);
    await Promise.all([loadFiles(false), loadAboutInfo()]);
    setLastSyncedAt(new Date());
    showToast('Drive files and storage quota refreshed', 'success');
  };

  // Auto-Sync Periodic Timer
  useEffect(() => {
    if (!token || !autoSyncEnabled || isLoggingIn || isAuthChecking) {
      return;
    }

    const timer = setInterval(() => {
      setAutoSyncCountdown((prev) => {
        if (prev <= 1) {
          // Trigger background fetch
          if (currentTab !== 'storage-analyzer' && currentTab !== 'chromebook-guide') {
            loadFiles(true);
          }
          loadAboutInfo();
          return autoSyncInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [token, autoSyncEnabled, autoSyncInterval, isLoggingIn, isAuthChecking, currentTab, loadFiles, loadAboutInfo]);

  // Folder navigation handlers
  const handleOpenFolder = (folder: DriveFile) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearchQuery('');
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setSearchQuery('');
  };

  const handleGoBackFolder = () => {
    if (breadcrumbs.length > 1) {
      setBreadcrumbs((prev) => prev.slice(0, prev.length - 1));
      setSearchQuery('');
    }
  };

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    setSearchQuery('');
    setSelectedCategory('all');

    if (tab === 'my-drive') {
      setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
    } else if (tab === 'chromebook-backups') {
      if (chromebookBackupFolder) {
        setBreadcrumbs([{ id: chromebookBackupFolder.id, name: 'Chromebook Backups' }]);
      } else {
        setBreadcrumbs([{ id: 'root', name: 'Chromebook Backups' }]);
      }
    } else if (tab === 'starred') {
      setBreadcrumbs([{ id: 'starred', name: 'Starred Items' }]);
    } else if (tab === 'shared') {
      setBreadcrumbs([{ id: 'shared', name: 'Shared with Me' }]);
    } else if (tab === 'trash') {
      setBreadcrumbs([{ id: 'trash', name: 'Trash' }]);
    }
  };

  // File Operations
  const handleToggleStar = async (file: DriveFile) => {
    if (!token) return;
    const newStarred = !file.starred;
    try {
      await updateFileMetadata(token, file.id, { starred: newStarred });
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, starred: newStarred } : f))
      );
      showToast(newStarred ? `Added "${file.name}" to Starred` : `Removed star from "${file.name}"`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update star', 'error');
    }
  };

  const handleTrash = async (file: DriveFile, trashed: boolean) => {
    if (!token) return;
    try {
      await updateFileMetadata(token, file.id, { trashed });
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      showToast(trashed ? `Moved "${file.name}" to Trash` : `Restored "${file.name}"`, 'success');
      loadAboutInfo();
    } catch (err: any) {
      showToast(err.message || 'Failed to update file status', 'error');
    }
  };

  const handlePermanentDelete = async (file: DriveFile) => {
    if (!token) return;
    if (!window.confirm(`Permanently delete "${file.name}"? This cannot be undone.`)) return;

    try {
      await deleteFilePermanently(token, file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      showToast(`Permanently deleted "${file.name}"`, 'success');
      loadAboutInfo();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete file', 'error');
    }
  };

  const handleBatchTrash = async (batchFiles: DriveFile[]) => {
    if (!token || batchFiles.length === 0) return;
    const isTrashed = currentTab === 'trash';
    
    for (const f of batchFiles) {
      try {
        if (isTrashed) {
          await deleteFilePermanently(token, f.id);
        } else {
          await updateFileMetadata(token, f.id, { trashed: true });
        }
      } catch (e) {
        console.error(e);
      }
    }
    showToast(isTrashed ? `Deleted ${batchFiles.length} items permanently` : `Moved ${batchFiles.length} items to Trash`, 'success');
    loadFiles();
    loadAboutInfo();
  };

  const handleBatchDownload = async (batchFiles: DriveFile[]) => {
    if (!token || batchFiles.length === 0) return;
    showToast(`Starting download for ${batchFiles.length} files...`, 'info');
    for (const f of batchFiles) {
      if (f.mimeType !== 'application/vnd.google-apps.folder') {
        try {
          await downloadDriveFile(token, f);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleCopyLink = (file: DriveFile) => {
    if (file.webViewLink) {
      navigator.clipboard.writeText(file.webViewLink);
      showToast('Copied Drive link to clipboard', 'success');
    }
  };

  // If initial auth check is in progress or not signed in
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-3.5 bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="w-10 h-10 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-slate-300">Connecting to Chromebook Drive Bridge...</span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <>
        <AuthScreen
          onSignIn={handleSignIn}
          isLoggingIn={isLoggingIn}
          error={authError}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const currentFolder = breadcrumbs[breadcrumbs.length - 1] || { id: 'root', name: 'My Drive' };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col font-sans text-slate-100 relative overflow-x-hidden selection:bg-blue-500/30 selection:text-white">
      {/* Frosted Glass Ambient Glowing Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[20%] right-[10%] w-[350px] h-[350px] bg-cyan-400/15 rounded-full blur-[100px] pointer-events-none z-0" />
      
      {/* Top Header */}
      <Header
        aboutInfo={aboutInfo}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onRefresh={handleManualRefresh}
        onLogout={handleLogout}
        isLoading={isLoadingFiles}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={handleToggleAutoSync}
        autoSyncInterval={autoSyncInterval}
        onChangeAutoSyncInterval={handleChangeAutoSyncInterval}
        autoSyncCountdown={autoSyncCountdown}
        isAutoSyncing={isAutoSyncing}
        lastSyncedAt={lastSyncedAt}
      />

      {/* Main Body with Sidebar and Explorer */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10 p-2 sm:p-4 gap-4">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onOpenNewItem={() => setIsNewItemOpen(true)}
          aboutInfo={aboutInfo}
          onOpenStorageAnalyzer={() => setCurrentTab('storage-analyzer')}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col">
          {currentTab === 'storage-analyzer' ? (
            <StorageAnalyzer
              token={token}
              aboutInfo={aboutInfo}
              onRefreshAbout={loadAboutInfo}
              onPreviewFile={(f) => setPreviewingFile(f)}
              onDownloadFile={(f) => downloadDriveFile(token, f)}
              onTrashFile={handleTrash}
              showToast={showToast}
            />
          ) : currentTab === 'chromebook-guide' ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100">Chromebook & Google Drive Quick Manual</h2>
                  <p className="text-xs sm:text-sm text-slate-400">How to get the best experience on ChromeOS devices</p>
                </div>
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="px-4 py-2 bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  Open Interactive Guide
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:bg-white/[0.08] transition-colors">
                  <h3 className="text-sm font-bold text-slate-200">1. Instant Files App Shortcut</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[11px] font-mono font-bold text-slate-200">Alt + Shift + M</kbd> anywhere in ChromeOS to open the Files app. Google Drive will be listed in the left sidebar.
                  </p>
                </div>

                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:bg-white/[0.08] transition-colors">
                  <h3 className="text-sm font-bold text-slate-200">2. Automatic Download Syncing</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Set your browser download folder to Google Drive (<code className="text-[11px] font-mono bg-white/10 px-1 py-0.5 rounded text-blue-300">chrome://settings/downloads</code>) so school or work files are always backed up in the cloud.
                  </p>
                </div>

                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:bg-white/[0.08] transition-colors">
                  <h3 className="text-sm font-bold text-slate-200">3. Offline Files Toggle</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Right click any file in the Drive list and toggle "Available offline". This caches the document locally on your Chromebook for plane rides and offline classrooms.
                  </p>
                </div>

                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:bg-white/[0.08] transition-colors">
                  <h3 className="text-sm font-bold text-slate-200">4. Spacebar File Quick-Look</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select any file in this app and click quick preview to instantly inspect documents, spreadsheets, images, and code files without downloading.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <DriveExplorer
              files={files}
              isLoading={isLoadingFiles}
              currentTab={currentTab}
              breadcrumbs={breadcrumbs}
              onNavigateBreadcrumb={handleNavigateBreadcrumb}
              onGoBackFolder={handleGoBackFolder}
              onOpenFolder={handleOpenFolder}
              onPreviewFile={(f) => setPreviewingFile(f)}
              onDownloadFile={(f) => downloadDriveFile(token, f)}
              onToggleStarFile={handleToggleStar}
              onRenameFile={(f) => setRenamingFile(f)}
              onMoveFile={(f) => setMovingFile(f)}
              onTrashFile={handleTrash}
              onPermanentDeleteFile={handlePermanentDelete}
              onCopyLink={handleCopyLink}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenNewItem={() => setIsNewItemOpen(true)}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={(f, o) => {
                setSortField(f);
                setSortOrder(o);
              }}
              searchQuery={searchQuery}
              onBatchTrash={handleBatchTrash}
              onBatchDownload={handleBatchDownload}
            />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        token={token}
        currentFolder={currentFolder}
        chromebookBackupFolder={chromebookBackupFolder}
        onUploadCompleted={() => {
          loadFiles();
          loadAboutInfo();
        }}
        showToast={showToast}
      />

      <NewItemModal
        isOpen={isNewItemOpen}
        onClose={() => setIsNewItemOpen(false)}
        token={token}
        currentFolder={currentFolder}
        onItemCreated={() => {
          loadFiles();
          loadAboutInfo();
        }}
        showToast={showToast}
      />

      <RenameModal
        isOpen={!!renamingFile}
        file={renamingFile}
        onClose={() => setRenamingFile(null)}
        token={token}
        onRenamed={() => {
          loadFiles();
          loadAboutInfo();
        }}
        showToast={showToast}
      />

      <MoveModal
        isOpen={!!movingFile}
        file={movingFile}
        onClose={() => setMovingFile(null)}
        token={token}
        onMoved={() => {
          loadFiles();
          loadAboutInfo();
        }}
        showToast={showToast}
      />

      <FilePreviewModal
        isOpen={!!previewingFile}
        file={previewingFile}
        onClose={() => setPreviewingFile(null)}
        token={token}
        onToggleStar={handleToggleStar}
        onTrash={handleTrash}
        showToast={showToast}
      />

      <ChromebookGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}

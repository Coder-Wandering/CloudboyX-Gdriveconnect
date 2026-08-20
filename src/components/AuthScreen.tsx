import React from 'react';
import { 
  Laptop, 
  HardDrive, 
  FolderSync, 
  ShieldCheck, 
  Sparkles, 
  Cloud,
  CheckCircle2
} from 'lucide-react';

interface AuthScreenProps {
  onSignIn: () => void;
  isLoggingIn: boolean;
  error?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSignIn,
  isLoggingIn,
  error,
}) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background Frosted Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[15%] w-[350px] h-[350px] bg-cyan-400/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-white/[0.04] backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 overflow-hidden relative z-10">
        
        {/* Top Hero Section */}
        <div className="p-8 sm:p-12 text-center border-b border-white/10 bg-white/[0.02]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30 mb-6 ring-4 ring-white/10">
            <Laptop className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Connect Chromebook to Google Drive
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
            Seamlessly bridge your ChromeOS device with Google Drive. Browse files, backup local downloads, organize folders, and monitor your cloud storage.
          </p>

          {/* Official Google Sign In Button */}
          <div className="mt-8 flex flex-col items-center justify-center">
            <button
              id="google-signin-btn"
              onClick={onSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold shadow-xl shadow-black/20 hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
            >
              {/* Official Google 'G' SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>{isLoggingIn ? 'Connecting to Google Drive...' : 'Sign in with Google'}</span>
            </button>

            {error && (
              <p className="mt-3.5 text-xs text-rose-300 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20">
                {error}
              </p>
            )}

            <p className="mt-3 text-xs text-slate-400">
              Access your Google Drive files securely with permission.
            </p>
          </div>
        </div>

        {/* Chromebook Features Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-500/30">
              <FolderSync className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">ChromeOS Downloads Sync</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Upload local Chromebook files, screenshots, and downloads directly into Google Drive folders.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Free Up Local Storage</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Analyze large files taking up disk space and manage your 15GB+ Google Drive cloud storage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Instant File Previews</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Preview Docs, Sheets, Slides, PDFs, photos, and code without needing third-party viewer apps.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Chromebook Guide & Shortcuts</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Built-in shortcut guide for Files app integration, offline files setup, and cloud workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Compatible with all ChromeOS devices
          </span>
          <span className="font-mono text-[11px] text-slate-400">Google Drive API v3</span>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { Square, Loader2, Pause, Play } from 'lucide-react';

export default function StatusBanner({ 
  status, 
  actionType, 
  timer, 
  fileName, 
  formatTime, 
  handleStop,
  handlePause,
  handleResume,
  uploadProgress = 0,
  errorMessage = '',
  onRetry,
  activityMessage = '',
  isUploading = false
}) {

  if ((status === "recording" || status === "paused") && actionType !== "upload_file") {
    const isActive = status === "recording";

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex w-full min-w-0 flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="flex h-3 w-3 relative">
            {isActive && (
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-red-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="font-semibold text-blue-900">
            {actionType === "live_transcription" 
              ? (isActive ? "Live Transcription in progress..." : "Live Transcription paused") 
              : (isActive ? "Recording in progress..." : "Recording paused")}
          </span>
          {activityMessage && <span className="w-full text-xs text-blue-700">{activityMessage}</span>}
          
          <span className="text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded-md">{formatTime(timer)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isActive ? (
            <button 
              onClick={handlePause} 
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Pause size={14} fill="currentColor" /> Pause
            </button>
          ) : (
            <button 
              onClick={handleResume} 
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Play size={14} fill="currentColor" /> Resume
            </button>
          )}

          <button 
            onClick={handleStop} 
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Square size={14} fill="currentColor" /> Stop
          </button>
        </div>
      </div>
    );
  }

  if (status === 'requesting_mic') return <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">Requesting microphone permission…</div>;
  if (status === 'initializing_recorder') return <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">Microphone ready. Preparing the recording…</div>;

  if (isUploading || status === "uploading") {
    return (
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex w-full min-w-0 flex-wrap items-center gap-3">
        <Loader2 className="animate-spin text-violet-600" size={20} />
        <span className="font-semibold text-violet-900">Uploading {fileName || 'recording'}… {uploadProgress}%</span>
        <div className="w-full h-2 rounded-full bg-violet-100 overflow-hidden" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100">
          <div className="h-full bg-violet-600 transition-all" style={{ width: `${uploadProgress}%` }} />
        </div>
      </div>
    );
  }

  if (status === 'processing_ai') return <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center gap-3"><Loader2 className="animate-spin text-violet-600" size={20} /> AI is analyzing the uploaded recording…</div>;
  if (status === 'error') return <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800"><p>{errorMessage || 'Something went wrong.'}</p><button onClick={onRetry} className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Retry</button></div>;

  return null;
}

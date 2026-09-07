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
  handleResume
}) {

  if ((status === "active" || status === "paused") && actionType !== "upload_file") {
    const isActive = status === "active";

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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
          
          <span className="text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded-md">{formatTime(timer)}</span>
        </div>
        <div className="flex items-center gap-2">
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

  if (status === "processing") {
    return (
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center gap-3">
        <Loader2 className="animate-spin text-violet-600" size={20} />
        <span className="font-semibold text-violet-900">
          {actionType === "upload_file" ? `Uploading & Processing "${fileName}"... Please wait.` : "AI is analyzing and generating summaries... Please wait."}
        </span>
      </div>
    );
  }

  return null;
}
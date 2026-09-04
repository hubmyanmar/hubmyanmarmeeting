import React from 'react';
import { Square, Loader2 } from 'lucide-react';

export default function StatusBanner({ status, actionType, timer, fileName, formatTime, handleStop }) {
  if (status === "active" && actionType !== "upload_file") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
          <span className="font-semibold text-blue-900">{actionType === "live_transcription" ? "Live Transcription in progress..." : "Recording in progress..."}</span>
          <span className="text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded-md">{formatTime(timer)}</span>
        </div>
        <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm">
          <Square size={14} fill="currentColor" /> Stop
        </button>
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
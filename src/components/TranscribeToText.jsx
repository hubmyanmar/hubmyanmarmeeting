import React, { useState, useEffect } from "react";
import { ChevronLeft, Loader2, Copy, Save, FileText, CheckCircle2 } from "lucide-react";

export default function TranscribeToText({ goBack, onSave }) {
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [transcript, setTranscript] = useState(
    "This is the transcribed text from your audio file. The system successfully converted your speech into text. You can now edit this note, copy it to your clipboard, or save it directly to your application."
  );

  // Loading Simulation Logic
  useEffect(() => {
    if (!isTranscribing) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTranscribing(false);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isTranscribing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="max-w-md mx-auto pt-6 px-4 md:px-0 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={goBack} 
          className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-all shadow-sm"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <h2 className="font-bold text-lg text-gray-800 tracking-tight">
          {isTranscribing ? "Processing" : "Review Note"}
        </h2>
        <div className="w-10" />
      </div>

      <div className="bg-white p-2 rounded-[28px] shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
        <div className="p-5 bg-[#f8f9fc] rounded-[24px] h-full flex-1 flex flex-col">
          
          {isTranscribing ? (
            /* Loading State (Processing UI) */
            <div className="flex-1 flex flex-col items-center justify-center py-10 animate-in zoom-in-95 duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-violet-200 rounded-full blur-[40px] opacity-50"></div>
                <div className="w-20 h-20 bg-white rounded-full shadow-lg shadow-violet-100 flex items-center justify-center relative z-10">
                  <Loader2 size={36} className="text-violet-600 animate-spin" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">Transcribing audio...</h3>
              <p className="text-sm text-gray-500 mb-8 text-center max-w-[220px] leading-relaxed">
                Please wait while we convert your media into text.
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-[240px]">
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
                  <span>Processing</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-violet-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Result State (Editing UI) */
            <div className="flex-1 flex flex-col animate-in fade-in duration-500">
              <div className="flex items-center gap-2 text-violet-700 mb-4 px-1">
                <FileText size={18} />
                <span className="font-bold text-sm">Transcription Result</span>
              </div>
              
              {/* Text Editor Area */}
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full flex-1 bg-white border border-gray-200 rounded-2xl p-4 text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all min-h-[220px]"
                placeholder="Start typing your note here..."
              />

              <div className="flex items-center justify-between mt-4 mb-2 px-2 text-xs font-medium text-gray-500">
                <span>{transcript.split(/\s+/).filter((word) => word.length > 0).length} Words</span>
                
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-violet-600 transition-colors"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy Text"}
                </button>
              </div>

              {/* Action Button */}
              <button 
                onClick={onSave}
                className="w-full mt-auto pt-4 pb-1"
              >
                <div className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-200 hover:-translate-y-0.5 transition-all duration-300">
                  <Save size={18} />
                  Save Note
                </div>
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
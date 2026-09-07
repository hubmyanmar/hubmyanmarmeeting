import React, { useState, useEffect, useMemo } from 'react';
import { Mic, Play, Download, Pause } from 'lucide-react';

const SkeletonText = ({ lines = 3 }) => (
  <div className="animate-pulse flex flex-col gap-3">
    {[...Array(lines)].map((_, i) => (
      <div key={i} className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
    ))}
  </div>
);

export default function LeftPanel({ 
  status, 
  timer, 
  formatTime,
  handlePause,
  handleResume
}) {
  const [isEditingEnglish, setIsEditingEnglish] = useState(false);
  const [englishSummary, setEnglishSummary] = useState(
    "The meeting discussed partnership opportunities with ABC Company, Q2 sales target, marketing campaign, and product roadmap. The team aligned on key actions and responsibilities."
  );

  const [isEditingMyanmar, setIsEditingMyanmar] = useState(false);
  const [myanmarSummary, setMyanmarSummary] = useState(
    "အစည်းအဝေးတွင် ABC ကုမ္ပဏီနှင့် မိတ်ဖက်ပူးပေါင်းဆောင်ရွက်မည့် အခွင့်အလမ်းများ၊ ဒုတိယသုံးလပတ် အရောင်းရည်မှန်းချက်၊ စျေးကွက်ရှာဖွေရေး ကမ်ပိန်းနှင့် ထုတ်ကုန်လမ်းပြမြေပုံတို့အကြောင်း ဆွေးနွေးခဲ့ကြသည်။ အဖွဲ့သည် အဓိကလုပ်ဆောင်ရမည့်အချက်များနှင့် တာဝန်များကို ညှိနှိုင်းသဘောတူညီခဲ့ကြသည်။"
  );

  const [isPlayingPlayback, setIsPlayingPlayback] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  const staticWaveHeights = useMemo(() => {
    return [...Array(40)].map(() => Math.max(20, Math.random() * 100));
  }, []);

  useEffect(() => {
    let interval;
    if (isPlayingPlayback && playbackTime < timer) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= timer) {
            setIsPlayingPlayback(false);
            return timer;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (playbackTime >= timer && timer > 0) {
      setIsPlayingPlayback(false);
    }
    return () => clearInterval(interval);
  }, [isPlayingPlayback, playbackTime, timer]);

  const isRecording = status === "active";
  const isPaused = status === "paused";
  const isFinished = status === "processing" || status === "done"; 

  // --- Download Function ---
  const handleDownload = () => {
    // မှတ်ချက်: လက်ရှိတွင် Audio အစစ်မရှိပါသဖြင့် Dummy Text File ကို Download လုပ်ပေးပါမည်။
    // အကယ်၍ Parent မှ Audio Blob/URL ပို့ပေးပါက ထို URL ကို ဤနေရာတွင် အသုံးပြုပါ။
    
    const content = "This is a dummy audio transcript or audio blob placeholder.\nTime recorded: " + formatTime(timer);
    
    // Blob ကို ဖန်တီးပါ (အသံဖိုင်အစစ်ဆိုလျှင် type ကို 'audio/webm' သို့မဟုတ် 'audio/mp3' ပြောင်းပါ)
    const blob = new Blob([content], { type: 'text/plain' }); 
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Meeting_Record_${new Date().getTime()}.txt`; // .mp3 သို့မဟုတ် .webm ဟုပြောင်းနိုင်သည်
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Recording & Audio Player Box */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 text-[15px]">
          {isFinished ? "Recorded Audio" : "Recording"}
        </h3>
        
        <div className={`flex items-center gap-4 p-3 rounded-xl border ${(isRecording || isPaused) ? 'bg-red-50/50 border-red-100' : 'bg-[#f8f9fc] border-gray-100'}`}>
          
          <button 
            onClick={() => {
              if (isRecording && handlePause) handlePause();
              else if (isPaused && handleResume) handleResume();
              else if (isFinished) {
                if (playbackTime >= timer) setPlaybackTime(0);
                setIsPlayingPlayback(!isPlayingPlayback);
              }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 transition-colors ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-violet-600 hover:bg-violet-700 shadow-sm'
            }`}
          >
            {isRecording ? (
              <Pause size={18} fill="currentColor" />
            ) : (isFinished && isPlayingPlayback) ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          
          <div className={`flex-1 h-8 flex items-center gap-[2px] overflow-hidden ${isRecording ? 'opacity-100' : 'opacity-80'}`}>
            {[...Array(40)].map((_, i) => {
              const progressPercentage = timer > 0 ? (playbackTime / timer) : 0;
              const isPlayed = isFinished && (i / 40) <= progressPercentage;

              return (
                <div 
                  key={i} 
                  className={`w-[3px] rounded-full transition-all duration-300 ${
                    isRecording ? 'bg-red-500' : 
                    isPlayed ? 'bg-violet-600' : 'bg-gray-300'
                  }`} 
                  style={{ 
                    height: isRecording 
                      ? `${Math.max(20, Math.random() * 100)}%` 
                      : `${staticWaveHeights[i]}%` 
                  }}
                ></div>
              );
            })}
          </div>
          
          <span className="text-xs font-medium text-gray-500 shrink-0 font-mono">
            {isRecording || isPaused 
              ? formatTime(timer) 
              : status === "idle" 
                ? "--:--" 
                : `${formatTime(playbackTime)} / ${formatTime(timer)}` 
            }
          </span>
          <button 
            onClick={handleDownload}
            className={`shrink-0 ml-2 transition-colors ${isFinished ? 'text-gray-500 hover:text-violet-600' : 'text-gray-300 cursor-not-allowed'}`}
            disabled={!isFinished}
            title={isFinished ? "Download Record" : "Cannot download yet"}
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* English Summary */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 text-[15px]">AI Summary (English)</h3>
        {(status === "active" || status === "idle" || status === "paused") ? (
          <div className="py-4 text-gray-400 text-sm text-center">Waiting for processing...</div>
        ) : status === "processing" ? (
          <div className="py-1"><SkeletonText lines={3} /></div>
        ) : (
          <>
            {isEditingEnglish ? (
              <div>
                <textarea
                  value={englishSummary}
                  onChange={(e) => setEnglishSummary(e.target.value)}
                  className="w-full p-3 text-[#475467] text-[14px] leading-[1.6] border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-y"
                  rows={4}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => setIsEditingEnglish(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                  <button onClick={() => setIsEditingEnglish(false)} className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">Save</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[#475467] text-[14px] leading-[1.6] mb-5">{englishSummary}</p>
                <button onClick={() => setIsEditingEnglish(true)} className="px-4 py-2 text-sm font-semibold text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors">Edit Summary</button>
              </>
            )}
          </>
        )}
      </div>

      {/* Myanmar Summary */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 text-[15px]">AI Summary (Myanmar)</h3>
        {(status === "active" || status === "idle" || status === "paused") ? (
          <div className="py-4 text-gray-400 text-sm text-center">Waiting for processing...</div>
        ) : status === "processing" ? (
          <div className="py-1"><SkeletonText lines={4} /></div>
        ) : (
          <>
            {isEditingMyanmar ? (
              <div>
                <textarea
                  value={myanmarSummary}
                  onChange={(e) => setMyanmarSummary(e.target.value)}
                  className="w-full p-3 text-[#475467] text-[14px] leading-[1.8] font-myanmar border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-y"
                  rows={4}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => setIsEditingMyanmar(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                  <button onClick={() => setIsEditingMyanmar(false)} className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">Save</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[#475467] text-[14px] leading-[1.8] font-myanmar mb-5">{myanmarSummary}</p>
                <button onClick={() => setIsEditingMyanmar(true)} className="px-4 py-2 text-sm font-semibold text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors">Edit Summary</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
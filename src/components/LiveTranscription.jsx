import React, { useState, useEffect } from "react";
import { ChevronLeft, Square, Activity } from "lucide-react";

export default function LiveTranscription({ goBack, goReview }) {
  const [seconds, setSeconds] = useState(0);
  const [waveHeights, setWaveHeights] = useState(Array(10).fill(20));
  const [transcript, setTranscript] = useState("");
  
  const mockWords = "As you speak, the system is actively listening and transcribing your voice into text in real-time. This is perfect for capturing long meetings or brainstorming sessions instantly.".split(" ");
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // 2. Audio Wave Animation Logic
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveHeights((prevHeights) =>
        prevHeights.map(() => Math.floor(Math.random() * (60 - 15 + 1) + 15))
      );
    }, 200);
    return () => clearInterval(waveInterval);
  }, []);

  useEffect(() => {
    if (wordIndex < mockWords.length) {
      const textInterval = setTimeout(() => {
        setTranscript((prev) => (prev ? prev + " " + mockWords[wordIndex] : mockWords[wordIndex]));
        setWordIndex((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(textInterval);
    }
  }, [wordIndex, mockWords]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <main className="max-w-xl mx-auto pt-6 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-[calc(100vh-120px)] md:h-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={goBack} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Live</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Live Text Area */}
      <div className="flex-1 bg-white rounded-[28px] border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col relative overflow-hidden min-h-[300px]">
        <h3 className="text-gray-400 text-sm font-medium mb-4 flex items-center gap-2">
          <Activity size={16} /> Transcription in progress...
        </h3>
        
        <div className="flex-1 overflow-y-auto">
          <p className="text-xl md:text-2xl leading-relaxed text-gray-800 font-medium">
            {transcript}
            <span className="text-emerald-500 animate-pulse ml-1">|</span>
          </p>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end justify-center gap-1 h-12 bg-white/80 backdrop-blur px-6 py-2 rounded-full border border-gray-50">
          {waveHeights.map((height, index) => (
            <div 
              key={index} 
              className="w-1 bg-emerald-500 rounded-full transition-all duration-200 ease-in-out" 
              style={{ height: `${height}px` }} 
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="mt-8 flex items-center justify-between px-4">
        <div className="text-2xl font-bold tracking-widest text-gray-800 tabular-nums">
          {formatTime(seconds)}
        </div>

        <button 
          onClick={goReview} 
          className="bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-semibold flex items-center gap-3 shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95"
        >
          <Square size={18} fill="currentColor" />
          Stop & Review
        </button>
      </div>

    </main>
  );
}
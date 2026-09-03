import React, { useState, useEffect } from "react";
import { ChevronLeft, Square } from "lucide-react";

export default function QuickVoiceNote({ goBack, goReview }) {
  const [seconds, setSeconds] = useState(0);
  const [waveHeights, setWaveHeights] = useState(Array(15).fill(40));

  // Timer Logic
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveHeights((prevHeights) =>
        prevHeights.map(() => Math.floor(Math.random() * (100 - 20 + 1) + 20))
      );
    }, 200);
    return () => clearInterval(waveInterval);
  }, []);

  // Timer Format (00:00)
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <main className="max-w-xl mx-auto pt-6 text-center animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={goBack} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="font-semibold text-lg text-gray-800 tracking-wide">Recording</h2>
        <div className="w-10" /> 
      </div>

      {/* Timer Display */}
      <div className="text-6xl font-bold tracking-widest text-gray-800 tabular-nums mt-10">
        {formatTime(seconds)}
      </div>

      {/* Dynamic Audio Wave Visualizer */}
      <div className="flex justify-center items-center gap-1.5 h-32 mt-16 mb-8">
        {waveHeights.map((height, index) => (
          <div 
            key={index} 
            className="w-1.5 bg-violet-600 rounded-full transition-all duration-200 ease-in-out" 
            style={{ height: `${height}px` }} 
          />
        ))}
      </div>

      {/* Stop Recording Button */}
      <button 
        onClick={goReview} 
        className="mt-16 group flex flex-col items-center justify-center mx-auto"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-violet-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200 group-hover:bg-violet-700 transition-colors">
            <Square size={22} fill="white" color="white" />
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Tap to stop</p>
      </button>

    </main>
  );
}
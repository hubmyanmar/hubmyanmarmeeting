import React from 'react';
import aiImage from '../assets/images.jpeg'; 

export default function AiSummaryBanner() {
  return (
    <div className="bg-gradient-to-r from-[#EEF2FF] to-[#E0E7FF] rounded-xl p-4 flex items-center justify-between border border-indigo-100 shadow-sm">
      <div className="flex items-center gap-3">
        <img 
          src={aiImage} 
          alt="AI Illustration" 
          className="w-40 h-40 rounded-lg bg-white p-1 shadow-sm shrink-0 object-cover"
        />
        
        <div>
          <h4 className="font-bold text-[#1E3A8A] text-sm">AI Meeting Summary is ready!</h4>
          <p className="text-xs text-[#4338CA] mt-0.5">
            BD Strategy Discussion meeting summary is available to review.
          </p>
        </div>
      </div>

      <button className="bg-[#4F46E5] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all shrink-0 ml-3">
        View Summary
      </button>
    </div>
  );
}
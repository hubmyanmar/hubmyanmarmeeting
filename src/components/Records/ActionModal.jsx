import React from 'react';
import { Mic, Activity, Upload, X } from 'lucide-react';

const OptionItem = ({ icon, bg, title, desc, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-start gap-4 p-4 w-full text-left rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
  >
    <div className={`p-3 rounded-full ${bg}`}>{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </button>
);

export default function ActionModal({ showModal, handleStart, fileInputRef, handleFileUpload, onClose }) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm cursor-pointer" 
        onClick={onClose} 
      />

      <div className="relative w-full md:max-w-md bg-white rounded-t-[28px] md:rounded-[28px] p-5 md:p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-lg text-gray-800">Choose Action</h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Cancel & Go to Home"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Options */}
        <div className="flex flex-col gap-1">
          <OptionItem 
            icon={<Mic size={22} className="text-violet-600" />} 
            bg="bg-violet-100" 
            title="Quick Voice Note" 
            desc="Record and save directly" 
            onClick={() => handleStart("quick_voice_note")} 
          />
          <OptionItem 
            icon={<Activity size={22} className="text-emerald-600" />} 
            bg="bg-emerald-50" 
            title="Live Transcription" 
            desc="Real-time voice to text conversion" 
            onClick={() => handleStart("live_transcription")} 
          />
          <OptionItem 
            icon={<Upload size={22} className="text-amber-600" />} 
            bg="bg-amber-50" 
            title="Upload File" 
            desc="Import existing audio for transcription" 
            onClick={() => fileInputRef.current.click()} 
          />
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="audio/*,video/*" 
          />
        </div>
      </div>
    </div>
  );
}
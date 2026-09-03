import React, { useState, useRef } from "react";
import { ChevronLeft, UploadCloud, FileAudio, Image as ImageIcon, X, CheckCircle2, FileUp } from "lucide-react";

export default function UploadFile({ goBack, goReview }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const allowedTypes = ["audio/mpeg", "audio/wav", "audio/x-m4a", "image/jpeg", "image/png", "image/webp"];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (file && allowedTypes.includes(file.type)) {
      setSelectedFile(file);
    } else if (file) {
      alert("Please upload a valid Audio (MP3, WAV) or Image (JPG, PNG) file.");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const isImage = selectedFile?.type.startsWith("image/");

  return (
    <main className="max-w-xs mx-auto pt-4 px-4 md:px-0 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={goBack} 
          className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-all shadow-sm"
        >
          <ChevronLeft size={18} className="text-gray-700" />
        </button>
        <h2 className="font-bold text-base text-gray-800 tracking-tight">Import Media</h2>
        <div className="w-8" />
      </div>

      <div className="bg-white p-1.5 rounded-[24px] shadow-sm border border-gray-100">
        <div className="p-3 bg-[#f8f9fc] rounded-[20px] h-full">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="audio/mp3, audio/wav, audio/m4a, image/jpeg, image/png, image/webp" 
            className="hidden" 
          />

          {/* Upload Zone (Empty State) */}
          {!selectedFile ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative border-2 border-dashed rounded-[16px] py-6 px-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-out overflow-hidden ${
                isDragging 
                  ? "border-violet-500 bg-violet-50/50 scale-[0.98]" 
                  : "border-gray-300 hover:border-violet-400 hover:bg-white"
              }`}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-violet-200 rounded-full blur-[30px] opacity-40 pointer-events-none"></div>

              <div className="relative mb-3">
                <div className="w-12 h-12 bg-white shadow-md shadow-gray-200/50 rounded-xl flex items-center justify-center text-violet-600 rotate-3 transition-transform group-hover:rotate-6">
                  <UploadCloud size={24} strokeWidth={1.5} />
                </div>
              </div>
              
              <h3 className="font-bold text-gray-800 text-sm mb-1 text-center">
                Select or drag file
              </h3>
              <p className="text-gray-500 text-[11px] text-center max-w-[180px] leading-relaxed">
                MP3, WAV up to 50MB <br/> JPG, PNG up to 10MB
              </p>

              <button className="mt-3 px-4 py-1.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg text-[11px] shadow-sm hover:border-violet-300 hover:text-violet-700 transition-colors">
                Browse Files
              </button>
            </div>
          ) : (
            /* File Preview Zone (Selected State) */
            <div className="animate-in zoom-in-95 duration-300">
              <div className="bg-white border border-gray-100 rounded-[16px] p-3 shadow-sm relative overflow-hidden group">
                
                <div className="absolute -top-8 -right-8 w-20 h-20 bg-violet-50 rounded-full blur-xl opacity-60"></div>

                <button 
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors z-10"
                  aria-label="Remove file"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                    isImage ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-violet-50 border-violet-100 text-violet-600"
                  }`}>
                    {isImage ? <ImageIcon size={22} strokeWidth={1.5} /> : <FileAudio size={22} strokeWidth={1.5} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate text-xs pr-5">{selectedFile.name}</h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="mt-3 bg-emerald-50/80 border border-emerald-100/50 p-2 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-semibold">Ready to process</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded shadow-sm">100%</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button 
            disabled={!selectedFile}
            onClick={goReview} 
            className={`w-full mt-3 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all duration-300 ${
              selectedFile 
                ? "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 hover:-translate-y-0.5 active:translate-y-0" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FileUp size={16} />
            Transcribe Now
          </button>
          
        </div>
      </div>
    </main>
  );
}
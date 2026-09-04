import React from 'react';
import { ChevronRight, Calendar, Clock, MapPin, MoreVertical } from 'lucide-react';

export default function MeetingHeader() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center text-sm font-medium text-gray-500">
        <span className="text-violet-600">Meeting Records</span>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-900">BD Strategy Discussion</span>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-3">BD Strategy Discussion</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><Calendar size={16}/> 20 May 2025 (Tue)</span>
            <span className="flex items-center gap-1.5"><Clock size={16}/> 10:00 AM - 11:30 AM</span>
            <span className="flex items-center gap-1.5"><MapPin size={16}/> Meeting Room A</span>
            
            <div className="flex items-center ml-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px]">👨🏻</div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-[10px]">👩🏻</div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[10px]">👨🏽</div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[10px]">👩🏽</div>
              </div>
              <span className="ml-1 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">+5</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-semibold text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors">Download PDF</button>
          <button className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Share</button>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"><MoreVertical size={18} /></button>
        </div>
      </div>
    </div>
  );
}
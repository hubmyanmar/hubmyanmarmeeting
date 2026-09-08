import React from 'react';

export default function ActionsChart() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Actions Overview</h2>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-gray-600">Overdue</span>
          </div>
        </div>
      </div>

      <div className="relative h-48 w-full pt-4">
        <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pointer-events-none">
          <div className="border-b border-gray-100 pb-1">40</div>
          <div className="border-b border-gray-100 pb-1">30</div>
          <div className="border-b border-gray-100 pb-1">20</div>
          <div className="border-b border-gray-100 pb-1">10</div>
          <div>0</div>
        </div>

        <svg className="w-full h-full pl-6 overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
          <polyline fill="none" stroke="#10B981" strokeWidth="2" points="10,80 90,55 170,68 250,35" />
          <circle cx="10" cy="80" r="3" className="fill-emerald-500" />
          <circle cx="90" cy="55" r="3" className="fill-emerald-500" />
          <circle cx="170" cy="68" r="3" className="fill-emerald-500" />
          <circle cx="250" cy="35" r="3" className="fill-emerald-500" />

          <polyline fill="none" stroke="#F43F5E" strokeWidth="2" points="10,105 90,92 170,92 250,88" />
          <circle cx="10" cy="105" r="3" className="fill-rose-500" />
          <circle cx="90" cy="92" r="3" className="fill-rose-500" />
          <circle cx="170" cy="92" r="3" className="fill-rose-500" />
          <circle cx="250" cy="88" r="3" className="fill-rose-500" />
        </svg>
      </div>

      <div className="flex justify-between pl-6 text-[11px] text-gray-400 mt-2 font-medium">
        <span>May 1-7</span>
        <span>May 8-14</span>
        <span>May 15-21</span>
        <span>May 22-31</span>
      </div>
    </div>
  );
}
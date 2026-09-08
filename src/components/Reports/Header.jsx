import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';

export default function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MD Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Executive overview of meetings and actions</p>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          <span>This Month</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
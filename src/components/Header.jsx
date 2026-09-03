import React from 'react';
import { Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-[76px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          မင်္ဂလာပါ Naing Lin Oo <span>👋</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">Welcome back to Meeting Hub</p>
      </div>
      <div className="flex items-center gap-6">
        <span className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-gray-600 bg-white shadow-sm">
          Friday, 16 May 2025
        </span>
        <button className="relative text-gray-400 hover:text-gray-600">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Naing" alt="Profile" className="w-10 h-10 rounded-full border border-gray-300 shadow-sm cursor-pointer" />
      </div>
    </header>
  );
}
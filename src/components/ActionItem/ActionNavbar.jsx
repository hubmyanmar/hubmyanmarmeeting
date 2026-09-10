import React from 'react';

export default function ActionNavbar({ searchQuery, onSearchChange }) {
  return (
    <div className="border-b border-gray-100 px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search tasks, meetings, people..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-12 py-2 bg-gray-50/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder-gray-400 transition-all"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-gray-400 font-medium">
          <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">⌘K</kbd>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        {/* Date Range Picker */}
        <button type="button" className="flex items-center gap-2 px-3.5 py-2 bg-gray-50/80 border border-gray-200/60 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Apr 21, 2025 – May 21, 2025</span>
          <svg className="w-3.5 h-3.5 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button type="button" className="p-2 bg-gray-50/80 border border-gray-200/60 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span>
        </div>

        {/* User Profile */}
        {/* <div className="flex items-center gap-3 pl-2 cursor-pointer">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Sarah Chen" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-gray-900 leading-tight">Sarah Chen</p>
            <p className="text-[11px] text-gray-400">Product Manager</p>
          </div>
          <svg className="w-3.5 h-3.5 text-gray-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div> */}
      </div>
    </div>
  );
}
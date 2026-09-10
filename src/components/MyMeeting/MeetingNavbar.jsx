import React from 'react';

export default function MeetingNavbar({ searchQuery, onSearchChange }) {
  return (
    <header className="border-b border-gray-100 px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-2">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search meetings, people, or topics..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder-gray-400 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        {/* Date Dropdown */}
        <button type="button" className="flex items-center gap-2 px-3.5 py-2 bg-gray-50/80 border border-gray-200/60 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>This Week</span>
          <svg className="w-3.5 h-3.5 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Book Meeting Button */}
        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-[#5538ee] hover:bg-[#482ee0] text-white rounded-xl text-sm font-semibold shadow-xs transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Book New Meeting</span>
        </button>

        {/* User Profile
        <div className="flex items-center gap-3 pl-2 cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
            alt="Sarah Kim"
            className="w-9 h-9 rounded-full object-cover border border-gray-200"
          />
          <div className="hidden lg:block text-left">
            <p className="text-sm font-bold text-gray-900 leading-tight">Sarah Kim</p>
            <p className="text-xs text-gray-400">Product Manager</p>
          </div>
          <svg className="w-3.5 h-3.5 text-gray-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div> */}
      </div>
    </header>
  );
}
import React, { useState, useEffect } from 'react';

export default function ActionNavbar({ searchQuery, onSearchChange, onDateRangeChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);

  const formatForInput = (date) => date.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(formatForInput(lastMonth));
  const [endDate, setEndDate] = useState(formatForInput(today));

  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(startDate, endDate);
    }
  }, [startDate, endDate, onDateRangeChange]);

  const formatForDisplay = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-50/80 border border-gray-200/60 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatForDisplay(startDate)} – {formatForDisplay(endDate)}</span>
            <svg className={`w-3.5 h-3.5 text-gray-400 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 p-4 bg-white border border-gray-100 rounded-xl shadow-lg flex flex-col gap-3 z-50 min-w-[200px]">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2 text-gray-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2 text-gray-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
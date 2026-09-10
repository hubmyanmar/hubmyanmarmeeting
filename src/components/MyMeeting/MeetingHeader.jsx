import React from 'react';

export default function MeetingHeader({ activeTab, onTabChange, activeView, onViewChange, counts }) {
  const tabs = [
    { id: 'all', label: 'All Meetings', count: counts?.all || 8 },
    { id: 'upcoming', label: 'Upcoming', count: counts?.upcoming || 5 },
    { id: 'past', label: 'Past', count: counts?.past || 3 },
  ];

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Meetings</h1>
        <p className="text-gray-400 mt-1 text-sm font-normal">Stay organized and never miss a conversation.</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100/70 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex items-center px-4 py-1.5 text-sm rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white shadow-xs font-semibold text-gray-800'
                  : 'font-medium text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-[#5538ee] text-white font-semibold' : 'bg-gray-200/80 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* View Switcher */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">View</span>
          <div className="bg-gray-100/70 p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => onViewChange?.('grid')}
              className={`p-1.5 rounded-lg transition-colors ${activeView === 'grid' ? 'bg-white text-[#5538ee] shadow-xs' : 'text-gray-400'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewChange?.('list')}
              className={`p-1.5 rounded-lg transition-colors ${activeView === 'list' ? 'bg-white text-[#5538ee] shadow-xs' : 'text-gray-400'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
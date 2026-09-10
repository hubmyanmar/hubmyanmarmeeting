import React, { useState } from 'react';
import { meetingsData } from '../data/meetings';
import MeetingNavbar from './MyMeeting/MeetingNavbar';
import MeetingHeader from './MyMeeting/MeetingHeader';
import MeetingGrid from './MyMeeting/MeetingGrid';

export default function MyMeetings() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeView, setActiveView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeetings = meetingsData.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8faef]/40 text-gray-800">
      {/* Top Navbar Component */}
      <MeetingNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Title, Tabs & View Switcher */}
        <MeetingHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeView={activeView}
          onViewChange={setActiveView}
          counts={{ all: 8, upcoming: 5, past: 3 }}
        />

        {/* Cards Grid */}
        <MeetingGrid meetings={filteredMeetings} />
      </main>
    </div>
  );
}
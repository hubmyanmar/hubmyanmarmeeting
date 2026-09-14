import React, { useState } from 'react';
import MeetingNavbar from './MyMeeting/MeetingNavbar';
import MeetingHeader from './MyMeeting/MeetingHeader';
import MeetingGrid from './MyMeeting/MeetingGrid';

const checkDateFilter = (meetingDateStr, filterType) => {
  if (!meetingDateStr) return true;
  
  const meetingDate = new Date(meetingDateStr);
  const today = new Date();

  if (filterType === 'Today') {
    return meetingDate.toDateString() === today.toDateString();
  } 
  
  if (filterType === 'This Month') {
    return meetingDate.getMonth() === today.getMonth() && 
           meetingDate.getFullYear() === today.getFullYear();
  } 
  
  if (filterType === 'This Week') {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    return meetingDate >= startOfWeek && meetingDate <= endOfWeek;
  }

  return true;
};

export default function MyMeetings({ bookedMeetings = [] }) {
  const [activeTab, setActiveTab] = useState('all');
  const [activeView, setActiveView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date Filter State
  const [dateFilter, setDateFilter] = useState('This Week'); 

  const formattedMeetings = bookedMeetings.map((b, index) => {
    const participantsList = Array.isArray(b.participants) ? b.participants : [];
    const count = participantsList.length || 1;
    return {
      id: b.id || index + 1,
      date: b.date || new Date().toISOString().split('T')[0],
      status: b.status || 'PENDING',
      statusColor: b.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
      title: b.title || 'Untitled Meeting',
      time: b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : '09:00 AM - 10:00 AM',
      location: b.room || (b.meetingType === 'ONLINE' ? 'Online Meeting' : 'Physical Room'),
      participantsList: participantsList,
      total: `${count} Participants`,
      desc: b.purpose || 'No purpose description provided.'
    };
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const baseFilteredMeetings = formattedMeetings.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = checkDateFilter(m.date, dateFilter);
    return matchesSearch && matchesDate;
  });
  const upcomingCount = baseFilteredMeetings.filter(m => {
    const meetingDate = new Date(m.date);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate >= today;
  }).length;

  const pastCount = baseFilteredMeetings.filter(m => {
    const meetingDate = new Date(m.date);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate < today;
  }).length;
  const finalFilteredMeetings = baseFilteredMeetings.filter((m) => {
    const meetingDate = new Date(m.date);
    meetingDate.setHours(0, 0, 0, 0);

    if (activeTab === 'upcoming') {
      return meetingDate >= today;
    }
    if (activeTab === 'past') {
      return meetingDate < today;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8faef]/40 text-gray-800">
      <MeetingNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterChange={setDateFilter}
      />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <MeetingHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeView={activeView}
          onViewChange={setActiveView}
          counts={{
            all: baseFilteredMeetings.length,
            upcoming: upcomingCount,
            past: pastCount
          }}
        />

        {finalFilteredMeetings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 mt-6">
            <p className="text-gray-500 text-sm">No meetings found for {dateFilter}.</p>
          </div>
        ) : (
          <MeetingGrid meetings={finalFilteredMeetings} activeView={activeView} />
        )}
      </main>
    </div>
  );
}
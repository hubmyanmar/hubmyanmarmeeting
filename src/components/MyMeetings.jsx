import React, { useState } from 'react';
import MeetingNavbar from './MyMeeting/MeetingNavbar';
import MeetingHeader from './MyMeeting/MeetingHeader';
import MeetingGrid from './MyMeeting/MeetingGrid';

const formatTimeAMPM = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }
  
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  
  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  
  return `${formattedHours}:${minutes} ${ampm}`;
};

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
  const [dateFilter, setDateFilter] = useState('This Week'); 

  const formattedMeetings = bookedMeetings.map((b, index) => {
    const rawParticipants = b.participants || b.participant_list || b.users || b.members || [];
    const participantsList = Array.isArray(rawParticipants) ? rawParticipants.map(p => ({
      id: p.id || p.zolog_user_id,
      name: p.name && p.name.trim() !== '' ? p.name : (p.email ? p.email.split('@')[0] : 'User'),
      email: p.email || ''
    })) : [];
    const count = participantsList.length;

    const meetingDateVal = b.date || b.meeting_date || new Date().toISOString().split('T')[0];
    const rawStartTime = b.startTime || b.start_time || '09:00:00';
    const rawEndTime = b.endTime || b.end_time || '10:00:00';
    const startTimeVal = formatTimeAMPM(rawStartTime);
    const endTimeVal = formatTimeAMPM(rawEndTime);

    const meetingTypeVal = (b.meetingType || b.meeting_type || '').trim().toLowerCase();
    
    let roomName = 'Physical Room';
    
    if (b.room && typeof b.room === 'object') {
      roomName = b.room.name || b.room.room_name || 'Physical Room';
    } else if (b.roomName) {
      roomName = b.roomName;
    } else if (b.room_name) {
      roomName = b.room_name;
    } else if (typeof b.room === 'string' && b.room.trim() !== '' && isNaN(b.room)) {
      roomName = b.room;
    } else if (b.meetingRoom && typeof b.meetingRoom === 'object') {
      roomName = b.meetingRoom.name || 'Physical Room';
    } else if (b.meeting_room && typeof b.meeting_room === 'object') {
      roomName = b.meeting_room.name || 'Physical Room';
    } else if (typeof b.meeting_room === 'string' && b.meeting_room.trim() !== '') {
      roomName = b.meeting_room;
    }

    if (meetingTypeVal !== 'online' && roomName === 'Physical Room' && b.room_id) {
      roomName = `Room ID: ${b.room_id}`;
    }

    return {
      id: b.id || index + 1,
      date: meetingDateVal,
      status: b.status || 'PENDING',
      statusColor: b.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
      title: b.title || 'Untitled Meeting',
      time: `${startTimeVal} - ${endTimeVal}`,
      location: meetingTypeVal === 'online' ? 'Online Meeting' : roomName,
      participantsList: participantsList,
      total: `${count} Participants`,
      desc: b.purpose || b.description || 'No purpose description provided.'
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
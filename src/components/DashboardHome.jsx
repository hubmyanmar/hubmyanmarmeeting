import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { normalizeMeetingStatus } from '../utils/meetingSessionState';
import DashboardHeader from './DashboardHeader';
import TopStats from './TopStats';
import TodaySchedule from './TodaySchedule';
import RoomAvailability from './RoomAvailability';
import QuickActions from './QuickActions';

// --- Helper Functions ---
const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDisplayValue = (val, fallback = '') => {
  if (!val) return fallback;
  if (typeof val === 'object') {
    return val.name || val.title || val.room_name || val.room || fallback;
  }
  return String(val);
};

const getMeetingId = (m) => {
  const rawId = m.id || m._id || m.meeting_id;
  if (rawId) return String(rawId);
  const mTitle = formatDisplayValue(m.title || 'meeting');
  const mTime = formatDisplayValue(m.start_time || m.startTime || '');
  return `meeting_${mTitle}_${mTime}`.replace(/[^a-zA-Z0-9]/g, '_');
};

const getSessionStatus = (meetingId, meetingSessions) => {
  if (!meetingSessions) return null;
  const targetId = String(meetingId || '').trim();

  const getMatch = (session) => {
    if (!session) return false;
    const sessionId = String(session?.meeting_id || session?.id || session?.meetingId || '').trim();
    return (!targetId || !sessionId) ? false : sessionId === targetId;
  };

  if (Array.isArray(meetingSessions)) {
    const found = meetingSessions.find(getMatch) || meetingSessions.find(s => String(s?.meeting_id || s?.id || s?.meetingId || '').includes(targetId));
    return normalizeMeetingStatus(found?.status || found?.meeting_status || found?.state, found);
  }

  if (typeof meetingSessions === 'object') {
    if (meetingSessions[targetId]) {
      return normalizeMeetingStatus(meetingSessions[targetId]?.status || meetingSessions[targetId]?.meeting_status || meetingSessions[targetId]?.state, meetingSessions[targetId]);
    }

    const values = Object.values(meetingSessions);
    const found = values.find(getMatch) || values.find(s => String(s?.meeting_id || s?.id || s?.meetingId || '').includes(targetId));
    return normalizeMeetingStatus(found?.status || found?.meeting_status || found?.state, found);
  }

  return null;
};

export default function DashboardHome({ 
  bookedMeetings: rawBookedMeetings = [], 
  meetingRooms = [],
  currentUser: propUser,
  meetingSessions = {},
  refetchSessions,
  onSaveSession
}) {
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState(
    propUser || location.state?.user || null
  );

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
    }
  }, [propUser]);

  const bookedMeetings = useMemo(() => {
    return Array.isArray(rawBookedMeetings) ? rawBookedMeetings.map(m => ({
      ...m,
      title: formatDisplayValue(m.title || m.meeting_title || m.name, 'Untitled Meeting'),
      room: formatDisplayValue(m.room || m.meeting_room || m.room_name, 'Main Room'),
      date: formatDisplayValue(m.date || m.meeting_date)
    })) : [];
  }, [rawBookedMeetings]);

  const { todayMeetings, upcomingMeetings, pendingCount, overdueCount } = useMemo(() => {
    const todayStr = getTodayDateString(); 

    const today = bookedMeetings.filter(m => {
      const mDate = formatDisplayValue(m.date || m.meeting_date);
      if (!mDate) return false;
      return mDate.includes(todayStr) || todayStr.includes(mDate);
    });

    const upcoming = bookedMeetings.filter(m => {
      const mDate = formatDisplayValue(m.date || m.meeting_date);
      return mDate && mDate > todayStr;
    });

    const completedCount = today.filter(m => {
      const id = getMeetingId(m);
      return getSessionStatus(id, meetingSessions) === 'stopped';
    }).length;

    const overdue = bookedMeetings.filter(m => {
      const mDate = formatDisplayValue(m.date || m.meeting_date);
      const id = getMeetingId(m);
      const status = getSessionStatus(id, meetingSessions);
      return mDate && mDate < todayStr && status !== 'stopped';
    }).length;

    return {
      todayMeetings: today,
      upcomingMeetings: upcoming,
      pendingCount: Math.max(0, today.length - completedCount), 
      overdueCount: overdue
    };
  }, [bookedMeetings, meetingSessions]);

  return (
    <div className="w-full flex flex-col gap-2 p-1 sm:p-2 bg-slate-50/50 min-h-screen">
      
      {/* Header Bar */}
      <DashboardHeader currentUser={currentUser} />

      {/* Top 4 Stats Cards */}
      <TopStats 
        todayCount={todayMeetings.length} 
        upcomingCount={upcomingMeetings.length}
        pendingCount={pendingCount} 
        overdueCount={overdueCount} 
      />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Today's Schedule */}
        <div className="lg:col-span-4">
          <TodaySchedule 
            bookedMeetings={bookedMeetings}
            todayMeetings={todayMeetings} 
            currentUser={currentUser} 
            meetingSessions={meetingSessions}
            refetchSessions={refetchSessions}
            onSaveSession={onSaveSession}
          />
        </div>

        {/* Room Availability */}
        <div className="lg:col-span-5">
          <RoomAvailability 
            bookedMeetings={bookedMeetings} 
            meetingRooms={meetingRooms} 
          />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
      </div>

    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import TopStats from './TopStats';
import TodaySchedule from './TodaySchedule';
import AiSummaryBanner from './AiSummaryBanner';
import RightSidebar from './RightSidebar';
import BottomMetrics from './BottomMetrics';

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

const parseMeetingDateTime = (dateStr, timeStr) => {
  const safeDateStr = formatDisplayValue(dateStr);
  const safeTimeStr = formatDisplayValue(timeStr);

  if (!safeTimeStr || !safeDateStr) return new Date();
  
  const parts = safeTimeStr.split(' ');
  const time = parts[0] || '00:00';
  const modifier = (parts[1] || '').toUpperCase();
  
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours || 0, 10);
  
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const d = new Date(safeDateStr);
  if (isNaN(d.getTime())) return new Date();

  d.setHours(hours, parseInt(minutes || 0, 10), 0, 0);
  return d;
};

export default function DashboardHome({ bookedMeetings: rawBookedMeetings = [], currentUser: propUser }) {
  const location = useLocation();
  const [currentUser] = useState(
    propUser || location.state?.user || null
  );
  
  const bookedMeetings = useMemo(() => {
    return Array.isArray(rawBookedMeetings) ? rawBookedMeetings.map(m => ({
      ...m,
      title: formatDisplayValue(m.title || m.meeting_title || m.name, 'Untitled Meeting'),
      room: formatDisplayValue(m.room || m.meeting_room || m.room_name, 'Main Room'),
      date: formatDisplayValue(m.date || m.meeting_date)
    })) : [];
  }, [rawBookedMeetings]);

  const [meetingSessions, setMeetingSessions] = useState({});

  useEffect(() => {
    const loadSessionsFromBackend = async () => {
      try {
        const sessionsRes = await fetch('http://127.0.0.1:8000/api/v1/meeting-sessions');
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setMeetingSessions(sessionsData || {});
        }
      } catch (error) {
        console.error('Error loading meeting sessions from backend:', error);
      }
    };

    loadSessionsFromBackend();

    window.addEventListener('sync-meeting-sessions', loadSessionsFromBackend);

    return () => {
      window.removeEventListener('sync-meeting-sessions', loadSessionsFromBackend);
    };
  }, []);

  const { todayMeetings, upcomingMeetings, pendingCount, overdueCount } = useMemo(() => {
    const todayStr = getTodayDateString(); 
    const now = new Date(); 
    
    const today = bookedMeetings.filter(m => {
      const mDate = formatDisplayValue(m.date || m.meeting_date);
      return mDate.includes(todayStr) || todayStr.includes(mDate);
    });

    const upcoming = bookedMeetings.filter(m => {
      const mDate = formatDisplayValue(m.date || m.meeting_date);
      return mDate && mDate > todayStr;
    });

    // -- Pending Count
    const completedCount = today.filter(m => {
      const mTitle = formatDisplayValue(m.title || 'meeting');
      const mTime = formatDisplayValue(m.start_time || m.startTime || '');
      const id = m.id || `meeting_${mTitle}_${mTime}`.replace(/[^a-zA-Z0-9]/g, '_');
      return meetingSessions[id]?.status === 'stopped';
    }).length;

    // -- Overdue Count
    const overdue = bookedMeetings.filter(m => {
      const mTitle = formatDisplayValue(m.title || 'meeting');
      const mTime = formatDisplayValue(m.start_time || m.startTime || '');
      const id = m.id || `meeting_${mTitle}_${mTime}`.replace(/[^a-zA-Z0-9]/g, '_');
      const status = meetingSessions[id]?.status;

      if (status === 'stopped' || status === 'running') return false;

      const meetingDateTime = parseMeetingDateTime(m.date || m.meeting_date, m.start_time || m.startTime);
      const gracePeriodTime = new Date(meetingDateTime.getTime() + (15 * 60 * 1000));

      return now > gracePeriodTime; 
    }).length;

    return {
      todayMeetings: today,
      upcomingMeetings: upcoming,
      pendingCount: Math.max(0, today.length - completedCount), 
      overdueCount: overdue
    };
  }, [bookedMeetings, meetingSessions]);

  // 3. Render
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
      
      <TopStats 
        todayCount={todayMeetings.length} 
        upcomingCount={upcomingMeetings.length}
        pendingCount={pendingCount} 
        overdueCount={overdueCount} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <TodaySchedule bookedMeetings={todayMeetings} currentUser={currentUser} />
          <AiSummaryBanner />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <RightSidebar upcomingMeetings={upcomingMeetings} />
        </div>
      </div>
      
      <BottomMetrics bookedMeetings={bookedMeetings} meetingSessions={meetingSessions} />
      
    </div>
  );
}
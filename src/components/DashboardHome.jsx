import React, { useState, useEffect, useMemo } from 'react';
import TopStats from './TopStats';
import TodaySchedule from './TodaySchedule';
import AiSummaryBanner from './AiSummaryBanner';
import RightSidebar from './RightSidebar';
import BottomMetrics from './BottomMetrics';

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const parseMeetingDateTime = (dateStr, timeStr) => {
  if (!timeStr || !dateStr) return new Date();
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const d = new Date(dateStr);
  d.setHours(hours, parseInt(minutes, 10), 0, 0);
  return d;
};

export default function DashboardHome() {
  const [bookedMeetings, setBookedMeetings] = useState([]);
  const [meetingSessions, setMeetingSessions] = useState({});

  useEffect(() => {
    const loadData = () => {
      try {
        const meetings = localStorage.getItem('bookedMeetings');
        if (meetings) setBookedMeetings(JSON.parse(meetings));

        const sessions = localStorage.getItem('meetingSessions');
        if (sessions) setMeetingSessions(JSON.parse(sessions));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('sync-booked-meetings', loadData);
    window.addEventListener('sync-meeting-sessions', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('sync-booked-meetings', loadData);
      window.removeEventListener('sync-meeting-sessions', loadData);
    };
  }, []);

  const { todayMeetings, upcomingMeetings, pendingCount, overdueCount } = useMemo(() => {
    const todayStr = getTodayDateString(); 
    const now = new Date(); 
    
    const today = bookedMeetings.filter(m => m.date === todayStr);
    const upcoming = bookedMeetings.filter(m => m.date && m.date > todayStr);

    // -- Pending
    const completedCount = today.filter(m => {
      const id = m.id || `meeting_${m.title}_${m.startTime}`.replace(/[^a-zA-Z0-9]/g, '_');
      return meetingSessions[id]?.status === 'stopped';
    }).length;

    // -- Overdue
    const overdue = bookedMeetings.filter(m => {
      const id = m.id || `meeting_${m.title}_${m.startTime}`.replace(/[^a-zA-Z0-9]/g, '_');
      const status = meetingSessions[id]?.status;

      if (status === 'stopped' || status === 'running') return false;

      const meetingDateTime = parseMeetingDateTime(m.date, m.startTime);

      const gracePeriodTime = new Date(meetingDateTime.getTime() + (15 * 60 * 1000));

      return now > gracePeriodTime; 
    }).length;

    return {
      todayMeetings: today,
      upcomingMeetings: upcoming,
      pendingCount: today.length - completedCount, 
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
          <TodaySchedule bookedMeetings={todayMeetings} />
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
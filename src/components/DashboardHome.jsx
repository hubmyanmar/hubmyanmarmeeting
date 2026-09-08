import React, { useState, useEffect } from 'react';
import TopStats from './TopStats';
import TodaySchedule from './TodaySchedule';
import AiSummaryBanner from './AiSummaryBanner';
import RightSidebar from './RightSidebar';
import BottomMetrics from './BottomMetrics';

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DashboardHome() {

  const [bookedMeetings, setBookedMeetings] = useState([]);
  const [actionItems, setActionItems] = useState([]);

 
  useEffect(() => {
    
    const savedMeetings = localStorage.getItem('bookedMeetings');
    if (savedMeetings) {
      setBookedMeetings(JSON.parse(savedMeetings));
    }

    
    const savedActions = localStorage.getItem('actionItems');
    if (savedActions) {
      setActionItems(JSON.parse(savedActions));
    }
  }, []);

  const todayDate = getTodayDate();

  
  const todayMeetings = bookedMeetings.filter((m) => m.date === todayDate);
  const upcomingMeetings = bookedMeetings.filter((m) => m.date > todayDate);

  const pendingActions = actionItems.filter((item) => item.status !== 'completed');
  const overdueActions = pendingActions.filter((item) => item.dueDate < todayDate);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-1">

      <TopStats 
        todayCount={todayMeetings.length} 
        upcomingCount={upcomingMeetings.length}
        pendingCount={pendingActions.length} 
        overdueCount={overdueActions.length} 
      />

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 flex flex-col gap-2">
          <TodaySchedule bookedMeetings={todayMeetings} />
          <AiSummaryBanner />
        </div>
        <div className="col-span-1">
          <RightSidebar upcomingMeetings={upcomingMeetings} />
        </div>
      </div>
      
      <BottomMetrics />
    </div>
  );
}
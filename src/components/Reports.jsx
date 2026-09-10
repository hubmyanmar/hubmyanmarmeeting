import React, { useState } from 'react';
import Header from './Reports/Header';
import MetricCards from './Reports/MetricCards';
import DepartmentChart from './Reports/DepartmentChart';
import ActionsChart from './Reports/ActionsChart';
import TopRooms from './Reports/TopRooms';
import OverdueActions from './Reports/OverdueActions';

export default function Reports({ bookedMeetings = [] }) {
  const [filter, setFilter] = useState({
    view: 'month',
    month: 'this_month',
    year: new Date().getFullYear()
  });

  const filteredMeetings = bookedMeetings.filter((meeting) => {
    const rawDate = meeting.date || meeting.startedAt || meeting.startTime;
    if (!rawDate) return false;

    const d = new Date(rawDate);
    const meetingYear = d.getFullYear();
    const meetingMonth = d.getMonth();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    if (filter.view === 'year') {
      return meetingYear === filter.year;
    } 
    
    else if (filter.view === 'month') {
      if (filter.month === 'this_month') {
        return meetingYear === currentYear && meetingMonth === currentMonth;
      } else if (filter.month === 'last_month') {
        let lastM = currentMonth - 1;
        let lastY = currentYear;
        if (lastM < 0) { lastM = 11; lastY -= 1; }
        return meetingYear === lastY && meetingMonth === lastM;
      } else {
      
        return meetingYear === filter.year && meetingMonth === parseInt(filter.month);
      }
    }
    return false;
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      <Header onFilterChange={(newFilter) => setFilter(newFilter)} />
      
      <MetricCards filter={filter} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DepartmentChart />
        <ActionsChart filter={filter} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopRooms bookedMeetings={filteredMeetings} filter={filter} />
        <OverdueActions />
      </div>
    </div>
  );
}
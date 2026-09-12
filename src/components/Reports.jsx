import React, { useState, useMemo } from 'react';
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

  const filteredMeetings = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    return bookedMeetings.filter((meeting) => {
      const rawDate = meeting.date || meeting.startedAt || meeting.startTime;
      if (!rawDate) return false;

      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return false;

      const meetingYear = d.getFullYear();
      const meetingMonth = d.getMonth();

      if (filter.view === 'year') {
        return meetingYear === filter.year;
      } 
      
      if (filter.view === 'month') {
        if (filter.month === 'this_month') {
          return meetingYear === currentYear && meetingMonth === currentMonth;
        } 
        if (filter.month === 'last_month') {
          const lastM = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastY = currentMonth === 0 ? currentYear - 1 : currentYear;
          return meetingYear === lastY && meetingMonth === lastM;
        } 
        return meetingYear === filter.year && meetingMonth === parseInt(filter.month, 10);
      }
      return false;
    });
  }, [bookedMeetings, filter]);

  
  const totalMeetingHours = useMemo(() => {
    return filteredMeetings.reduce((acc, meeting) => {
      
      if (meeting.duration) return acc + Number(meeting.duration);
      if (meeting.durationHours) return acc + Number(meeting.durationHours);

      const start = new Date(meeting.startTime || meeting.startedAt);
      const end = new Date(meeting.endTime || meeting.endedAt);
      if (!isNaN(start) && !isNaN(end)) {
        const diffInHours = (end - start) / (1000 * 60 * 60);
        return acc + (diffInHours > 0 ? diffInHours : 0);
      }
      return acc;
    }, 0);
  }, [filteredMeetings]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <Header onFilterChange={setFilter} />
      
     <MetricCards filter={filter} bookedMeetings={bookedMeetings} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DepartmentChart bookedMeetings={filteredMeetings} />
        <ActionsChart filter={filter} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopRooms bookedMeetings={filteredMeetings} filter={filter} />
        <OverdueActions bookedMeetings={filteredMeetings} />
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import Header from './Reports/Header';
import MetricCards from './Reports/MetricCards';
import DepartmentChart from './Reports/DepartmentChart';
import ActionsChart from './Reports/ActionsChart';
import TopRooms from './Reports/TopRooms';
import OverdueActions from './Reports/OverdueActions';

const formatDisplayValue = (val, fallback = '') => {
  if (!val) return fallback;
  if (typeof val === 'object') {
    return val.name || val.title || val.room_name || val.room || fallback;
  }
  return String(val);
};

export default function Reports({ meetingSessions = {} }) {
  const currentDate = new Date();
  
  // Initial State: 1-based Month Index (Jan = 1, Sep = 9, Dec = 12)
  const [filter, setFilter] = useState({
    view: 'month',
    month: (currentDate.getMonth() + 1).toString(), 
    year: currentDate.getFullYear()
  });

  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filter.view) queryParams.append('view', filter.view);
        if (filter.year) queryParams.append('year', filter.year);
        if (filter.view === 'month' && filter.month) {
          queryParams.append('month', filter.month);
        }

        const resMeetings = await fetch(`http://127.0.0.1:8000/api/v1/meetings?${queryParams.toString()}`);
        
        if (resMeetings.ok) {
          const rawMeetings = await resMeetings.json();
          
          if (Array.isArray(rawMeetings)) {
            const formatted = rawMeetings.map((m) => ({
              ...m,
              title: formatDisplayValue(m.title || m.meeting_title || m.name, 'Untitled Meeting'),
              room: formatDisplayValue(m.room || m.meeting_room || m.room_name, 'Main Room'),
              date: formatDisplayValue(m.meeting_date || m.date || m.startTime || m.startedAt)
            }));
            const finalFiltered = formatted.filter((m) => {
              if (!m.date) return false;

              let mYear, mMonth;
              if (typeof m.date === 'string' && m.date.includes('-')) {
                const datePart = m.date.split('T')[0];
                const parts = datePart.split('-');
                mYear = parseInt(parts[0], 10);
                mMonth = parseInt(parts[1], 10);
              } else {
                const parsedDate = new Date(m.date);
                if (isNaN(parsedDate.getTime())) return false;
                mYear = parsedDate.getFullYear();
                mMonth = parsedDate.getMonth() + 1; 
              }

              if (isNaN(mYear) || isNaN(mMonth)) return false;

              const selectedYear = parseInt(filter.year, 10);
              const selectedMonth = parseInt(filter.month, 10);

              if (filter.view === 'year') {
                return mYear === selectedYear;
              }
              return mYear === selectedYear && mMonth === selectedMonth;
            });

            setFilteredMeetings(finalFiltered);
          } else {
            setFilteredMeetings([]);
          }
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
      <Header filter={filter} onFilterChange={setFilter} />

      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium">
          Data များကို Backend မှ ရယူနေပါသည်...
        </div>
      ) : (
        <>
          <MetricCards 
            filter={filter} 
            bookedMeetings={filteredMeetings} 
            meetingSessions={meetingSessions} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DepartmentChart bookedMeetings={filteredMeetings} />
            <ActionsChart filter={filter} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopRooms bookedMeetings={filteredMeetings} filter={filter} />
            <OverdueActions bookedMeetings={filteredMeetings} />
          </div>
        </>
      )}
    </div>
  );
}
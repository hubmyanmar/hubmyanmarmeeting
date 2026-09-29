import React, { useEffect, useRef, useState, useMemo } from 'react';

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

const toISODate = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function Calendar({ bookedMeetings = [] }) {
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [dayModalData, setDayModalData] = useState(null); 

  const HOUR_HEIGHT = 80;
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const scrollRef = useRef(null);

  const parseTimeString = (timeStr) => {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;

    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    return { hour: h, minute: m, ampm };
  };

  const formattedMeetings = useMemo(() => {
    return bookedMeetings.map((b, index) => {
      const rawParticipants = b.participants || b.participant_list || b.users || b.members || [];
      const attendees = Array.isArray(rawParticipants) ? rawParticipants.map(p => ({
        name: p.name || p.email?.split('@')[0] || 'User',
        email: p.email || '',
        department: p.department || p.role || ''
      })) : [];

      const meetingDateVal = b.date || b.meeting_date || b.start_date || toISODate(new Date());
      const rawStartTime = b.startTime || b.start_time || '09:00:00';
      const rawEndTime = b.endTime || b.end_time || '10:00:00';
      
      const startTimeVal = formatTimeAMPM(rawStartTime);
      const endTimeVal = formatTimeAMPM(rawEndTime);
      const parsedStart = parseTimeString(startTimeVal);

      const isOnline = b.meetingType?.toLowerCase() === 'online' || b.isOnline;

      const rawRoomName = (typeof b.room === 'object' ? (b.room?.name || b.room?.room_name) : b.room) || b.roomName || b.room_name || '';
      const roomName = isOnline
        ? 'Online Meeting'
        : (rawRoomName && String(rawRoomName).trim() !== '' ? rawRoomName : 'No Room');

      return {
        ...b,
        id: b.id || `meeting-${index + 1}`,
        date: meetingDateVal,
        title: b.title || b.meetingTitle || b.topic || 'Untitled Meeting',
        startTime: startTimeVal,
        endTime: endTimeVal,
        startHour: parsedStart ? parsedStart.hour : 9,
        startMinute: parsedStart ? parsedStart.minute : 0,
        room: roomName,
        meetingType: isOnline ? 'online' : 'physical',
        attendees: attendees,
        status: b.status || (b.isPending ? 'pending' : 'confirmed'),
        organizer: b.organizer || (attendees[0]?.name ? `${attendees[0].name}${attendees[0].department ? ` (${attendees[0].department})` : ''}` : 'Organizer')
      };
    });
  }, [bookedMeetings]);

  // Overlap Calculation Logic
  const calculateOverlaps = (events) => {
    const formatted = events
      .map((evt) => {
        let sHour = evt.startHour;
        let sMin = evt.startMinute;
        let duration = evt.durationMinute;

        const startParsed = parseTimeString(evt.startTime);
        const endParsed = parseTimeString(evt.endTime);

        if (sHour === undefined && startParsed) {
          sHour = startParsed.hour;
          sMin = startParsed.minute;
        }

        if (duration === undefined && startParsed && endParsed) {
          const startTotal = startParsed.hour * 60 + startParsed.minute;
          let endTotal = endParsed.hour * 60 + endParsed.minute;
          if (endTotal <= startTotal) endTotal += 24 * 60;
          duration = endTotal - startTotal;
          if (duration > 720) duration = 60;
        }

        const startMinutes = (sHour ?? 9) * 60 + (sMin ?? 0);
        const endMinutes = startMinutes + (duration ?? 60);

        return {
          ...evt,
          startMinutes,
          endMinutes,
          durationMinute: duration ?? 60,
        };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes || b.endMinutes - a.endMinutes);

    const clusters = [];
    let currentCluster = [];
    let clusterEnd = -1;

    formatted.forEach((evt) => {
      if (currentCluster.length === 0 || evt.startMinutes < clusterEnd) {
        currentCluster.push(evt);
        clusterEnd = Math.max(clusterEnd, evt.endMinutes);
      } else {
        clusters.push(currentCluster);
        currentCluster = [evt];
        clusterEnd = evt.endMinutes;
      }
    });
    if (currentCluster.length > 0) clusters.push(currentCluster);

    const processedEvents = [];
    clusters.forEach((cluster) => {
      const columns = [];
      cluster.forEach((evt) => {
        let colIdx = columns.findIndex(
          (col) => col[col.length - 1].endMinutes <= evt.startMinutes
        );
        if (colIdx === -1) {
          columns.push([evt]);
          colIdx = columns.length - 1;
        } else {
          columns[colIdx].push(evt);
        }
        evt.colIndex = colIdx;
      });

      const totalCols = columns.length;
      cluster.forEach((evt) => {
        evt.totalCols = totalCols;
        processedEvents.push(evt);
      });
    });

    return processedEvents;
  };

  const availableRooms = useMemo(() => {
    const rooms = new Set();
    formattedMeetings.forEach((m) => {
      if (m.room) rooms.add(m.room);
    });
    return Array.from(rooms);
  }, [formattedMeetings]);

  const toggleRoomFilter = (room) => {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    let startOffset = firstDay.getDay() - 1; 
    if (startOffset === -1) startOffset = 6;

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentDate]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const dateRangeLabel = useMemo(() => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }, [viewMode, currentDate, weekDays]);

  const filteredMeetings = useMemo(() => {
    return formattedMeetings.filter((m) => {
      if (selectedRooms.length > 0 && !selectedRooms.includes(m.room)) {
        return false;
      }
      const mDateStr = String(m.date).split('T')[0].trim();
      if (viewMode === 'day') {
        return mDateStr === toISODate(currentDate);
      } else if (viewMode === 'week') {
        return mDateStr >= toISODate(weekDays[0]) && mDateStr <= toISODate(weekDays[6]);
      } else if (viewMode === 'month') {
        const [y, mIndex] = mDateStr.split('-').map(Number);
        return y === currentDate.getFullYear() && (mIndex - 1) === currentDate.getMonth();
      }
      return true;
    });
  }, [formattedMeetings, selectedRooms, viewMode, currentDate, weekDays]);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeTop = (currentHour * HOUR_HEIGHT) + ((currentMinute / 60) * HOUR_HEIGHT);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, (currentHour - 2) * HOUR_HEIGHT);
    }
  }, [currentHour]);

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 min-h-screen font-sans text-slate-800 p-2 md:p-4 gap-3 md:gap-4 items-start pb-6 md:pb-4">
      {/* Calendar Main Box */}
      <div className="w-full md:w-auto md:flex-1 flex flex-col bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-3 md:mb-0">
        
        {/* Header Bar */}
        <div className="p-3 md:p-4 border-b border-slate-100 flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between gap-2.5">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">Calendar</h1>
            <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">View and manage your meetings</p>
          </div>

          <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100/80 p-0.5 md:p-1 rounded-lg md:rounded-xl border border-slate-200/60 text-xs font-semibold">
              {['day', 'week', 'month'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 md:flex-none px-2.5 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg capitalize transition-all ${
                    viewMode === mode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Dynamic Room Filter Pills */}
            {availableRooms.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0 scrollbar-none">
                {availableRooms.map((room) => {
                  const isSelected = selectedRooms.length === 0 || selectedRooms.includes(room);
                  return (
                    <button
                      key={room}
                      onClick={() => toggleRoomFilter(room)}
                      className={`shrink-0 flex items-center gap-1 px-2.5 py-1 text-[11px] md:text-xs font-medium rounded-full border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {room}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Date Navigation */}
            <div className="flex items-center justify-between md:justify-start gap-1.5 bg-slate-50 px-2 py-0.5 md:py-1 rounded-lg md:rounded-xl border border-slate-200">
              <button onClick={handlePrev} className="p-1 hover:bg-slate-200/60 rounded-md text-slate-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-[11px] md:text-xs font-bold text-slate-700 min-w-[130px] md:min-w-[150px] text-center">
                {dateRangeLabel}
              </span>
              <button onClick={handleNext} className="p-1 hover:bg-slate-200/60 rounded-md text-slate-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div ref={scrollRef} className="flex-1 max-h-[75vh] overflow-y-auto overflow-x-auto relative scroll-smooth bg-white">
          {(viewMode === 'day' || viewMode === 'week') && (
            <div className={`flex relative ${viewMode === 'day' ? 'w-full min-w-full' : 'min-w-[650px] md:min-w-[850px]'}`}>
              {/* Hour Column */}
              <div className="w-12 md:w-16 shrink-0 border-r border-slate-100 bg-white select-none sticky left-0 z-20 md:static">
                <div className="h-10 md:h-12 border-b border-slate-100 bg-white"></div>
                {hours.map((hour) => (
                  <div key={hour} className="h-[80px] relative text-right pr-1.5 md:pr-3">
                    <span className="text-[10px] md:text-[11px] font-semibold text-slate-400 -top-2.5 relative inline-block">
                      {hour < 10 ? `0${hour}:00` : `${hour}:00`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              <div className="flex-1 flex relative">
                {(viewMode === 'day' ? [currentDate] : weekDays).map((dayDate) => {
                  const dayIsoStr = toISODate(dayDate);
                  const isToday = dayIsoStr === toISODate(new Date());
                  const dayMeetings = calculateOverlaps(
                    filteredMeetings.filter((m) => String(m.date).split('T')[0].trim() === dayIsoStr)
                  );

                  return (
                    <div key={dayIsoStr} className="flex-1 min-w-[110px] md:min-w-[130px] border-r border-slate-100 relative">
                      <div className="h-10 md:h-12 border-b border-slate-100 flex flex-col items-center justify-center sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                        <span className="text-[9px] md:text-[11px] font-medium text-slate-400">
                          {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className={`text-[11px] md:text-xs font-bold px-1.5 py-0.5 rounded-md ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-800'}`}>
                          {dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {hours.map((hour) => (
                        <div key={hour} className="h-[80px] border-b border-slate-100/80 relative"></div>
                      ))}

                      {/* Current Time Line */}
                      {isToday && (
                        <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top: `${currentTimeTop + 40}px` }}>
                          <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 ring-2 ring-white"></div>
                          <div className="h-[1.5px] bg-red-500 flex-1"></div>
                        </div>
                      )}

                      {/* Overlapping Meeting Event Cards */}
                      <div className="absolute inset-0 top-10 md:top-12">
                        {dayMeetings.map((evt) => {
                          const topPos = (evt.startHour * HOUR_HEIGHT) + ((evt.startMinute / 60) * HOUR_HEIGHT);
                          const heightPos = (evt.durationMinute / 60) * HOUR_HEIGHT;
                          const widthPercent = 100 / evt.totalCols;
                          const leftPercent = evt.colIndex * widthPercent;
                          const isPending = evt.status === 'pending';
                          const isNarrow = evt.totalCols > 1;

                          return (
                            <div
                              key={evt.id}
                              onClick={() => setSelectedMeeting(evt)}
                              className={`absolute transition-all duration-150 cursor-pointer border overflow-hidden hover:z-30 hover:shadow-xl hover:scale-[1.02] ${
                                isNarrow ? 'p-1 rounded-lg' : 'p-1.5 md:p-2.5 rounded-xl'
                              } ${
                                isPending
                                  ? 'bg-indigo-50/95 border-2 border-dashed border-indigo-400 text-indigo-950 hover:bg-indigo-100'
                                  : `${isNarrow ? 'border-l-3' : 'border-l-4'} bg-indigo-50/95 border-l-indigo-600 border-indigo-200/80 text-indigo-950 hover:bg-indigo-100`
                              }`}
                              style={{
                                top: `${topPos + 2}px`,
                                height: `${Math.max(38, heightPos) - 4}px`,
                                width: `calc(${widthPercent}% - 3px)`,
                                left: `calc(${leftPercent}% + 1.5px)`,
                                zIndex: evt.colIndex + 1,
                              }}
                            >
                              <div className="flex flex-col justify-between h-full">
                                <div>
                                  <h2 className={`font-bold truncate leading-tight ${isNarrow ? 'text-[10px] md:text-[11px]' : 'text-xs'}`}>
                                    {evt.title} {isPending && <span className="font-normal text-[9px] text-indigo-600">(Pending)</span>}
                                  </h2>
                                  <p className={`font-semibold text-slate-500 mt-0.5 truncate ${isNarrow ? 'text-[9px]' : 'text-[10px]'}`}>
                                    {evt.startTime} {!isNarrow && `– ${evt.endTime}`}
                                    {(!isNarrow || evt.durationMinute >= 60) && evt.room && <><span className="mx-1">•</span>{evt.room}</>}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month View Grid */}
          {viewMode === 'month' && (
            <>
              {/* Desktop Original View */}
              <div className="hidden md:grid p-3 grid-cols-7 gap-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="text-center font-bold text-xs text-slate-400 py-1">
                    {d}
                  </div>
                ))}
                {monthDays.map((dayDate, i) => {
                  if (!dayDate) {
                    return <div key={`empty-${i}`} className="min-h-[90px] bg-slate-50/20 rounded-lg"></div>;
                  }
                  const dateStr = toISODate(dayDate);
                  const dayMeetings = filteredMeetings.filter((m) => String(m.date).split('T')[0].trim() === dateStr);
                  
                  const hiddenMeetings = dayMeetings.slice(2);

                  return (
                    <div key={dateStr} className="min-h-[90px] border border-slate-100 rounded-lg p-1.5 bg-slate-50/40 hover:bg-slate-50 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-slate-700">{dayDate.getDate()}</span>
                      <div className="space-y-1">
                        {dayMeetings.slice(0, 2).map((m) => (
                          <div
                            key={m.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMeeting(m);
                            }}
                            className="bg-indigo-600 text-white text-[9px] px-1 py-0.5 rounded truncate cursor-pointer font-medium hover:bg-indigo-700 transition-colors"
                          >
                            {m.title}
                          </div>
                        ))}

                        {hiddenMeetings.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDayModalData({ date: dayDate, meetings: hiddenMeetings });
                            }}
                            className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold px-1 py-0.5 rounded hover:bg-indigo-50 transition-colors w-full text-left cursor-pointer flex items-center justify-between group"
                          >
                            <span>+{hiddenMeetings.length} more</span>
                            <svg className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile View Month Layout */}
              <div className="block md:hidden p-2.5">
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <div key={d} className="text-[11px] font-medium text-slate-400 py-0.5">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                  {monthDays.map((dayDate, i) => {
                    if (!dayDate) {
                      return <div key={`m-empty-${i}`} className="h-8"></div>;
                    }
                    const dateStr = toISODate(dayDate);
                    const isSelected = dateStr === toISODate(currentDate);
                    const hasMeetings = filteredMeetings.some(
                      (m) => String(m.date).split('T')[0].trim() === dateStr
                    );

                    return (
                      <div
                        key={`m-day-${dateStr}`}
                        onClick={() => setCurrentDate(dayDate)}
                        className="flex flex-col items-center justify-center cursor-pointer py-0.5"
                      >
                        <span
                          className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          {dayDate.getDate()}
                        </span>
                        <div className="h-1 mt-0.5 flex items-center justify-center">
                          {hasMeetings && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Selected Day</h3>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>

                  <div className="mt-2 space-y-1.5">
                    {(() => {
                      const activeDayMeetings = filteredMeetings.filter(
                        (m) => String(m.date).split('T')[0].trim() === toISODate(currentDate)
                      );

                      if (activeDayMeetings.length === 0) {
                        return <p className="text-xs text-slate-400 italic py-1">No meetings scheduled for this day</p>;
                      }

                      return activeDayMeetings.map((m) => (
                        <div
                          key={`m-selected-${m.id}`}
                          onClick={() => setSelectedMeeting(m)}
                          className="flex items-center gap-2.5 bg-white border border-slate-200/80 p-2 rounded-lg shadow-2xs cursor-pointer hover:border-indigo-300 transition-colors"
                        >
                          <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                            {m.startTime}
                          </span>
                          <div className="flex-1 bg-indigo-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-md truncate">
                            {m.title}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer / Legend */}
        <div className="px-3 md:px-5 py-2 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between text-[11px] md:text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Confirmed Meeting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md border-2 border-dashed border-indigo-400 bg-indigo-50/50"></span>
              <span>Pending Approval</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side Details Panel */}
      {selectedMeeting && (
        <div className="w-full md:w-72 shrink-0 bg-white rounded-xl md:rounded-2xl border border-slate-200 p-3.5 md:p-4 shadow-xs self-start h-fit sticky top-4 mb-4 md:mb-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-bold text-slate-900 text-sm md:text-base leading-snug">{selectedMeeting.title}</h2>
            <button 
              onClick={() => setSelectedMeeting(null)} 
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-3.5 space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{selectedMeeting.date}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-600">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{selectedMeeting.startTime} – {selectedMeeting.endTime}</span>
            </div>

            {selectedMeeting.room && (
              <div className="flex items-center gap-2.5 text-slate-600">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="font-semibold text-slate-800">{selectedMeeting.room}</span>
              </div>
            )}

            {selectedMeeting.organizer && (
              <div className="flex items-center gap-2.5 text-slate-600">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{selectedMeeting.organizer}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* More Meetings Popover Modal */}
      {dayModalData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3"
          onClick={() => setDayModalData(null)}
        >
          <div 
            className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xs md:max-w-sm w-full p-4 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                  {dayModalData.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                  {dayModalData.meetings.length} More {dayModalData.meetings.length > 1 ? 'Meetings' : 'Meeting'}
                </p>
              </div>
              <button
                onClick={() => setDayModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-2 overflow-y-auto space-y-1.5 pr-0.5 flex-1">
              {dayModalData.meetings.map((m) => {
                const isPending = m.status === 'pending';
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMeeting(m);
                      setDayModalData(null);
                    }}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isPending
                        ? 'bg-indigo-50/40 border-dashed border-indigo-300 hover:bg-indigo-50'
                        : 'bg-slate-50/80 border-slate-200/80 hover:bg-indigo-50/60 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{m.title}</h4>
                      {isPending && (
                        <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200 shrink-0">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <span>{m.startTime} – {m.endTime}</span>
                      {m.room && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-slate-700 truncate">{m.room}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
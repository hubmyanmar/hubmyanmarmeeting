import React, { useEffect, useRef } from 'react';

export default function Calendar({ bookedMeetings = [] }) {
  const START_HOUR = 0;
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const HOUR_HEIGHT = 100;
  const scrollRef = useRef(null);

  const themeMap = {
    blue: 'bg-sky-50 border-sky-500 text-sky-950 hover:bg-sky-100',
    indigo: 'bg-indigo-50 border-indigo-500 text-indigo-950 hover:bg-indigo-100',
    emerald: 'bg-emerald-50 border-emerald-500 text-emerald-950 hover:bg-emerald-100',
    violet: 'bg-violet-50 border-violet-500 text-violet-950 hover:bg-violet-100',
    rose: 'bg-rose-50 border-rose-500 text-rose-950 hover:bg-rose-100',
  };

  const colors = Object.keys(themeMap);
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || '?';
  };

  const parseTimeString = (timeStr) => {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;

    const rawHour = h;
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    return { hour: h, minute: m, ampm, rawHour };
  };

  const calculateOverlaps = (events) => {
    const formatted = events
      .map((evt, idx) => {
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
          
          if (startParsed.hour >= 20 && endParsed.rawHour === 12 && endParsed.ampm === 'PM') {
            endTotal = 24 * 60; 
          } else if (endTotal <= startTotal) {
            endTotal += 24 * 60;
          }
          
          duration = endTotal - startTotal;

          if (duration > 720) {
            duration = 60;
          }
        }

        const startMinutes = (sHour ?? 9) * 60 + (sMin ?? 0);
        const endMinutes = startMinutes + (duration ?? 60);

        const locationText = evt.meetingType?.trim().toLowerCase() === 'online'
          ? 'Online Meeting'
          : (evt.room || evt.location || 'Physical Room');

        return {
          ...evt,
          id: evt.id || `evt-${idx}`,
          title: evt.title || evt.meetingTitle || evt.topic || 'Untitled Meeting',
          time: evt.time || `${evt.startTime || ''} - ${evt.endTime || ''}`,
          startHour: sHour ?? 9,
          startMinute: sMin ?? 0,
          durationMinute: duration ?? 60,
          startMinutes,
          endMinutes,
          color: evt.color || colors[idx % colors.length],
          location: locationText,
          attendees: Array.isArray(evt.attendees) ? evt.attendees : [],
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

  const processedMeetings = calculateOverlaps(bookedMeetings);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeTop = ((currentHour - START_HOUR) * HOUR_HEIGHT) + ((currentMinute / 60) * HOUR_HEIGHT);
  
  useEffect(() => {
    if (scrollRef.current) {
      const scrollTarget = Math.max(0, (currentHour - 2) * HOUR_HEIGHT);
      scrollRef.current.scrollTop = scrollTarget;
    }
  }, [currentHour]);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 bg-slate-100 min-h-screen font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[88vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">Monday, Sep 14</h1>
            <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
              Today
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold text-slate-600">
              <button className="px-3 py-1.5 bg-white text-slate-900 shadow-xs rounded-lg">Day</button>
              <button className="px-3 py-1.5 hover:text-slate-900 transition">Week</button>
              <button className="px-3 py-1.5 hover:text-slate-900 transition">Month</button>
            </div>
          </div>
        </div>

        {/* Calendar Grid Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="flex min-w-[650px] relative">
            
            {/* Left Time Column */}
            <div className="w-20 shrink-0 border-r border-slate-100 bg-slate-50/30 select-none">
              {hours.map((hour) => (
                <div key={hour} className="h-[100px] relative text-right pr-3">
                  <span className="text-xs font-bold text-slate-400 -top-2.5 relative inline-block">
                    {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Main Events Grid Area */}
            <div className="flex-1 relative">
              {hours.map((hour) => (
                <div key={hour} className="h-[100px] border-b border-slate-100 relative">
                  <div className="absolute top-1/2 left-0 right-0 border-b border-slate-100 border-dashed"></div>
                </div>
              ))}

              {/* Red Current Time Line */}
              <div
                className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                style={{ top: `${currentTimeTop}px` }}
              >
                <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 ring-4 ring-red-100"></div>
                <div className="h-[2px] bg-red-500 flex-1"></div>
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 shadow-xs">
                  {currentHour % 12 || 12}:{currentMinute < 10 ? `0${currentMinute}` : currentMinute} {currentHour >= 12 ? 'PM' : 'AM'}
                </span>
              </div>

              {/* Rendered Meetings */}
              <div className="absolute inset-0 pr-4">
                {processedMeetings.map((evt) => {
                  const topPos = ((evt.startHour - START_HOUR) * HOUR_HEIGHT) + ((evt.startMinute / 60) * HOUR_HEIGHT);
                  const heightPos = (evt.durationMinute / 60) * HOUR_HEIGHT;

                  const widthPercent = 100 / evt.totalCols;
                  const leftPercent = evt.colIndex * widthPercent;

                  return (
                    <div
                      key={evt.id}
                      className={`absolute rounded-xl border-l-4 p-3 transition-all duration-150 shadow-xs hover:shadow-md hover:z-30 cursor-pointer overflow-hidden ${themeMap[evt.color] || themeMap.blue}`}
                      style={{
                        top: `${Math.max(0, topPos) + 2}px`,
                        height: `${Math.max(45, heightPos) - 4}px`,
                        width: `calc(${widthPercent}% - 8px)`,
                        left: `calc(${leftPercent}% + 8px)`,
                      }}
                    >
                      <div className="flex flex-col justify-between h-full overflow-hidden">
                        <div>
                          <h2 className="text-xs sm:text-sm font-bold truncate leading-tight">{evt.title}</h2>
                          <p className="text-[11px] font-semibold opacity-80 mt-0.5 truncate">{evt.time}</p>
                        </div>

                        {evt.durationMinute >= 45 && (
                          <div className="flex items-center justify-between mt-1 text-[11px] opacity-90 gap-1">
                            <span className="truncate flex items-center gap-1">
                              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {evt.location}
                            </span>

                            {/* Attendees Avatar Rendering (Only Initials Badge) */}
                            <div className="flex -space-x-1 shrink-0">
                              {evt.attendees.slice(0, 3).map((person, idx) => {
                                const name = typeof person === 'object' && person !== null
                                  ? (person.name || person.fullName || person.title)
                                  : (typeof person === 'string' ? person : '');

                                return (
                                  <div
                                    key={idx}
                                    className="w-5 h-5 rounded-full ring-1 ring-white bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center shrink-0"
                                    title={name}
                                  >
                                    {getInitials(name)}
                                  </div>
                                );
                              })}
                            </div>

                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
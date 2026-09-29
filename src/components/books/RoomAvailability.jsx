import React, { useEffect } from 'react';

const START_HOUR = 9;  
const END_HOUR = 17;   
const STEP_HOURS = 2;  

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const upper = timeStr.trim().toUpperCase();
  let hours = 0, minutes = 0;

  if (upper.includes('AM') || upper.includes('PM')) {
    const isPM = upper.includes('PM');
    const isAM = upper.includes('AM');
    const [h, m] = upper.replace('AM', '').replace('PM', '').trim().split(':');
    hours = parseInt(h, 10) || 0;
    minutes = parseInt(m, 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
  } else {
    const [h, m] = upper.split(':');
    hours = parseInt(h, 10) || 0;
    minutes = parseInt(m, 10) || 0;
  }
  return hours * 60 + minutes;
};

const generateTimeScale = (start, end, step) => {
  const scale = [];
  for (let h = start; h <= end; h += step) {
    const hour12 = h % 12 || 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    scale.push(`${hour12} ${ampm}`);
  }
  return scale;
};

const getLocalDateString = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getBookingInfo = (b) => {
  const rawDate = b.meeting_date || b.date || "";
  const cleanDate = rawDate ? String(rawDate).split('T')[0] : "";
  return {
    roomId: b.room_id !== undefined && b.room_id !== null ? String(b.room_id) : "",
    roomName: String(b.room_name || b.room || "").trim(),
    date: cleanDate,
    startTime: b.start_time || b.startTime || "",
    endTime: b.end_time || b.endTime || ""
  };
};

export default function RoomAvailability({ data, setData, bookedMeetings = [], rooms: roomsProp = [] }) {
  const TOTAL_WORK_MINUTES = (END_HOUR - START_HOUR) * 60; 
  const startOfDayMinutes = START_HOUR * 60; 
  const timeScaleLabels = generateTimeScale(START_HOUR, END_HOUR, STEP_HOURS);

  const rooms = Array.isArray(roomsProp) ? roomsProp : [];
  const todayStr = getLocalDateString(new Date());
  const currentViewDate = data?.date || todayStr;

  const activeBookings = bookedMeetings;

  const userStart = parseTime(data?.startTime || "09:00 AM");
  const userEnd = parseTime(data?.endTime || "10:00 AM");

  const userSelectLeft = (Math.max(0, userStart - startOfDayMinutes) / TOTAL_WORK_MINUTES) * 100;
  const userSelectWidth = Math.max(0, ((userEnd - userStart) / TOTAL_WORK_MINUTES) * 100);

  const handleDateChange = (daysToAdd) => {
    const [year, month, day] = currentViewDate.split('-').map(Number);
    const current = new Date(year, month - 1, day);
    current.setDate(current.getDate() + daysToAdd);
    setData(prev => ({ ...prev, date: getLocalDateString(current) }));
  };

  const getDisplayDateLabel = () => {
    const [year, month, day] = currentViewDate.split('-').map(Number);
    const dObj = new Date(year, month - 1, day);
    return dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleSelectRoom = (room) => {
    const roomIdOrName = room.id ? String(room.id) : (room.name || room.room_name);
    setData(prev => ({ ...prev, room: roomIdOrName }));
  };

  return (
    <div className="flex-1 bg-white pt-1 pb-9 mb-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Room Availability</h3>
      
      {/* Date Navigation Control */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-2.5 mt-3 mb-5 shadow-xs">
        <button 
          type="button"
          onClick={() => handleDateChange(-1)}
          className="p-1.5 hover:bg-gray-200/70 active:scale-95 rounded-lg text-gray-600 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="font-semibold text-gray-800 text-sm tracking-wide">
          {getDisplayDateLabel()}
        </span>

        <button 
          type="button"
          onClick={() => handleDateChange(1)}
          className="p-1.5 hover:bg-gray-200/70 active:scale-95 rounded-lg text-gray-600 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        <span className="font-semibold text-indigo-600">{data?.startTime || "09:00 AM"} - {data?.endTime || "10:00 AM"}</span> အတွက် လွတ်လပ်သော အခန်းများ
      </p>

      <div className="flex justify-between text-[11px] text-gray-400 font-medium px-1 mb-2">
        {timeScaleLabels.map((label, idx) => (
          <span key={idx}>{label}</span>
        ))}
      </div>

      <div className="space-y-3.5 pb-4">
        {rooms.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            Database မှ အခန်းစာရင်းများ ရယူနေပါသည်...
          </div>
        ) : (
          rooms.map((room, idx) => {
            const roomName = String(room.name || room.room_name || `Room ${room.id}`).trim();
            const roomId = room.id ? String(room.id) : "";
            const roomCapacity = room.capacity || room.room_capacity;

            const roomBookings = activeBookings.filter(b => {
              const info = getBookingInfo(b);
              const isIdMatch = roomId && (info.roomId === roomId);
              const isNameMatch = roomName && (info.roomName.toLowerCase() === roomName.toLowerCase());
              
              const isMatchRoom = isIdMatch || isNameMatch;
              const isMatchDate = !info.date || info.date === currentViewDate;
              
              return isMatchRoom && isMatchDate;
            });

            const isConflict = roomBookings.some(b => {
              const info = getBookingInfo(b);
              const bStart = parseTime(info.startTime);
              const bEnd = parseTime(info.endTime);
              return userStart < bEnd && userEnd > bStart;
            });

            const isSelected = data?.room === roomId || data?.room === roomName;

            let cardStyle = "p-3.5 rounded-xl border-2 transition-all ";
            if (isConflict) {
              cardStyle += "bg-amber-50/60 border-amber-200 opacity-90 cursor-not-allowed pointer-events-none select-none";
            } else if (isSelected) {
              cardStyle += "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs cursor-pointer";
            } else {
              cardStyle += "bg-emerald-50/30 border-emerald-200 hover:border-emerald-400 cursor-pointer";
            }

            return (
              <div key={room.id || idx} onClick={() => !isConflict && handleSelectRoom(room)} className={cardStyle}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${isConflict ? "text-amber-800" : "text-gray-800"}`}>
                      {roomName}
                    </span>
                    {roomCapacity && (
                      <span className="text-[11px] text-gray-400">({roomCapacity} seats)</span>
                    )}
                  </div>
                  {isConflict ? (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      Booked / Busy
                    </span>
                  ) : isSelected ? (
                    <span className="text-[10px] font-semibold text-white bg-indigo-600 px-2.5 py-0.5 rounded-md shadow-xs">Selected</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Available</span>
                  )}
                </div>

                <div className="relative w-full h-4 bg-gray-100 rounded-lg overflow-hidden border border-gray-200/80">
                  {roomBookings.map((b, bIdx) => {
                    const info = getBookingInfo(b);
                    const bStart = parseTime(info.startTime);
                    const bEnd = parseTime(info.endTime);
                    const left = (Math.max(0, bStart - startOfDayMinutes) / TOTAL_WORK_MINUTES) * 100;
                    const width = ((bEnd - bStart) / TOTAL_WORK_MINUTES) * 100;

                    return (
                      <div 
                        key={bIdx} 
                        title={`Booked: ${info.startTime} - ${info.endTime}`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        className="absolute top-0 bottom-0 bg-amber-500 bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:8px_8px] border-r border-white/40 z-10 flex items-center justify-center overflow-hidden"
                      >
                        <svg className="w-2.5 h-2.5 text-amber-950/80 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    );
                  })}

                  {userSelectWidth > 0 && !isConflict && (
                    <div 
                      style={{ left: `${userSelectLeft}%`, width: `${userSelectWidth}%` }}
                      className={`absolute top-0 bottom-0 transition-all z-20 ${
                        isSelected ? "bg-indigo-600 border-2 border-indigo-800 shadow-xs" : "bg-emerald-500 border border-emerald-600"
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
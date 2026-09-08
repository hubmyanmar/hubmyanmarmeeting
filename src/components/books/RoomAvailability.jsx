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

export default function RoomAvailability({ data, setData, bookedMeetings = [] }) {
  const TOTAL_WORK_MINUTES = (END_HOUR - START_HOUR) * 60; 
  const startOfDayMinutes = START_HOUR * 60; 
  const timeScaleLabels = generateTimeScale(START_HOUR, END_HOUR, STEP_HOURS);

  const rooms = [
    { name: "MD Room", capacity: 12 },
    { name: "Bagan Room", capacity: 8 },
    { name: "Konbaung Room", capacity: 20 },
    { name: "BOD Home", capacity: 6 }
  ];

  const todayStr = getLocalDateString(new Date());

  const sampleBookings = bookedMeetings.length > 0 ? bookedMeetings : [
    { room: "Meeting Room B", date: todayStr, startTime: "09:00 AM", endTime: "10:30 AM" },
    { room: "Meeting Room B", date: todayStr, startTime: "01:00 PM", endTime: "02:30 PM" },
    { room: "BOD Home", date: todayStr, startTime: "10:00 AM", endTime: "11:30 AM" },
  ];

  const userStart = parseTime(data?.startTime || "09:00 AM");
  const userEnd = parseTime(data?.endTime || "10:00 AM");

  const userSelectLeft = (Math.max(0, userStart - startOfDayMinutes) / TOTAL_WORK_MINUTES) * 100;
  const userSelectWidth = Math.max(0, ((userEnd - userStart) / TOTAL_WORK_MINUTES) * 100);

  const handleDateChange = (daysToAdd) => {
    const current = data?.date ? new Date(data.date) : new Date();
    current.setDate(current.getDate() + daysToAdd);
    setData(prev => ({ ...prev, date: getLocalDateString(current) }));
  };

  const getDisplayDateLabel = () => {
    const currentDateStr = data?.date || todayStr;
    const [year, month, day] = currentDateStr.split('-');
    const dObj = new Date(year, month - 1, day);
    
    return dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    if (data?.room) {
      const selectedRoomBookings = sampleBookings.filter(b => {
        const isSameRoom = b.room === data.room;
        const isSameDate = !data?.date || !b.date || b.date === data?.date;
        return isSameRoom && isSameDate;
      });

      const isConflict = selectedRoomBookings.some(b => {
        const bStart = parseTime(b.startTime);
        const bEnd = parseTime(b.endTime);
        return userStart < bEnd && userEnd > bStart;
      });

      if (isConflict) {
        setData(prev => ({ ...prev, room: "" }));
      }
    }
  }, [data?.startTime, data?.endTime, data?.date, data?.room]);

  const handleSelectRoom = (roomName) => {
    setData(prev => ({ ...prev, room: roomName }));
  };

  return (
    <div className="flex-1 bg-white">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Room Availability</h3>
      
      {/* Date Navigation Control */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-2.5 mt-3 mb-5 shadow-sm">
        <button 
          onClick={() => handleDateChange(-1)}
          className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="font-semibold text-gray-800 text-sm tracking-wide">
          {getDisplayDateLabel()}
        </span>

        <button 
          onClick={() => handleDateChange(1)}
          className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"
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

      <div className="space-y-4">
        {rooms.map((room, idx) => {
          const currentViewDate = data?.date || todayStr;
          const roomBookings = sampleBookings.filter(b => {
            return b.room === room.name && (!b.date || b.date === currentViewDate);
          });

          const isConflict = roomBookings.some(b => {
            const bStart = parseTime(b.startTime);
            const bEnd = parseTime(b.endTime);
            return userStart < bEnd && userEnd > bStart;
          });

          const isSelected = data?.room === room.name;

          let cardStyle = "p-3.5 rounded-xl border-2 transition-all ";
          if (isConflict) {
            cardStyle += "bg-red-50/70 border-red-200 opacity-75 cursor-not-allowed pointer-events-none select-none";
          } else if (isSelected) {
            cardStyle += "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm cursor-pointer";
          } else {
            cardStyle += "bg-emerald-50/30 border-emerald-200 hover:border-emerald-400 cursor-pointer";
          }

          return (
            <div key={idx} onClick={() => !isConflict && handleSelectRoom(room.name)} className={cardStyle}>
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${isConflict ? "text-red-700" : "text-gray-800"}`}>
                    {room.name}
                  </span>
                  <span className="text-[11px] text-gray-400">({room.capacity} seats)</span>
                </div>
                {isConflict ? (
                  <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">Disabled</span>
                ) : isSelected ? (
                  <span className="text-[10px] font-semibold text-white bg-indigo-600 px-2.5 py-0.5 rounded shadow-sm">Selected</span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Available</span>
                )}
              </div>

              <div className="relative w-full h-5 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                {roomBookings.map((b, bIdx) => {
                  const bStart = parseTime(b.startTime);
                  const bEnd = parseTime(b.endTime);
                  const left = (Math.max(0, bStart - startOfDayMinutes) / TOTAL_WORK_MINUTES) * 100;
                  const width = ((bEnd - bStart) / TOTAL_WORK_MINUTES) * 100;

                  return (
                    <div 
                      key={bIdx} title={`Booked: ${b.startTime} - ${b.endTime}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      className="absolute top-0 bottom-0 bg-red-500 border-r border-white/50 z-10"
                    />
                  );
                })}

                {userSelectWidth > 0 && !isConflict && (
                  <div 
                    style={{ left: `${userSelectLeft}%`, width: `${userSelectWidth}%` }}
                    className={`absolute top-0 bottom-0 transition-all z-20 ${
                      isSelected ? "bg-indigo-600 border-2 border-indigo-800 shadow-md" : "bg-emerald-500 border border-emerald-600"
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
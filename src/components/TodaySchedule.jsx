import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseTimeToDate = (timeStr) => {
  if (!timeStr) return new Date();
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  const d = new Date();
  d.setHours(hours, parseInt(minutes, 10), 0, 0);
  return d;
};

const ScheduleItem = ({ time, title, room, status, text, onJoin, onView, roomInfo }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold text-indigo-600 w-20">{time}</span>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{room}</p>
        </div>
      </div>
      <div>
        {status === 'badge' && (
          <div className="relative inline-block">
            <button 
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="bg-[#F3E8FF] text-[#9333EA] px-2 py-0.5 rounded text-[11px] font-bold border border-[#E9D5FF] flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {roomInfo?.elapsed || text}
            </button>
            
            {showTooltip && (
              <div className="absolute right-0 top-7 z-20 w-44 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                  <Users size={12} /> {roomInfo?.joinedCount || 1} Members Joined
                </div>
                <div className="text-gray-300 flex items-center gap-1">
                  <Clock size={12} /> Started {roomInfo?.elapsed} ago
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Join Button */}
        {status === 'primary' && (
          <button 
            onClick={onJoin} 
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            {text}
          </button>
        )}
        
        {/* View Button */}
        {status === 'outline' && (
          <button 
            onClick={onView} 
            className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            {text}
          </button>
        )}
      </div>
    </div>
  );
};

export default function TodaySchedule({ bookedMeetings = [] }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleJoin = (item) => {
    navigate('/dashboard/meeting-records', { state: { meeting: item, mode: 'join' } });
  };

  const handleView = (item) => {
    navigate('/dashboard/action-items', { state: { meeting: item, mode: 'view' } });
  };

  const todayDate = getTodayDate();

  const dynamicScheduleData = bookedMeetings
    .filter(m => m.date === todayDate)
    .sort((a, b) => parseTimeToDate(a.startTime) - parseTimeToDate(b.startTime))
    .map((meeting, index) => {
      const start = parseTimeToDate(meeting.startTime);
      const end = parseTimeToDate(meeting.endTime || meeting.startTime);
      const diffStartMs = start - currentTime;
      const diffStartMins = Math.floor(diffStartMs / (1000 * 60)); 
      
      let status = 'outline';
      let text = 'View';
      let roomInfo = null;

      if (currentTime >= start && currentTime < end) {
        const elapsedMins = Math.floor((currentTime - start) / (1000 * 60));
        status = 'badge';
        text = `${elapsedMins} mins`;
        roomInfo = { 
          joinedCount: meeting.participants?.length || 2,
          elapsed: `${elapsedMins} mins`
        };
      } 
      
      else if (diffStartMins > 0 && diffStartMins <= 15) {
        status = 'primary';
        text = 'Join';
      } 
      
      else {
        status = 'outline';
        text = 'View';
      }

      return {
        id: meeting.id || index + 1,
        time: meeting.startTime,
        title: meeting.title,
        room: meeting.room,
        status,
        text,
        roomInfo,
        originalData: meeting
      };
    });

  return (
    <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-base font-bold text-gray-900 mb-3">Today's Schedule</h3>
      <div className="divide-y divide-gray-50 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {dynamicScheduleData.length > 0 ? (
          dynamicScheduleData.map((item) => (
            <ScheduleItem 
              key={item.id} 
              {...item} 
              onJoin={() => handleJoin(item)}
              onView={() => handleView(item)}
            />
          ))
        ) : (
          <div className="text-center py-6 text-sm text-gray-400">
            No meetings scheduled for today.
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle2 } from 'lucide-react';

// --- Utility Functions ---
const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeToAMPM = (timeStr) => {
  if (!timeStr) return '';
  const upper = String(timeStr).toUpperCase();
  if (upper.includes('AM') || upper.includes('PM')) {
    return upper;
  }
  const parts = String(timeStr).trim().split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return timeStr;

  const modifier = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedHours = String(hours).padStart(2, '0');
  return `${formattedHours}:${minutes} ${modifier}`;
};

const parseTimeToDate = (timeStr) => {
  if (!timeStr) return new Date();
  const formattedStr = formatTimeToAMPM(timeStr);
  const parts = formattedStr.split(' ');
  const timePart = parts[0];
  const modifier = parts[1] || '';
  
  let [hours, minutes] = timePart.split(':');
  hours = parseInt(hours || 0, 10);
  
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  const d = new Date();
  d.setHours(hours, parseInt(minutes || 0, 10), 0, 0);
  return d;
};

const formatDisplayValue = (val) => {
  if (!val) return '';
  if (typeof val === 'object') {
    return val.name || val.title || val.room_name || val.room || val.label || JSON.stringify(val);
  }
  return String(val);
};

const sanitizeMeetingData = (meeting) => {
  if (!meeting) return {};
  return {
    ...meeting,
    title: formatDisplayValue(meeting.title || meeting.meeting_title || meeting.name),
    room: formatDisplayValue(meeting.room || meeting.meeting_room || meeting.room_name),
    date: formatDisplayValue(meeting.date || meeting.meeting_date),
  };
};

const ScheduleItem = ({ time, title, room, status, text, onJoin, onView, roomInfo }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50/50 px-2 rounded-lg -mx-2">
      {/* Meeting Info */}
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold text-indigo-600 w-24">{time}</span>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{formatDisplayValue(title)}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{formatDisplayValue(room)}</p>
        </div>
      </div>

      {/* Action Buttons & Status Badges */}
      <div>
        {status === 'badge' && (
          <div className="relative inline-block">
            <button 
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="bg-[#F3E8FF] text-[#9333EA] px-2 py-0.5 rounded text-[11px] font-bold border border-[#E9D5FF] flex items-center gap-1 cursor-pointer whitespace-nowrap"
              aria-label="Meeting is running"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {roomInfo?.elapsed || text}
            </button>
            
            {showTooltip && (
              <div className="absolute right-0 top-7 z-20 w-44 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-800 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                  <Users size={12} /> {roomInfo?.joinedCount || 1} Members
                </div>
                <div className="text-gray-300 flex items-center gap-1">
                  <Clock size={12} /> Started {roomInfo?.elapsed} ago
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'completed' && (
          <button 
            onClick={onView} 
            className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
            title="View Meeting Details"
          >
            <CheckCircle2 size={12} className="text-emerald-500" />
            {text}
          </button>
        )}
        
        {status === 'primary' && (
          <button 
            onClick={onJoin} 
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            {text}
          </button>
        )}
        
        {status === 'outline' && (
          <button 
            onClick={onView} 
            className="border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            {text}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Main Component: TodaySchedule ---
export default function TodaySchedule({ bookedMeetings = [] }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('meetingSessions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error parsing meeting sessions:", e);
      return {};
    }
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('meetingSessions');
        if (saved) setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading storage:", e);
      }
    };

    handleStorageChange();

    window.addEventListener('storage', handleStorageChange); 
    window.addEventListener('sync-meeting-sessions', handleStorageChange); 

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sync-meeting-sessions', handleStorageChange);
    };
  }, []);

  const handleJoin = (item) => {
    const meetingId = item.id;
    const nowIso = new Date().toISOString();

    const updatedSessions = {
      ...sessions,
      [meetingId]: {
        status: 'running',
        startedAt: nowIso,
        stoppedAt: null,
        room: formatDisplayValue(item.room || item.originalData?.room || 'Unknown Room'),
        date: formatDisplayValue(item.date || item.originalData?.date || item.originalData?.meeting_date || nowIso.split('T')[0]),
        originalData: sanitizeMeetingData(item.originalData || item)
      }
    };

    setSessions(updatedSessions);
    localStorage.setItem('meetingSessions', JSON.stringify(updatedSessions));
    const cleanedOriginal = sanitizeMeetingData(item.originalData || item);
    const meetingWithId = { ...cleanedOriginal, id: meetingId };

    if (meetingWithId?.meetingLink || meetingWithId?.meeting_link) {
      window.open(meetingWithId.meetingLink || meetingWithId.meeting_link, '_blank');
    }

    navigate('/dashboard/meeting-records', { state: { meeting: meetingWithId, mode: 'join' } });
  };

  const handleView = (item) => {
    const cleanedOriginal = sanitizeMeetingData(item.originalData || item);
    const meetingWithId = { ...cleanedOriginal, id: item.id };
    navigate('/dashboard/action-items', { state: { meeting: meetingWithId, mode: 'view' } });
  };

  const todayDate = getTodayDate();

  const todayFilteredMeetings = bookedMeetings.filter(m => {
    const rawDate = m.date || m.meeting_date || '';
    return String(rawDate).includes(todayDate) || todayDate.includes(String(rawDate));
  });

  const dynamicScheduleData = todayFilteredMeetings
    .sort((a, b) => {
      const timeStrA = a.startTime || a.start_time || '00:00';
      const timeStrB = b.startTime || b.start_time || '00:00';
      return parseTimeToDate(timeStrA) - parseTimeToDate(timeStrB);
    })
    .map((meeting, index) => {
      const titleStr = formatDisplayValue(meeting.title || meeting.meeting_title || 'meeting');
      const meetingId = meeting.id || `meeting_${index}_${titleStr}`.replace(/[^a-zA-Z0-9]/g, '_');
      
      const rawStartTime = meeting.startTime || meeting.start_time || '12:00:00';
      const startTimeStr = formatTimeToAMPM(rawStartTime);
      
      const start = parseTimeToDate(rawStartTime);
      const diffStartMs = start - currentTime;
      const diffStartMins = Math.floor(diffStartMs / (1000 * 60)); 
      
      const session = sessions[meetingId];

      let status = 'outline';
      let text = 'View';
      let roomInfo = null;

      if (session?.status === 'stopped') {
        status = 'completed';
        text = 'Completed';
      } else if (session?.status === 'running') {
        const startTimeObj = new Date(session.startedAt);
        const elapsedMins = Math.max(0, Math.floor((currentTime - startTimeObj) / (1000 * 60)));
        status = 'badge';
        text = `${elapsedMins} mins`;
        const memberCount = Array.isArray(meeting.participants)
          ? meeting.participants.length
          : typeof meeting.participants === 'number'
          ? meeting.participants
          : meeting.attendees?.length || 0;

        roomInfo = { 
          joinedCount: memberCount,
          elapsed: `${elapsedMins} mins`
        };
      } else if (diffStartMins >= -15 && diffStartMins <= 15) {
        status = 'primary';
        text = 'Join';
      } else {
        status = 'outline';
        text = 'View';
      }

      return {
        id: meetingId,
        time: startTimeStr,
        title: meeting.title || meeting.meeting_title || 'Untitled Meeting',
        room: meeting.room || meeting.meeting_room || 'Main Room',
        status,
        text,
        roomInfo,
        originalData: meeting
      };
    });

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="text-base font-bold text-gray-900 mb-4 tracking-tight">Today's Schedule</h3>
      
      <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar flex-1">
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
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="bg-gray-50 p-3 rounded-full mb-3">
              <Clock size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No meetings today</p>
            <p className="text-xs text-gray-500 mt-1">Take a break or schedule a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
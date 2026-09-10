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

// --- Child Component: ScheduleItem ---
const ScheduleItem = ({ time, title, room, status, text, onJoin, onView, roomInfo }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50/50 px-2 rounded-lg -mx-2">
      {/* Meeting Info */}
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold text-indigo-600 w-20">{time}</span>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{room}</p>
        </div>
      </div>

      {/* Action Buttons & Status Badges */}
      <div>
        {/* 1. Running Status Badge */}
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
        
        {/* 3. Join Meeting Button */}
        {status === 'primary' && (
          <button 
            onClick={onJoin} 
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            {text}
          </button>
        )}
        
        {/* 4. View Meeting Button (Future/Missed) */}
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

  // Initialize sessions from LocalStorage
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('meetingSessions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error parsing meeting sessions:", e);
      return {};
    }
  });

  // Sync Timer & Storage Events
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('meetingSessions');
        if (saved) setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading storage:", e);
      }
    };

    // Initial fetch to guarantee accuracy on mount
    handleStorageChange();

    // Listeners for multi-tab and single-tab real-time updates
    window.addEventListener('storage', handleStorageChange); 
    window.addEventListener('sync-meeting-sessions', handleStorageChange); 

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sync-meeting-sessions', handleStorageChange);
    };
  }, []);

  // Handlers
  const handleJoin = (item) => {
    const meetingId = item.id;
    const nowIso = new Date().toISOString();

    const updatedSessions = {
      ...sessions,
      [meetingId]: {
        status: 'running',
        startedAt: nowIso,
        stoppedAt: null,
        room: item.room || item.originalData?.room || 'Unknown Room',
        date: item.date || item.originalData?.date || nowIso.split('T')[0],
        // 🎯 Original Meeting Data ပါ မှတ်ထားပေးလျှင် ပိုကောင်းပါသည်
        originalData: item.originalData || item
      }
    };

    setSessions(updatedSessions);
    localStorage.setItem('meetingSessions', JSON.stringify(updatedSessions));

    const meetingWithId = { ...item.originalData, id: meetingId };
    navigate('/dashboard/meeting-records', { state: { meeting: meetingWithId, mode: 'join' } });
  };

  const handleView = (item) => {
    const meetingWithId = { ...item.originalData, id: item.id };
    navigate('/dashboard/action-items', { state: { meeting: meetingWithId, mode: 'view' } });
  };

  // Data Processing
  const todayDate = getTodayDate();

  const dynamicScheduleData = bookedMeetings
    .filter(m => m.date === todayDate)
    .sort((a, b) => parseTimeToDate(a.startTime) - parseTimeToDate(b.startTime))
    .map((meeting) => {
      // Create a stable unique identifier
      const meetingId = meeting.id || `meeting_${meeting.title}_${meeting.startTime}`.replace(/[^a-zA-Z0-9]/g, '_');
      
      const start = parseTimeToDate(meeting.startTime);
      const diffStartMs = start - currentTime;
      const diffStartMins = Math.floor(diffStartMs / (1000 * 60)); 
      
      const session = sessions[meetingId];

      let status = 'outline';
      let text = 'View';
      let roomInfo = null;

      // 1. Meeting is Stopped (Completed)
      if (session?.status === 'stopped') {
        status = 'completed';
        text = 'Completed';
      } 
      // 2. Meeting is currently Running
      else if (session?.status === 'running') {
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
      } 
      // 3. Meeting is about to start (-15 to +15 mins window)
      else if (diffStartMins >= -15 && diffStartMins <= 15) {
        status = 'primary';
        text = 'Join';
      } 
      // 4. Default / View Mode (Future or Past meetings without sessions)
      else {
        status = 'outline';
        text = 'View';
      }

      return {
        id: meetingId,
        time: meeting.startTime,
        title: meeting.title,
        room: meeting.room,
        status,
        text,
        roomInfo,
        originalData: meeting
      };
    });

  // Render Component
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
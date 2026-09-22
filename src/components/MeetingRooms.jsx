import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Filter,
  CheckCircle2,
  Lock,
  PlayCircle
} from 'lucide-react';

import baganImg from '../assets/Bagan.jpg';
import yangonImg from '../assets/Bagan.jpg';
import inleImg from '../assets/Bagan.jpg';
import mandalayImg from '../assets/Bagan.jpg';

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const normalizeDate = (dateVal) => {
  if (!dateVal) return '';
  return String(dateVal).split('T')[0].trim();
};

const formatTimeToAMPM = (timeStr) => {
  if (!timeStr || timeStr === 'TBD') return 'TBD';

  if (String(timeStr).toUpperCase().includes('AM') || String(timeStr).toUpperCase().includes('PM')) {
    return timeStr;
  }

  const parts = String(timeStr).trim().split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 

  const formattedHours = String(hours).padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
};

export default function MeetingRooms({ bookedMeetings = [], meetingRooms = [], usersList = [] }) {
  const [filter, setFilter] = useState('all');
  
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('meetingSessions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const defaultImages = [baganImg, yangonImg, inleImg, mandalayImg];
  const baseRooms = meetingRooms.map((room, index) => ({
    ...room,
    image: room.image || defaultImages[index % defaultImages.length] 
  }));

  const allUsers = usersList;

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('meetingSessions');
        if (saved) setSessions(JSON.parse(saved));
      } catch (e) {}
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sync-meeting-sessions', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sync-meeting-sessions', handleStorageChange);
    };
  }, []);

  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return -1;
    const cleaned = String(timeStr).trim();
    if (cleaned.toUpperCase().includes('AM') || cleaned.toUpperCase().includes('PM')) {
      const [time, modifier] = cleaned.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    } else {
      const [hours, minutes] = cleaned.split(':').map(Number);
      return (hours || 0) * 60 + (minutes || 0);
    }
  };

  const getMeetingOrganizer = (data) => {
    if (!data) return 'Unknown Organizer';

    if (typeof data.organizer === 'object' && data.organizer !== null) {
      if (data.organizer.name) return data.organizer.name;
      if (data.organizer.fullName) return data.organizer.fullName;
    }
    if (typeof data.user === 'object' && data.user !== null) {
      if (data.user.name) return data.user.name;
      if (data.user.fullName) return data.user.fullName;
    }

    const directName = data.organizer_name || data.creator_name || data.user_name || data.userName;
    if (directName && isNaN(Number(directName))) return directName;

    if (typeof data.organizer === 'string' && isNaN(Number(data.organizer))) return data.organizer;
    if (typeof data.host === 'string' && isNaN(Number(data.host))) return data.host;

    const userId = data.organizer || data.created_by || data.user_id || data.user;
    if (userId) {
      const matchedUser = allUsers.find(u => String(u.id) === String(userId));
      if (matchedUser) {
        return matchedUser.name || matchedUser.fullName || matchedUser.full_name || matchedUser.username;
      }
    }

    return userId ? `User #${userId}` : 'Unknown Organizer';
  };

  const todayStr = getTodayDateString();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const rooms = baseRooms.map(room => {
    const roomBookings = bookedMeetings.filter(b => {
      const apiRoomName = typeof b.room === 'string' ? b.room : (b.room?.name || '');
      
      const isRoomMatch = 
        (apiRoomName && apiRoomName.toLowerCase() === room.name?.toLowerCase()) || 
        String(b.roomId) === String(room.id) || 
        String(b.room) === String(room.id); 

      const rawDate = b.date || b.meetingDate || b.bookingDate || b.start_date;
      const bookingDate = normalizeDate(rawDate);
      
      const isTodayMatch = bookingDate ? (bookingDate === todayStr) : false;

      return isRoomMatch && isTodayMatch;
    });

    let activeMeetingData = null;

    const runningSession = Object.values(sessions).find(
      s => s.status === 'running' && (s.room?.toLowerCase() === room.name?.toLowerCase() || s.originalData?.roomId === room.id)
    );

    if (runningSession) {
      activeMeetingData = runningSession.originalData || runningSession;
    } else {
      for (const b of roomBookings) {
        const matchingSession = Object.values(sessions).find(
          s => s.originalData?.title === b.title && (s.originalData?.startTime === b.startTime || s.originalData?.startTime === b.start_time)
        );
        if (matchingSession?.status === 'stopped') {
          continue;
        }

        const startTime = b.startTime || b.start_time;
        const endTime = b.endTime || b.end_time;

        if (!startTime || !endTime) continue;

        const startMin = convertTimeToMinutes(startTime);
        const endMin = convertTimeToMinutes(endTime);

        if (startMin >= 0 && endMin >= 0 && currentMinutes >= startMin && currentMinutes <= endMin) {
          activeMeetingData = b;
          break;
        }
      }
    }

    const isOccupiedNow = !!activeMeetingData;

    const rawStart = activeMeetingData?.startTime || activeMeetingData?.start_time;
    const rawEnd = activeMeetingData?.endTime || activeMeetingData?.end_time;
    const startTimeDisplay = formatTimeToAMPM(rawStart);
    const endTimeDisplay = formatTimeToAMPM(rawEnd);

    return {
      ...room,
      status: isOccupiedNow ? 'ongoing' : 'available',
      statusLabel: isOccupiedNow ? '🔴 In Use (Active Now)' : '🟢 Available Now',
      activeMeeting: isOccupiedNow ? {
        title: activeMeetingData.title || activeMeetingData.meetingName || activeMeetingData.name || 'Meeting',
        organizer: getMeetingOrganizer(activeMeetingData),
        time: `${startTimeDisplay} - ${endTimeDisplay}`
      } : null,
      colorScheme: isOccupiedNow ? {
        border: 'border-red-500/50',
        glow: 'shadow-[0_0_25px_rgba(239,68,68,0.2)]',
        badgeBg: 'bg-red-500/20 border-red-500/40 text-red-300',
        dot: 'bg-red-500',
      } : {
        border: 'border-emerald-500/40',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        dot: 'bg-emerald-500',
      }
    };
  });

  const filteredRooms = rooms.filter(room => {
    if (filter === 'available') return room.status === 'available';
    if (filter === 'occupied') return room.status === 'ongoing';
    return true;
  });

  const availableCount = rooms.filter(r => r.status === 'available').length;
  const occupiedCount = rooms.filter(r => r.status === 'ongoing').length;

  return (
    <div className="w-full bg-zinc-900 text-zinc-100 p-4 md:p-6 rounded-2xl font-sans shadow-lg border border-zinc-800">
      <div className="w-full space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Live Meeting Room Status</h1>
            <p className="text-zinc-400 text-xs md:text-sm mt-1">လက်ရှိအချိန်တွင် အခန်းများ အား/မအား တိုက်ရိုက်ကြည့်ရှုရန်</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-zinc-800/90 border border-zinc-700/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Free Rooms</p>
                <p className="text-base font-bold text-emerald-400">{availableCount} Rooms</p>
              </div>
            </div>
            <div className="bg-zinc-800/90 border border-zinc-700/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">In Use Now</p>
                <p className="text-base font-bold text-red-400">{occupiedCount} Rooms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-zinc-400 mr-1" />
          <button 
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${filter === 'all' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'bg-zinc-800/90 text-zinc-400 hover:text-zinc-200 border border-zinc-700/80'}`}
          >
            All Rooms ({rooms.length})
          </button>
          <button 
            onClick={() => setFilter('occupied')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${filter === 'occupied' ? 'bg-red-500 text-white shadow-sm' : 'bg-zinc-800/90 text-zinc-400 hover:text-zinc-200 border border-zinc-700/80'}`}
          >
            In Use Now ({occupiedCount})
          </button>
          <button 
            onClick={() => setFilter('available')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${filter === 'available' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'bg-zinc-800/90 text-zinc-400 hover:text-zinc-200 border border-zinc-700/80'}`}
          >
            Available Now ({availableCount})
          </button>
        </div>

        {/* Room List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRooms.map((room) => (
            <div 
              key={room.id}
              className={`bg-zinc-800/85 rounded-xl p-5 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${room.colorScheme.border} ${room.colorScheme.glow}`}
            >
              <div 
                className="absolute inset-0 z-0 opacity-10 bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url(${room.image})` }}
              />
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-800/80 via-zinc-800/90 to-zinc-900/95 pointer-events-none" />

              {/* Card Header */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{room.name}</h2>
                    <span className="text-[11px] text-zinc-300 bg-zinc-700/50 border border-zinc-600/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <MapPin size={11} /> {room.floor || 'Unknown Floor'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <Users size={13} className="text-zinc-400" /> Capacity: <span className="text-zinc-200 font-medium">{room.capacity || 'N/A'}</span>
                  </p>
                </div>

                <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm ${room.colorScheme.badgeBg}`}>
                  <span className={`w-2 h-2 rounded-full ${room.colorScheme.dot} animate-pulse`}></span>
                  {room.statusLabel}
                </div>
              </div>

              {/* Main Status Box */}
              <div className="my-2 bg-zinc-900/90 border border-zinc-700/60 rounded-lg p-4 relative z-10 shadow-inner">
                {room.activeMeeting ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                        <PlayCircle size={14} className="animate-pulse" /> Current Meeting in Progress
                      </span>
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold">
                        {room.activeMeeting.time}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Lock size={13} className="text-red-400" />
                        {room.activeMeeting.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Organizer: <span className="text-zinc-200 font-semibold">{room.activeMeeting.organizer}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 text-center text-xs text-emerald-400 flex flex-col items-center gap-1.5">
                    <CheckCircle2 size={20} />
                    <span className="font-semibold text-sm">အခန်းလွတ်နေပါသည် (Available)</span>
                    <span className="text-zinc-400 text-[11px]">ယခုအချိန်တွင် အစည်းအဝေး မရှိသေးပါ။ ချက်ချင်းအသုံးပြုနိုင်ပါသည်။</span>
                  </div>
                )}
              </div>

              {/* Card Footer Action */}
              <div className="flex items-center justify-between border-t border-zinc-700/60 pt-3 mt-2 relative z-10">
                <span className="text-[10px] text-zinc-400">
                  {room.activeMeeting ? 'Do Not Disturb' : 'Ready to use'}
                </span>
                <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow">
                  View Room
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
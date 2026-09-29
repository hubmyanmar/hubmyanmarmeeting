import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Calendar as CalendarIcon, 
  Tv, 
  Video, 
  Mic,
  Monitor,
  ChevronRight, 
  CheckCircle2,
  Search
} from 'lucide-react';

import baganImg from '../assets/meetingroom1.jpeg';
import MDImg from '../assets/meetingroom2.jpg';
import BaungImg from '../assets/meetingroom3.webp';
import BodImg from '../assets/meetingroom4.jpeg';

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
  let str = String(timeStr).trim();
  if (str.includes('T')) {
    str = str.split('T')[1].split('.')[0];
  }

  if (str.toUpperCase().includes('AM') || str.toUpperCase().includes('PM')) {
    return str;
  }

  const parts = str.split(':');
  if (parts.length < 2) return str;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return str;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 

  const formattedHours = String(hours).padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
};

const convertTimeToMinutes = (timeStr) => {
  if (!timeStr) return -1;
  let str = String(timeStr).trim();

  if (str.includes('T')) {
    str = str.split('T')[1].split('.')[0];
  }

  const upper = str.toUpperCase();
  if (upper.includes('AM') || upper.includes('PM')) {
    const parts = upper.split(' ');
    const timePart = parts[0] || '';
    const modifier = parts[1] || '';
    let [hours, minutes] = timePart.split(':').map(Number);
    if (isNaN(hours)) hours = 0;
    if (isNaN(minutes)) minutes = 0;
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  } else {
    let [hours, minutes] = str.split(':').map(Number);
    if (isNaN(hours)) hours = 0;
    if (isNaN(minutes)) minutes = 0;
    return hours * 60 + minutes;
  }
};

const getRoomDevices = (room) => {
  let devs = room?.devices || room?.facilities || room?.amenities || [];
  
  if (typeof devs === 'string') {
    try {
      devs = JSON.parse(devs);
    } catch (e) {
      devs = devs.split(',').map(d => d.trim());
    }
  }
  
  return Array.isArray(devs) ? devs : [];
};

const renderDeviceIcon = (deviceName) => {
  const lower = String(deviceName).toLowerCase();
  if (lower.includes('tv') || lower.includes('projector') || lower.includes('display')) {
    return <Tv size={14} className="text-indigo-500 shrink-0" />;
  }
  if (lower.includes('video') || lower.includes('conf') || lower.includes('camera')) {
    return <Video size={14} className="text-indigo-500 shrink-0" />;
  }
  if (lower.includes('mic') || lower.includes('audio') || lower.includes('speaker') || lower.includes('sound')) {
    return <Mic size={14} className="text-indigo-500 shrink-0" />;
  }
  return <Monitor size={14} className="text-indigo-500 shrink-0" />;
};

const formatMinutesToDisplayTime = (mins) => {
  const hrs = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(hrs).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const calculateTimelineSegments = (roomBookings) => {
  const startDay = 0;       
  const endDay = 24 * 60;   
  const totalMins = endDay - startDay;

  const busyIntervals = [];

  roomBookings.forEach(b => {
    const startTime = b.startTime || b.start_time;
    let endTime = b.endTime || b.end_time;

    const startMin = convertTimeToMinutes(startTime);
    if (startMin < 0) return;

    let endMin = convertTimeToMinutes(endTime);
    if (endMin < 0 || endMin <= startMin) {
      endMin = startMin + 60;
    }

    const s = Math.max(startDay, startMin);
    const e = Math.min(endDay, endMin);

    if (s < e) {
      busyIntervals.push({ start: s, end: e });
    }
  });

  busyIntervals.sort((a, b) => a.start - b.start);

  const merged = [];
  busyIntervals.forEach(curr => {
    if (!merged.length) {
      merged.push(curr);
    } else {
      const last = merged[merged.length - 1];
      if (curr.start <= last.end) {
        last.end = Math.max(last.end, curr.end);
      } else {
        merged.push(curr);
      }
    }
  });

  const segments = [];
  let current = startDay;

  merged.forEach(interval => {
    if (interval.start > current) {
      const duration = interval.start - current;
      segments.push({ 
        type: 'free', 
        width: (duration / totalMins) * 100,
        label: `Available (${formatMinutesToDisplayTime(current)} - ${formatMinutesToDisplayTime(interval.start)})`
      });
    }
    const duration = interval.end - interval.start;
    segments.push({ 
      type: 'busy', 
      width: (duration / totalMins) * 100,
      label: `Booked / Busy (${formatMinutesToDisplayTime(interval.start)} - ${formatMinutesToDisplayTime(interval.end)})`
    });

    current = interval.end;
  });

  // ကျန်ရှိသော အချိန် (Free - အစိမ်းရောင်)
  if (current < endDay) {
    const duration = endDay - current;
    segments.push({ 
      type: 'free', 
      width: (duration / totalMins) * 100,
      label: `Available (${formatMinutesToDisplayTime(current)} - ${formatMinutesToDisplayTime(endDay)})`
    });
  }

  return segments.length > 0 ? segments : [{ type: 'free', width: 100, label: 'Available All Day (00:00 - 24:00)' }];
};

export default function MeetingRooms({ 
  bookedMeetings = [], 
  meetingRooms = [], 
  usersList = [],
  onViewSchedule,   
  onRequestBooking  
}) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('meetingSessions');
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  });

  const safeBookedMeetings = Array.isArray(bookedMeetings) ? bookedMeetings : [];
  const safeMeetingRooms = Array.isArray(meetingRooms) ? meetingRooms : [];
  const safeUsersList = Array.isArray(usersList) ? usersList : [];

  const defaultImages = [baganImg, MDImg, BaungImg, BodImg];
  const baseRooms = safeMeetingRooms.map((room, index) => ({
    ...room,
    image: room?.image || defaultImages[index % defaultImages.length] 
  }));

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('meetingSessions');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') setSessions(parsed);
        }
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
      const matchedUser = safeUsersList.find(u => String(u.id) === String(userId));
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
    const roomBookings = safeBookedMeetings.filter(b => {
      const apiRoom = b.room || b.room_name || b.meeting_room || '';
      const apiRoomName = typeof apiRoom === 'object' ? (apiRoom.name || apiRoom.title || '') : String(apiRoom);
      const apiRoomId = String(b.roomId || b.room_id || (typeof apiRoom === 'object' ? apiRoom.id : apiRoom));

      const currentRoomId = String(room.id);
      const currentRoomName = String(room.name || '').toLowerCase();

      const isRoomMatch = 
        (apiRoomName && apiRoomName.toLowerCase() === currentRoomName) || 
        apiRoomId === currentRoomId || 
        apiRoomId === currentRoomName;

      const rawDate = b.date || b.meeting_date || b.meetingDate || b.bookingDate || b.booking_date || b.start_date;
      const bookingDate = normalizeDate(rawDate);
      
      const isTodayMatch = bookingDate ? (bookingDate === todayStr) : true;

      return isRoomMatch && isTodayMatch;
    });

    let activeMeetingData = null;
    const sessionList = Object.values(sessions || {});

    const runningSession = sessionList.find(
      s => s?.status === 'running' && (s?.room?.toLowerCase() === room.name?.toLowerCase() || s?.originalData?.roomId === room.id)
    );

    if (runningSession) {
      activeMeetingData = runningSession.originalData || runningSession;
    } else {
      for (const b of roomBookings) {
        const matchingSession = sessionList.find(
          s => s?.originalData?.title === b.title && (s?.originalData?.startTime === b.startTime || s?.originalData?.startTime === b.start_time)
        );
        if (matchingSession?.status === 'stopped') continue;

        const startTime = b.startTime || b.start_time;
        const endTime = b.endTime || b.end_time;
        if (!startTime) continue;

        const startMin = convertTimeToMinutes(startTime);
        let endMin = convertTimeToMinutes(endTime);
        if (endMin < 0) endMin = startMin + 60;

        if (startMin >= 0 && currentMinutes >= startMin && currentMinutes <= endMin) {
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

    const timelineSegments = calculateTimelineSegments(roomBookings);

    return {
      ...room,
      status: isOccupiedNow ? 'ongoing' : 'available',
      statusLabel: isOccupiedNow ? 'In Use' : 'Available',
      timelineSegments,
      activeMeeting: isOccupiedNow ? {
        title: activeMeetingData.title || activeMeetingData.meetingName || activeMeetingData.name || 'Meeting',
        organizer: getMeetingOrganizer(activeMeetingData),
        time: `${startTimeDisplay} - ${endTimeDisplay}`
      } : null,
      colorScheme: isOccupiedNow ? {
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
      } : {
        badgeBg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
      }
    };
  });

  const filteredRooms = rooms.filter(room => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'available' && room.status === 'available') || 
      (filter === 'occupied' && room.status === 'ongoing');

    const matchesSearch = 
      !searchQuery.trim() || 
      room.name?.toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchesFilter && matchesSearch;
  });

  const availableCount = rooms.filter(r => r.status === 'available').length;
  const occupiedCount = rooms.filter(r => r.status === 'ongoing').length;

  const handleViewSchedule = (room) => {
    if (onViewSchedule) {
      onViewSchedule(room);
    } else {
      navigate('/dashboard/calendar', { state: { selectedRoom: room } });
    }
  };

  const handleRequestBooking = (room) => {
    navigate('/dashboard/book-meeting', { state: { selectedRoom: room } });
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen px-3 pt-0 pb-16 md:px-6 md:pt-4 md:pb-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header Section */}
        <div className="pt-3 md:pt-0">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900">
            Meeting Rooms
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Find and book the right space for your meeting.
          </p>
        </div>

        {/* Filters & Search Toolbar - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-xl p-1 overflow-x-auto">
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap text-center ${
                filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Rooms ({rooms.length})
            </button>
            <button 
              onClick={() => setFilter('available')}
              className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap text-center ${
                filter === 'available' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Available ({availableCount})
            </button>
            <button 
              onClick={() => setFilter('occupied')}
              className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap text-center ${
                filter === 'occupied' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              In Use ({occupiedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search room name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Room Cards List */}
        <div className="space-y-3 pt-1">
          {filteredRooms.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
              No meeting rooms found matching your search or filter criteria.
            </div>
          ) : (
            filteredRooms.map((room) => {
              const roomDevices = getRoomDevices(room);

              return (
                <div 
                  key={room.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 sm:gap-4 md:gap-5"
                >
                  {/* Upper/Left Info Section */}
                  <div className="flex flex-row sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    {/* Room Image */}
                    <div className="w-24 xs:w-28 sm:w-44 h-24 xs:h-28 sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img 
                        src={room.image} 
                        alt={room.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                      {/* Room Header & Status Badge */}
                      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
                        <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">{room.name}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border flex items-center gap-1 shrink-0 ${room.colorScheme.badgeBg}`}>
                          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${room.colorScheme.dot}`}></span>
                          {room.statusLabel}
                        </span>
                      </div>

                      {/* Capacity & Devices Tags */}
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-slate-600 text-xs">
                        <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200/60 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
                          <Users size={12} className="text-slate-500 shrink-0" />
                          <span className="font-bold text-slate-800 text-[11px] sm:text-xs">{room.capacity || 'N/A'}</span>
                          <span className="text-slate-500 text-[10px] sm:text-[11px]">Cap</span>
                        </div>
                        {roomDevices.map((device, devIdx) => (
                          <div 
                            key={devIdx} 
                            className="flex items-center gap-1 bg-indigo-50/60 border border-indigo-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg"
                          >
                            {renderDeviceIcon(device)}
                            <span className="text-slate-700 text-[10px] sm:text-[11px] font-medium truncate max-w-[80px] sm:max-w-none">{device}</span>
                          </div>
                        ))}
                      </div>

                      {/* Current Status/Booking Info */}
                      <div className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-100">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        {room.activeMeeting ? (
                          <span className="truncate">
                            Current: <strong className="text-slate-800">{room.activeMeeting.title}</strong> ({room.activeMeeting.time})
                          </span>
                        ) : (
                          <span>
                            Status: <strong className="text-slate-800">Available for Booking</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline & Actions Section */}
                  <div className="lg:w-[420px] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500">
                      <span>Availability Today <span className="text-slate-400">(00:00 – 24:00)</span></span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>

                    <div>
                      {/* Timeline Bar */}
                      <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden p-0.5 gap-0.5 border border-slate-200/60">
                        {room.timelineSegments.map((seg, idx) => (
                          <div
                            key={idx}
                            title={seg.label}
                            style={{ width: `${seg.width}%` }}
                            className={`h-full cursor-pointer transition-opacity hover:opacity-80 ${
                              seg.type === 'busy' ? 'bg-amber-500' : 'bg-emerald-400'
                            } ${idx === 0 ? 'rounded-l-full' : ''} ${idx === room.timelineSegments.length - 1 ? 'rounded-r-full' : ''}`}
                          />
                        ))}
                      </div>

                      {/* Hour Ticks */}
                      <div className="flex justify-between text-[7px] xs:text-[8px] sm:text-[9px] text-slate-400 mt-1 px-0.5 font-mono">
                        <span>00:00</span>
                        <span>04:00</span>
                        <span>08:00</span>
                        <span>12:00</span>
                        <span>16:00</span>
                        <span>20:00</span>
                        <span>24:00</span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-slate-500 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>Booked / Busy</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button 
                        onClick={() => handleViewSchedule(room)}
                        className="w-full py-2 px-2.5 text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl transition shadow-sm flex items-center justify-center gap-1 active:scale-95"
                      >
                        <CalendarIcon size={13} /> Schedule
                      </button>
                      <button 
                        onClick={() => handleRequestBooking(room)}
                        className="w-full py-2 px-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm flex items-center justify-center gap-1 active:scale-95"
                      >
                        <CheckCircle2 size={13} /> Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
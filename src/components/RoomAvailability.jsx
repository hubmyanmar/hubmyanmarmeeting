import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users, Calendar, Lock } from 'lucide-react';
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

export default function RoomAvailability({ bookedMeetings = [], meetingRooms = [], usersList = [] }) {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('meetingSessions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const defaultImages = [baganImg, MDImg, BaungImg, BodImg];
  const baseRooms = meetingRooms.map((room, index) => ({
    ...room,
    image: room.image || defaultImages[index % defaultImages.length] 
  }));

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

  const todayStr = getTodayDateString();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const roomsStatusCalculated = baseRooms.map(room => {
    const roomBookings = bookedMeetings.filter(b => {
      const apiRoomName = typeof b.room === 'string' ? b.room : (b.room?.name || '');
      const isRoomMatch = (apiRoomName && apiRoomName.toLowerCase() === room.name?.toLowerCase()) || String(b.roomId) === String(room.id) || String(b.room) === String(room.id); 
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

    return {
      ...room,
      status: isOccupiedNow ? 'ongoing' : 'available',
      displayStatus: isOccupiedNow ? 'Occupied' : 'Available',
    };
  });

  const availableRooms = roomsStatusCalculated.filter(r => r.status === 'available');
  const occupiedRooms = roomsStatusCalculated.filter(r => r.status === 'ongoing');

  const displayRooms = availableRooms.length > 0 
    ? availableRooms.slice(0, 2) 
    : occupiedRooms.slice(0, 2);

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-sm h-full">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-gray-900">Room Availability</h2>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Quick book for available rooms</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/meeting-rooms')} 
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 transition-colors"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Rooms List */}
      <div className="space-y-2.5 sm:space-y-3">
        {displayRooms.length > 0 ? (
          displayRooms.map((room) => (
            <div 
              key={room.id} 
              className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all ${room.status === 'available' ? 'border-gray-100/90 bg-white hover:border-emerald-100' : 'border-red-50 bg-red-50/20'}`}
            >
              {/* Room Image */}
              <img 
                src={room.image} 
                alt={room.name} 
                className="w-16 h-16 sm:w-24 sm:h-20 object-cover rounded-lg shrink-0" 
              />

              {/* Details Section */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                  {room.name}
                </h4>
                
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5 mb-1">
                  <Users className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">{room.capacity || 'N/A'}</span>people
                </div>

                <div>
                  <span className={`inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-md ${room.status === 'available' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'}`}>
                    {room.displayStatus}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {room.status === 'available' ? (
                <button 
                  onClick={() => navigate('/dashboard/book-meeting')}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] sm:text-xs font-semibold transition-colors flex items-center justify-center gap-1 shrink-0 shadow-sm"
                >
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="whitespace-nowrap">Book Now</span>
                </button>
              ) : (
                <button 
                  disabled
                  className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-red-100 bg-red-50 text-red-400 text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 shrink-0 cursor-not-allowed"
                >
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="whitespace-nowrap">In Use</span>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-sm text-gray-500">
            No rooms data available.
          </div>
        )}
      </div>
    </div>
  );
}
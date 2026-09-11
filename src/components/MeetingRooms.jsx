import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  MapPin, 
  ChevronRight, 
  Filter 
} from 'lucide-react';

import baganImg from '../assets/Bagan.jpg';
import yangonImg from '../assets/Bagan.jpg';
import inleImg from '../assets/Bagan.jpg';
import mandalayImg from '../assets/Bagan.jpg';

export default function MeetingRoomOverview() {
  const [filter, setFilter] = useState('all');

  const rooms = [
    {
      id: 'bagan',
      name: 'Bagan Room',
      capacity: '6-8 Seats',
      floor: '2nd Floor',
      status: 'now-using',
      statusLabel: 'Now using',
      currentMeeting: 'Interview Session',
      organizer: 'Pyae Phyo',
      duration: '12:00 PM - 01:00 PM',
      nextAvailable: '01:00 PM',
      amenities: ['Projector', 'Wi-Fi', 'Whiteboard'],
      image: baganImg,
      colorScheme: {
        border: 'border-red-500/40',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
        badgeBg: 'bg-red-500/20 border-red-500/40 text-red-300',
        dot: 'bg-red-500',
        textColor: 'text-red-400',
        btnStyle: 'bg-red-600 hover:bg-red-500 text-white'
      }
    },
    {
      id: 'yangon',
      name: 'Yangon Room',
      capacity: '10-12 Seats',
      floor: '1st Floor',
      status: 'wait-checkin',
      statusLabel: 'Wait for check-in',
      currentMeeting: 'Quarterly Project Review',
      organizer: 'Lwin Ko',
      duration: '12:15 PM - 01:15 PM',
      nextAvailable: '01:15 PM',
      amenities: ['Video Conf', 'Wi-Fi', 'AirCon'],
      image: yangonImg,
      colorScheme: {
        border: 'border-amber-500/40',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
        badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        dot: 'bg-amber-500',
        textColor: 'text-amber-400',
        btnStyle: 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold'
      }
    },
    {
      id: 'inle',
      name: 'Inle Room',
      capacity: '4-6 Seats',
      floor: '2nd Floor',
      status: 'available',
      statusLabel: 'Available',
      currentMeeting: 'No Active Meeting',
      organizer: 'N/A',
      duration: 'Free for > 45 mins',
      nextAvailable: 'Available Now',
      amenities: ['Whiteboard', 'Wi-Fi'],
      image: inleImg,
      colorScheme: {
        border: 'border-emerald-500/40',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        dot: 'bg-emerald-500',
        textColor: 'text-emerald-400',
        btnStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white'
      }
    },
    {
      id: 'mandalay',
      name: 'Mandalay Hall',
      capacity: '15-20 Seats',
      floor: '3rd Floor',
      status: 'available',
      statusLabel: 'Available',
      currentMeeting: 'No Active Meeting',
      organizer: 'N/A',
      duration: 'Free for full day',
      nextAvailable: 'Available Now',
      amenities: ['Projector', 'Video Conf', 'Wi-Fi', 'Water Station'],
      image: mandalayImg,
      colorScheme: {
        border: 'border-emerald-500/40',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        dot: 'bg-emerald-500',
        textColor: 'text-emerald-400',
        btnStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white'
      }
    }
  ];

  const filteredRooms = rooms.filter(room => {
    if (filter === 'available') return room.status === 'available';
    if (filter === 'occupied') return room.status !== 'available';
    return true;
  });

  const availableCount = rooms.filter(r => r.status === 'available').length;
  const occupiedCount = rooms.filter(r => r.status === 'now-using').length;
  const pendingCount = rooms.filter(r => r.status === 'wait-checkin').length;

  return (
    <div className="w-full bg-zinc-900 text-zinc-100 p-4 md:p-6 rounded-2xl font-sans shadow-lg border border-zinc-800">
      <div className="w-full space-y-6">
        
        {/* Top Header & Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Meeting Rooms Availability</h1>
            <p className="text-zinc-400 text-xs md:text-sm mt-1">Real-time status monitor for all 4 conference rooms</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-zinc-800/90 border border-zinc-700/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Available</p>
                <p className="text-base font-bold text-emerald-400">{availableCount} Rooms</p>
              </div>
            </div>

            <div className="bg-zinc-800/90 border border-zinc-700/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">In Use</p>
                <p className="text-base font-bold text-red-400">{occupiedCount} Room</p>
              </div>
            </div>

            <div className="bg-zinc-800/90 border border-zinc-700/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Check-in Pending</p>
                <p className="text-base font-bold text-amber-400">{pendingCount} Room</p>
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
            onClick={() => setFilter('available')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${filter === 'available' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'bg-zinc-800/90 text-zinc-400 hover:text-zinc-200 border border-zinc-700/80'}`}
          >
            Available Now ({availableCount})
          </button>
          <button 
            onClick={() => setFilter('occupied')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${filter === 'occupied' ? 'bg-red-500 text-white shadow-sm' : 'bg-zinc-800/90 text-zinc-400 hover:text-zinc-200 border border-zinc-700/80'}`}
          >
            Occupied / Pending ({occupiedCount + pendingCount})
          </button>
        </div>

        {/* 4 Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRooms.map((room) => (
            <div 
              key={room.id}
              className={`bg-zinc-800/80 rounded-xl p-5 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${room.colorScheme.border} ${room.colorScheme.glow}`}
            >
              {/* Soft Room Image Background Accent */}
              <div 
                className="absolute inset-0 z-0 opacity-20 bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url(${room.image})` }}
              />
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-800/70 via-zinc-800/85 to-zinc-900/95 pointer-events-none" />

              {/* Card Header */}
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{room.name}</h2>
                    <span className="text-[11px] text-zinc-300 bg-zinc-700/50 border border-zinc-600/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <MapPin size={11} /> {room.floor}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <Users size={13} className="text-zinc-400" /> Capacity: <span className="text-zinc-200 font-medium">{room.capacity}</span>
                  </p>
                </div>

                <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm ${room.colorScheme.badgeBg}`}>
                  <span className={`w-2 h-2 rounded-full ${room.colorScheme.dot} animate-pulse`}></span>
                  {room.statusLabel}
                </div>
              </div>

              {/* Details Box */}
              <div className="my-3 bg-zinc-900/80 border border-zinc-700/60 rounded-lg p-3.5 space-y-2 relative z-10 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Status Detail</span>
                  {room.status === 'now-using' && <span className="text-xs text-red-400 font-medium">Do Not Disturb</span>}
                </div>

                <p className={`text-sm md:text-base font-semibold ${room.colorScheme.textColor}`}>
                  {room.currentMeeting}
                </p>

                {room.status !== 'available' ? (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-xs text-zinc-300">
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Organizer:</span>
                      <span className="font-medium text-zinc-100">{room.organizer}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Time Slot:</span>
                      <span className="font-medium text-zinc-100">{room.duration}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-zinc-800 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={13} /> Ready for instant booking or walk-in
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1.5 my-2 relative z-10">
                {room.amenities.map((item, idx) => (
                  <span key={idx} className="text-[10px] bg-zinc-700/40 border border-zinc-600/50 text-zinc-300 px-2 py-0.5 rounded">
                    {item}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-zinc-700/60 pt-3 mt-1 relative z-10">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Next Available</span>
                  <span className="text-xs font-semibold text-zinc-200">{room.nextAvailable}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-zinc-700/80 bg-zinc-800/80 hover:bg-zinc-700/80 transition text-zinc-200">
                    View Room
                  </button>
                  <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-md ${room.colorScheme.btnStyle}`}>
                    {room.status === 'available' && 'Book Now'}
                    {room.status === 'wait-checkin' && 'Check In'}
                    {room.status === 'now-using' && 'Extend / End'}
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
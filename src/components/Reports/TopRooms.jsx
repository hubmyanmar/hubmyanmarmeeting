import React, { useState, useEffect } from 'react';

export default function TopRooms({ filter }) {
  const [roomCounts, setRoomCounts] = useState({});

  useEffect(() => {
    const calculateTopRooms = () => {
      try {
        const savedSessions = localStorage.getItem('meetingSessions');
        const sessions = savedSessions ? JSON.parse(savedSessions) : {};

        const counts = {};

        Object.keys(sessions).forEach(meetingId => {
          const session = sessions[meetingId];
          if (session && (session.status === 'stopped' || session.status === 'completed' || session.status === 'running')) {
            
            const sessionDate = new Date(session.startedAt || session.date || Date.now());
            const sessionYear = sessionDate.getFullYear();
            const sessionMonth = sessionDate.getMonth();
            
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();

            let isMatch = false;
            if (filter.view === 'year') {
              isMatch = (sessionYear === filter.year);
            } 
            else if (filter.view === 'month') {
              if (filter.month === 'this_month') {
                isMatch = (sessionYear === currentYear && sessionMonth === currentMonth);
              } else if (filter.month === 'last_month') {
                let lastM = currentMonth - 1;
                let lastY = currentYear;
                if (lastM < 0) { lastM = 11; lastY -= 1; }
                isMatch = (sessionYear === lastY && sessionMonth === lastM);
              } else {
                isMatch = (sessionYear === filter.year && sessionMonth === parseInt(filter.month));
              }
            }
            if (isMatch) {
              const roomName = session.room || 'Unknown Room';
              counts[roomName] = (counts[roomName] || 0) + 1;
            }
          }
        });

        setRoomCounts(counts);
      } catch (e) {
        console.error("Error calculating top rooms:", e);
      }
    };

    calculateTopRooms();
    window.addEventListener('storage', calculateTopRooms);
    window.addEventListener('sync-meeting-sessions', calculateTopRooms);

    return () => {
      window.removeEventListener('storage', calculateTopRooms);
      window.removeEventListener('sync-meeting-sessions', calculateTopRooms);
    };
  }, [filter]);

  const countsArray = Object.values(roomCounts);
  const maxCount = countsArray.length > 0 ? Math.max(...countsArray) : 0;

  const dynamicRooms = Object.entries(roomCounts)
    .map(([name, count]) => ({
      name,
      count,
      width: maxCount > 0 ? `${Math.round((count / maxCount) * 100)}%` : '0%'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
      <h2 className="text-base font-bold text-gray-900 mb-5">Top Meeting Rooms</h2>
      
      <div className="space-y-4">
        {dynamicRooms.length > 0 ? (
          dynamicRooms.map((room) => (
            <div key={room.name} className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-600 w-28 shrink-0 truncate">{room.name}</span>
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: room.width }} 
                />
              </div>
              <span className="text-xs font-bold text-gray-700 w-6 text-right">{room.count}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-xs text-gray-400">
            No meetings found for {filter.view === 'year' ? filter.year : 'this period'}
          </div>
        )}
      </div>
    </div>
  );
}
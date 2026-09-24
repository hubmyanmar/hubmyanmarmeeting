import React, { useMemo } from 'react';

export default function TopRooms({ filter, meetingSessions = {}, bookedMeetings = [], actions = [] }) {
  
  const dynamicRooms = useMemo(() => {
    const counts = {};
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const targetYear = filter?.year ? parseInt(filter.year, 10) : currentYear;
    let targetMonth = currentMonth;

    if (filter?.month) {
      if (filter.month === 'this_month') {
        targetMonth = currentMonth;
      } else if (filter.month === 'last_month') {
        targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      } else {
        const parsedM = parseInt(filter.month, 10);
        targetMonth = parsedM >= 1 && parsedM <= 12 ? parsedM - 1 : parsedM;
      }
    }
    const roomMapping = {};
    const rawList = actions.length > 0 ? actions : bookedMeetings;
    
    rawList.forEach(item => {
      if (!item) return;
      const mId = item.id || item.meeting_id || item.meetingId;
      const rName = item.room || item.room_name || item.roomName;
      if (mId && rName) {
        roomMapping[mId] = rName;
        roomMapping[String(mId)] = rName;
      }
    });
    Object.entries(meetingSessions).forEach(([meetingId, session]) => {
      if (!session) return;

      const status = String(session.status || '').toLowerCase().trim();
      if (['stopped', 'completed', 'running'].includes(status)) {
        
        const rawDate = session.startedAt || session.date || session.createdAt || Date.now();
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return;

        const sessionYear = d.getFullYear();
        const sessionMonth = d.getMonth();

        const isMatch = filter?.view === 'year' 
          ? sessionYear === targetYear 
          : sessionYear === targetYear && sessionMonth === targetMonth;

        if (isMatch) {
          const roomName = 
            session.room || 
            session.room_name || 
            roomMapping[meetingId] || 
            roomMapping[String(meetingId)] || 
            'Unknown Room';

          counts[roomName] = (counts[roomName] || 0) + 1;
        }
      }
    });

    const countsArray = Object.values(counts);
    const maxCount = countsArray.length > 0 ? Math.max(...countsArray) : 0;

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        width: maxCount > 0 ? `${Math.round((count / maxCount) * 100)}%` : '0%'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [filter, meetingSessions, bookedMeetings, actions]);

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
            No meetings found for {filter?.view === 'year' ? filter?.year : 'this period'}
          </div>
        )}
      </div>
    </div>
  );
}
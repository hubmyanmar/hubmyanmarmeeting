import React from 'react';

const rooms = [
  { name: 'Meeting Room A', count: 18, width: '85%' },
  { name: 'Meeting Room B', count: 12, width: '60%' },
  { name: 'Meeting Room C', count: 7, width: '35%' },
  { name: 'Meeting Room D', count: 5, width: '25%' },
];

export default function TopRooms() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
      <h2 className="text-base font-bold text-gray-900 mb-5">Top Meeting Rooms</h2>
      
      <div className="space-y-4">
        {rooms.map((room) => (
          <div key={room.name} className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-600 w-28 shrink-0">{room.name}</span>
            <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: room.width }} />
            </div>
            <span className="text-xs font-bold text-gray-700 w-6 text-right">{room.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
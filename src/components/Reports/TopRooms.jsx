import React, { useMemo } from 'react';
import { Building2, DoorOpen } from 'lucide-react';
import { getTopMeetingRooms } from './reportData';

export default function TopRooms({ filter, meetingSessions = {}, bookedMeetings = [], rooms: roomsProp }) {
  
  const computedRooms = useMemo(
    () => getTopMeetingRooms(filter, meetingSessions, bookedMeetings),
    [filter, meetingSessions, bookedMeetings]
  );
  const dynamicRooms = roomsProp ?? computedRooms;

  return (
    <div className="h-full w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Building2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">Top Meeting Rooms</h2>
            <p className="mt-0.5 text-xs text-slate-500">Most used during this period</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {dynamicRooms.length} rooms
        </span>
      </div>
      
      <div className="space-y-2">
        {dynamicRooms.length > 0 ? (
          dynamicRooms.map((room) => (
            <div key={room.name} className="group rounded-lg px-1 py-0.5">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-xs font-semibold text-slate-700">{room.name}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold tabular-nums text-slate-800">
                  <DoorOpen className="h-3.5 w-3.5 text-indigo-500" />
                  {room.count}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-sm bg-slate-100">
                <div
                  className="h-full rounded-sm bg-indigo-500 transition-all duration-500"
                  style={{ width: room.width }}
                  role="img"
                  aria-label={`${room.name}: ${room.count} meetings`}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-center text-xs text-slate-500">
            No meetings found for {filter?.view === 'year' ? filter?.year : 'this period'}
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { DoorClosed, Plus, MapPin, Users } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';

const rooms = [
  { name: 'Boardroom', location: 'Main Office · Floor 3', capacity: '12 people', status: 'Available' },
  { name: 'Meeting Room A', location: 'Main Office · Floor 2', capacity: '8 people', status: 'Available' },
  { name: 'Meeting Room B', location: 'Main Office · Floor 2', capacity: '6 people', status: 'Available' },
];

export default function RoomsPanel() {
  return <>
    <SettingsPanelHeader title="Rooms" description="View and manage meeting rooms in your workspace." icon={DoorClosed} />
    <div className="space-y-3">{rooms.map((room) => <article key={room.name} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F0EFFF] text-[#564BFF]"><DoorClosed className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{room.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5" />{room.location}</p></div><span className="flex items-center gap-1 text-sm text-slate-600"><Users className="h-4 w-4" />{room.capacity}</span><span className="w-full pl-[52px] text-xs font-semibold text-emerald-700 sm:w-auto sm:pl-0">{room.status}</span></article>)}</div>
    <button type="button" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#564BFF] px-4 py-3 text-sm font-semibold text-[#564BFF] sm:w-auto"><Plus className="h-4 w-4" /> Add room</button>
  </>;
}

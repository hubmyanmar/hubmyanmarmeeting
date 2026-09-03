import React from 'react';

const ScheduleItem = ({ time, title, room, status, text }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-6">
      <span className="text-sm font-bold text-indigo-600 w-20">{time}</span>
      <div>
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{room}</p>
      </div>
    </div>
    <div>
      {status === 'badge' && <span className="bg-[#F3E8FF] text-[#9333EA] px-2.5 py-1 rounded text-xs font-bold border border-[#E9D5FF]">{text}</span>}
      {status === 'primary' && <button className="bg-[#2563EB] hover:bg-blue-700 text-white px-3.5 py-1.5 rounded text-xs font-medium">{text}</button>}
      {status === 'outline' && <button className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3.5 py-1.5 rounded text-xs font-medium">{text}</button>}
    </div>
  </div>
);

export default function TodaySchedule() {
  return (
    <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-base font-bold text-gray-900 mb-3">Today's Schedule</h3>
      <div className="divide-y divide-gray-50 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        <ScheduleItem time="09:00 AM" title="BD Weekly Meeting" room="Meeting Room A" status="badge" text="In 15 min" />
        <ScheduleItem time="11:00 AM" title="Finance Review Meeting" room="Meeting Room B" status="primary" text="Join" />
        <ScheduleItem time="02:00 PM" title="HR Monthly Meeting" room="Meeting Room A" status="outline" text="View" />
        <ScheduleItem time="04:00 PM" title="Project Update Meeting" room="Meeting Room C" status="outline" text="View" />
        <ScheduleItem time="05:00 PM" title="Tech Sync Meeting" room="Meeting Room D" status="outline" text="View" />
      </div>
    </div>
  );
}
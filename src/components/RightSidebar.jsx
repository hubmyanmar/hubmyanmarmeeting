import React from 'react';
import { CalendarPlus, FileText, Upload, ListChecks } from 'lucide-react';

const ActionItem = ({ icon, label }) => (
  <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-indigo-600 border border-indigo-100">{icon}</div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
);

const UpcomingItem = ({ date, title, room, badge }) => (
  <div className="flex items-start gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0"></div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-0.5">
        <p className="text-[11px] font-bold text-gray-500">{date}</p>
        <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded">{badge}</span>
      </div>
      <h4 className="text-sm font-bold text-gray-900">{title}</h4>
      <p className="text-[12px] text-gray-500 mt-0.5">{room}</p>
    </div>
  </div>
);

export default function RightSidebar() {
  return (
    <div className="flex flex-col gap-2 h-auto">
      {/* Quick Actions Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Quick Actions</h3>
        <div className="space-y-1">
          <ActionItem icon={<CalendarPlus className="w-4 h-4"/>} label="Book a Meeting" />
          <ActionItem icon={<FileText className="w-4 h-4"/>} label="Add Meeting Note" />
          <ActionItem icon={<Upload className="w-4 h-4"/>} label="Upload Recording" />
          <ActionItem icon={<ListChecks className="w-4 h-4"/>} label="View Action Items" />
        </div>
      </div>

      {/* Upcoming Meetings Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-900">Upcoming Meetings</h3>
          <button className="text-xs text-indigo-600 font-bold hover:underline">View Calendar →</button>
        </div>
        <div className="space-y-3">
          <UpcomingItem date="19 May 2025, 10:00 AM" title="Marketing Campaign Plan" room="Meeting Room B" badge="2 days" />
          <UpcomingItem date="20 May 2025, 02:30 PM" title="New Project Discussion" room="Meeting Room C" badge="3 days" />
          <UpcomingItem date="21 May 2025, 11:00 AM" title="Management Review" room="Meeting Room A" badge="4 days" />
        </div>
      </div>
    </div>
  );
}
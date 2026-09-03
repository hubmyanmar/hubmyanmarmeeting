import React from 'react';
import { Calendar, Clock, ClipboardCheck, AlertCircle } from 'lucide-react';

const StatCard = ({ title, count, icon, bg, color = "text-gray-900", linkColor = "text-indigo-600" }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
    <div>
      <h3 className="text-[13px] font-semibold text-indigo-900/60 mb-2">{title}</h3>
      <p className={`text-[32px] font-bold leading-none ${color}`}>{count}</p>
      <button className={`text-xs mt-4 font-bold ${linkColor} hover:underline`}>View all →</button>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>{icon}</div>
  </div>
);

export default function TopStats() {
  return (
    <div className="grid grid-cols-4 gap-6">
      <StatCard title="Today's Meetings" count="4" icon={<Calendar className="w-6 h-6 text-indigo-600"/>} bg="bg-indigo-50" />
      <StatCard title="Upcoming Meetings" count="7" icon={<Clock className="w-6 h-6 text-blue-600"/>} bg="bg-blue-50" />
      <StatCard title="Pending Actions" count="12" icon={<ClipboardCheck className="w-6 h-6 text-emerald-600"/>} bg="bg-emerald-50" linkColor="text-emerald-600" />
      <StatCard title="Overdue Actions" count="3" icon={<AlertCircle className="w-6 h-6 text-orange-500"/>} bg="bg-orange-50" color="text-orange-500" linkColor="text-orange-500" />
    </div>
  );
}
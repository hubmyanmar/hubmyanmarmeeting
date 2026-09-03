import React from 'react';
import { Users, Clock, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

const MetricItem = ({ icon, title, val, trend, pos }) => (
  <div className="flex items-start gap-4 px-2">
    <div className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center shrink-0 border border-gray-200">
      {icon}
    </div>
    <div>
      <h4 className="text-[12px] font-bold text-gray-500 mb-1">{title}</h4>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-gray-900">{val}</span>
        <span className={`flex items-center text-[11px] font-bold ${pos ? 'text-emerald-600' : 'text-red-500'}`}>
          {pos ? <ArrowUp className="w-3 h-3 mr-0.5"/> : <ArrowDown className="w-3 h-3 mr-0.5"/>}
          {trend} vs last month
        </span>
      </div>
    </div>
  </div>
);

export default function BottomMetrics() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-4 gap-4 divide-x divide-gray-100">
      <MetricItem icon={<Users className="w-5 h-5 text-indigo-500"/>} title="Total Meetings (This Month)" val="42" trend="15%" pos />
      <MetricItem icon={<Clock className="w-5 h-5 text-blue-500"/>} title="Total Meeting Hours" val="68.5" trend="18%" pos />
      <MetricItem icon={<CheckCircle2 className="w-5 h-5 text-emerald-500"/>} title="Completed Actions" val="85%" trend="12%" pos />
      <MetricItem icon={<AlertTriangle className="w-5 h-5 text-red-500"/>} title="Overdue Actions" val="7" trend="5%" pos={false} />
    </div>
  );
}
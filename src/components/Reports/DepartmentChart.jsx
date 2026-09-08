import React from 'react';

const departments = [
  { name: 'Business Development', value: '12 (29%)', color: 'bg-indigo-500' },
  { name: 'Finance', value: '10 (24%)', color: 'bg-sky-400' },
  { name: 'HR', value: '8 (19%)', color: 'bg-amber-300' },
  { name: 'Operations', value: '7 (17%)', color: 'bg-emerald-400' },
  { name: 'Others', value: '5 (12%)', color: 'bg-purple-400' },
];

export default function DepartmentChart() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
      <h2 className="text-base font-bold text-gray-900 mb-6">Meetings by Department</h2>
      
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-indigo-500" strokeWidth="4" strokeDasharray="29, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-sky-400" strokeWidth="4" strokeDasharray="24, 100" strokeDashoffset="-29" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-amber-300" strokeWidth="4" strokeDasharray="19, 100" strokeDashoffset="-53" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-emerald-400" strokeWidth="4" strokeDasharray="17, 100" strokeDashoffset="-72" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-purple-400" strokeWidth="4" strokeDasharray="11, 100" strokeDashoffset="-89" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-gray-900">42</span>
            <span className="text-xs text-gray-400 font-medium">Total</span>
          </div>
        </div>

        <div className="space-y-2.5 text-xs font-medium w-full sm:w-auto">
          {departments.map((dept) => (
            <div key={dept.name} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${dept.color}`} />
                <span className="text-gray-600">{dept.name}</span>
              </div>
              <span className="text-gray-900 font-semibold">{dept.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
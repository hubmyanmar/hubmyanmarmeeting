import React, { useEffect } from 'react';

const COLOR_PALETTE = [
  { bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { bg: 'bg-sky-500', text: 'text-sky-500' },
  { bg: 'bg-amber-500', text: 'text-amber-500' },
  { bg: 'bg-emerald-500', text: 'text-emerald-500' },
  { bg: 'bg-purple-500', text: 'text-purple-500' },
  { bg: 'bg-rose-500', text: 'text-rose-500' },
  { bg: 'bg-teal-500', text: 'text-teal-500' },
  { bg: 'bg-orange-500', text: 'text-orange-500' },
  { bg: 'bg-blue-500', text: 'text-blue-500' },
  { bg: 'bg-pink-500', text: 'text-pink-500' },
  { bg: 'bg-cyan-500', text: 'text-cyan-500' },
  { bg: 'bg-lime-600', text: 'text-lime-600' },
  { bg: 'bg-violet-500', text: 'text-violet-500' },
  { bg: 'bg-fuchsia-500', text: 'text-fuchsia-500' },
  { bg: 'bg-gray-400', text: 'text-gray-400' }
];

export default function DepartmentChart({ bookedMeetings = [] }) {

  const deptCounts = {};

  bookedMeetings.forEach((meeting, index) => {
    const companyName = meeting.company || meeting.company_name;
    const deptName = meeting.department || meeting.department_name;
    
    let dept = 'Unspecified';
    
    if (companyName && String(companyName).trim() !== '') {
      dept = String(companyName).trim();
    } else if (deptName && String(deptName).trim() !== '') {
      dept = String(deptName).trim();
    }
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  

  const totalMeetings = bookedMeetings.length;
  let accumulatedLength = 0;
  
  const chartData = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => {
      const exactPercentage = totalMeetings > 0 ? (count / totalMeetings) * 100 : 0;
      const roundedPercentage = Math.round(exactPercentage);

      const strokeLength = exactPercentage; 
      const dashArray = `${strokeLength} 100`;
      const dashOffset = -accumulatedLength;
      
      accumulatedLength += strokeLength; 

      const color = COLOR_PALETTE[index % COLOR_PALETTE.length];

      return {
        name,
        count,
        value: `${count} (${roundedPercentage}%)`,
        bgColor: color.bg,
        textColor: color.text,
        dashArray,
        dashOffset,
      };
    });

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
      <h2 className="text-base font-bold text-gray-900 mb-6">Meetings by Company</h2>
      
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
        {/* SVG Donut Chart */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {totalMeetings === 0 ? (
              <path 
                className="text-gray-100" 
                strokeWidth="4" 
                stroke="currentColor" 
                fill="none" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
            ) : (
              chartData.map((data, index) => (
                <path 
                  key={index}
                  className={data.textColor} 
                  strokeWidth="4" 
                  strokeDasharray={data.dashArray} 
                  strokeDashoffset={data.dashOffset} 
                  stroke="currentColor" 
                  fill="none" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                />
              ))
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-gray-900">{totalMeetings}</span>
            <span className="text-xs text-gray-400 font-medium">Total</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5 text-xs font-medium w-full sm:w-auto max-h-40 overflow-y-auto">
          {totalMeetings === 0 ? (
            <p className="text-gray-400 text-center">No bookings yet</p>
          ) : (
            chartData.map((data) => (
              <div key={data.name} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${data.bgColor} shrink-0`} />
                  <span className="text-gray-600">{data.name}</span>
                </div>
                <span className="text-gray-900 font-semibold">{data.value}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useMemo, useState } from 'react';
import { getCompanyBreakdown } from './reportData';

const COLOR_PALETTE = [
  { bg: 'bg-blue-600', text: 'text-blue-600', stroke: '#2563eb' },
  { bg: 'bg-teal-700', text: 'text-teal-700', stroke: '#0f766e' },
  { bg: 'bg-violet-700', text: 'text-violet-700', stroke: '#6d28d9' },
  { bg: 'bg-orange-700', text: 'text-orange-700', stroke: '#c2410c' },
  { bg: 'bg-rose-700', text: 'text-rose-700', stroke: '#be123c' },
  { bg: 'bg-lime-700', text: 'text-lime-700', stroke: '#4d7c0f' },
  { bg: 'bg-sky-700', text: 'text-sky-700', stroke: '#0369a1' },
  { bg: 'bg-fuchsia-700', text: 'text-fuchsia-700', stroke: '#a21caf' },
  { bg: 'bg-amber-700', text: 'text-amber-700', stroke: '#a16207' },
  { bg: 'bg-slate-600', text: 'text-slate-600', stroke: '#475569' },
];

export default function DepartmentChart({ bookedMeetings = [], breakdown: breakdownProp }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const computedBreakdown = useMemo(
    () => getCompanyBreakdown(bookedMeetings),
    [bookedMeetings]
  );
  const { total: totalMeetings, chartData: companyData } = breakdownProp ?? computedBreakdown;
  const chartData = companyData.map((data) => {
    const color = COLOR_PALETTE[data.colorIndex % COLOR_PALETTE.length];
    return { ...data, bgColor: color.bg, textColor: color.text, strokeColor: color.stroke };
  });

  return (
    <div className="h-full w-full min-w-0 bg-white max-md:p-4 md:p-2.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Meetings by Company</h2>
          <p className="text-xs text-gray-400 mt-0.5">Distribution across companies & departments</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
          {totalMeetings} Total
        </span>
      </div>

      {totalMeetings === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 text-gray-400 font-bold text-sm">
            📊
          </div>
          <p className="text-sm font-semibold text-gray-600">No Meetings Found</p>
          <p className="text-xs text-gray-400 mt-0.5">Try selecting a different date filter</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* SVG Donut Chart */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="3.8"
              />
              {chartData.map((data, index) => (
                <circle
                  key={index}
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke={data.strokeColor}
                  strokeWidth={hoveredIndex === index ? "4.8" : "3.8"}
                  strokeDasharray={data.strokeDasharray}
                  strokeDashoffset={data.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">
                {hoveredIndex !== null ? chartData[hoveredIndex].count : totalMeetings}
              </span>
              <span className="text-[11px] font-semibold text-gray-400 mt-1 truncate max-w-[100px]">
                {hoveredIndex !== null ? chartData[hoveredIndex].name : 'Meetings'}
              </span>
            </div>
          </div>

          {/* Legend List */}
          <div className="w-full space-y-0.5 max-h-44 overflow-y-auto pr-1">
            {chartData.map((data, idx) => (
              <div 
                key={data.name} 
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-1 rounded-xl transition-all cursor-pointer border ${
                  hoveredIndex === idx 
                    ? 'bg-indigo-50/60 border-indigo-100 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-3 h-3 rounded-full ${data.bgColor} shrink-0 shadow-sm`} />
                  <span className="text-xs font-semibold text-slate-700 truncate">{data.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-900">{data.count}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                    {data.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

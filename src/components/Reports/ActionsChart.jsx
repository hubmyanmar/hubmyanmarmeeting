import React, { useMemo } from 'react';
import { getActionsOverview } from './reportData';

export default function ActionsChart({ filter, bookedMeetings = [], actions = [], meetingSessions = {}, chartData: chartDataProp }) {
  const computedChartData = useMemo(
    () => getActionsOverview(filter, bookedMeetings, meetingSessions, actions),
    [filter, bookedMeetings, actions, meetingSessions]
  );
  const chartData = chartDataProp ?? computedChartData;

  const maxVal = Math.max(...chartData.completed, ...chartData.overdue, 0);
  const step = Math.max(5, Math.ceil(maxVal / 4 / 5) * 5); 
  const max = step * 4;

  const yAxisLabels = [max, step * 3, step * 2, step * 1, 0];

  return (
    <div className="w-full min-w-0 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-base font-bold text-gray-900">Actions Overview</h2>
        <div className="flex items-center gap-2 text-[10px] font-medium sm:gap-4 sm:text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#5A55E7]"></span>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#D5D8FF]"></span>
            <span className="text-gray-600">Overdue</span>
          </div>
        </div>
      </div>

      <div className="relative h-48 w-full min-w-0 flex">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between text-[10px] sm:text-xs text-gray-500 pb-6 pr-2 sm:pr-4 items-end w-8 shrink-0">
          {yAxisLabels.map((val, idx) => (
            <span key={idx}>{val}</span>
          ))}
        </div>

        {/* Chart Area */}
        <div className="relative flex-1 min-w-0 h-[calc(100%-1.5rem)] flex items-end justify-around border-b border-gray-100">
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 w-full h-[1px]"></div>
            ))}
          </div>

          {/* Bars */}
          {chartData.labels.map((label, i) => {
            const compVal = chartData.completed[i];
            const overVal = chartData.overdue[i];
            const compHeight = max > 0 ? (compVal / max) * 100 : 0;
            const overHeight = max > 0 ? (overVal / max) * 100 : 0;

            return (
              <div key={i} className="relative flex min-w-0 flex-1 flex-col items-center justify-end h-full z-10 group">
                <div className="flex items-end gap-0.5 sm:gap-1.5 h-full">
                  
                  {/* Completed Bar (Dark Blue) */}
                  <div className="relative flex flex-col items-center justify-end h-full w-5 sm:w-8">
                    {compVal > 0 && (
                      <span className="absolute -top-5 sm:-top-6 text-[9px] sm:text-sm font-semibold text-gray-700">
                        {compVal}
                      </span>
                    )}
                    <div 
                      className="w-full bg-[#5A55E7] rounded-t-md transition-all duration-300"
                      style={{ height: `${compHeight}%` }}
                    ></div>
                  </div>

                  {/* Overdue Bar (Light Blue) */}
                  <div className="relative flex flex-col items-center justify-end h-full w-5 sm:w-8">
                    {overVal > 0 && (
                      <span className="absolute -top-4 sm:-top-5 text-[9px] sm:text-xs font-semibold text-gray-500">
                        {overVal}
                      </span>
                    )}
                    <div 
                      className="w-full bg-[#D5D8FF] rounded-t-md transition-all duration-300"
                      style={{ height: `${overHeight}%` }}
                    ></div>
                  </div>
                  
                </div>

                {/* X-Axis Label */}
                <div className="absolute -bottom-8 text-[10px] sm:text-xs text-gray-500 text-center flex flex-col items-center w-full">
                  <span>{label.split(' ')[0]}</span>
                  {label.split(' ')[1] && <span>{label.split(' ')[1]}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

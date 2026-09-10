import React, { useState, useEffect } from 'react';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ActionsChart({ filter }) {
  const [chartData, setChartData] = useState({
    completed: [0, 0, 0, 0],
    overdue: [0, 0, 0, 0],
    labels: ['Sep 1-7', 'Sep 8-14', 'Sep 15-21', 'Sep 22-31']
  });

  useEffect(() => {
    const calculateActions = () => {
      try {
        const rawActionItems = localStorage.getItem('actionItems');
        const rawMeetingActions = localStorage.getItem('meetingActions');
        const rawActions = localStorage.getItem('actions');
        const rawTasks = localStorage.getItem('tasks');
        const rawMeetingSessions = localStorage.getItem('meetingSessions');

        let savedActions = rawActionItems || rawMeetingActions || rawActions || rawTasks;
        let actions = savedActions ? JSON.parse(savedActions) : [];

        if (!actions || (Array.isArray(actions) && actions.length === 0) || (typeof actions === 'object' && Object.keys(actions).length === 0)) {
          if (rawMeetingSessions) {
            actions = JSON.parse(rawMeetingSessions);
          }
        }

        const actionsArray = Array.isArray(actions) ? actions : Object.values(actions);

        let compPointsData = [0, 0, 0, 0];
        let overPointsData = [0, 0, 0, 0];

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        actionsArray.forEach((action) => {
          const rawDate = action.date || action.dueDate || action.createdAt || action.startedAt || action.endTime || action.timestamp;
          
          let actionYear, actionMonth, day;
          if (rawDate) {
            const d = new Date(rawDate);
            actionYear = d.getFullYear();
            actionMonth = d.getMonth();
            day = d.getDate();
          }

          let isMatch = false;

          if (!filter) {
            isMatch = (actionYear === currentYear && actionMonth === currentMonth);
          } else if (filter.view === 'year') {
            isMatch = (actionYear === filter.year);
          } else if (filter.view === 'month') {
            if (filter.month === 'this_month') {
              isMatch = (actionYear === currentYear && actionMonth === currentMonth);
            } else if (filter.month === 'last_month') {
              let lastM = currentMonth - 1;
              let lastY = currentYear;
              if (lastM < 0) { lastM = 11; lastY -= 1; }
              isMatch = (actionYear === lastY && actionMonth === lastM);
            } else {
              const fMonth = parseInt(filter.month);
              isMatch = (actionYear === filter.year) && (actionMonth === fMonth || actionMonth === fMonth - 1);
            }
          }

          const statusStr = (action.status || '').toLowerCase();
          const isCompleted = statusStr === 'completed' || statusStr === 'done' || statusStr === 'stopped' || action.completed === true || action.isChecked === true;
          const isOverdue = statusStr === 'overdue' || statusStr === 'pending' || action.isOverdue === true;

          if (isMatch) {
            let index = 0;
            if (filter && filter.view === 'year') {
              index = Math.floor(actionMonth / 3);
            } else {
              if (day >= 1 && day <= 7) index = 0;
              else if (day >= 8 && day <= 14) index = 1;
              else if (day >= 15 && day <= 21) index = 2;
              else index = 3;
            }

            if (isCompleted) {
              compPointsData[index] += 1;
            } else if (isOverdue) {
              overPointsData[index] += 1;
            }
          }
        });

        let activeLabels = [];
        if (filter && filter.view === 'year') {
          activeLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
        } else {
          let mIndex = currentMonth;
          if (filter && filter.view === 'month') {
            if (filter.month === 'this_month') mIndex = currentMonth;
            else if (filter.month === 'last_month') mIndex = currentMonth === 0 ? 11 : currentMonth - 1;
            else if (typeof filter.month !== 'undefined' && filter.month !== 'this_month' && filter.month !== 'last_month') {
              const parsedM = parseInt(filter.month);
              mIndex = parsedM > 11 ? parsedM - 1 : parsedM;
            }
          }
          const mName = MONTHS_SHORT[mIndex] || 'Sep';
          activeLabels = [`${mName} 1-7`, `${mName} 8-14`, `${mName} 15-21`, `${mName} 22-31`];
        }

        setChartData({
          completed: compPointsData,
          overdue: overPointsData,
          labels: activeLabels
        });

      } catch (e) {
        console.error("Error calculating actions chart:", e);
      }
    };

    calculateActions();
    window.addEventListener('storage', calculateActions);
    window.addEventListener('sync-action-items', calculateActions);

    return () => {
      window.removeEventListener('storage', calculateActions);
      window.removeEventListener('sync-action-items', calculateActions);
    };
  }, [filter]);

  // Max Scale 40 ပုံသေထားရှိခြင်း
  const maxDataVal = Math.max(...chartData.completed, ...chartData.overdue, 0);
  const max = Math.max(40, Math.ceil(maxDataVal / 10) * 10);

  // 0 တန်ဖိုးဖြစ်လျှင် y = 95 (0 Line)၊ Max (40) ဖြစ်လျှင် y = 5 ဖြစ်အောင် Padding ပေးထားပါသည်
  const getY = (val) => {
    const bottom0Line = 95; // 0 baseline position
    const topMaxLine = 5;    // Top max position
    return bottom0Line - (val / max) * (bottom0Line - topMaxLine);
  };

  const c1 = getY(chartData.completed[0]);
  const c2 = getY(chartData.completed[1]);
  const c3 = getY(chartData.completed[2]);
  const c4 = getY(chartData.completed[3]);

  const o1 = getY(chartData.overdue[0]);
  const o2 = getY(chartData.overdue[1]);
  const o3 = getY(chartData.overdue[2]);
  const o4 = getY(chartData.overdue[3]);

  const x1 = 10, x2 = 100, x3 = 190, x4 = 280;

  const compPoints = `${x1},${c1} ${x2},${c2} ${x3},${c3} ${x4},${c4}`;
  const overPoints = `${x1},${o1} ${x2},${o2} ${x3},${o3} ${x4},${o4}`;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900">Actions Overview</h2>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-gray-600">Overdue</span>
          </div>
        </div>
      </div>

      <div className="relative h-48 w-full flex">
        {/* Y-Axis Label (40, 30, 20, 10, 0) */}
        <div className="flex flex-col justify-between text-[10px] text-gray-400 pb-2 pr-3 items-end w-8 shrink-0">
          <span>{max}</span>
          <span>{max * 0.75}</span>
          <span>{max * 0.5}</span>
          <span>{max * 0.25}</span>
          <span className="font-semibold text-gray-500">0</span>
        </div>

        <div className="relative flex-1 h-[calc(100%-1.25rem)] ml-1">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-b border-gray-100 w-full h-[1px]"></div>
            <div className="border-b border-gray-100 w-full h-[1px]"></div>
            <div className="border-b border-gray-100 w-full h-[1px]"></div>
            <div className="border-b border-gray-100 w-full h-[1px]"></div>
            {/* 0 Line Baseline */}
            <div className="border-b-2 border-gray-300 w-full h-[1px]"></div>
          </div>

          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 290 100" preserveAspectRatio="none">
            {/* Overdue Line */}
            <polyline fill="none" stroke="#F43F5E" strokeWidth="1.5" points={overPoints} />
            <circle cx={x1} cy={o1} r="2.5" className="fill-white stroke-rose-500 stroke-[1.5px]" />
            <circle cx={x2} cy={o2} r="2.5" className="fill-white stroke-rose-500 stroke-[1.5px]" />
            <circle cx={x3} cy={o3} r="2.5" className="fill-white stroke-rose-500 stroke-[1.5px]" />
            <circle cx={x4} cy={o4} r="2.5" className="fill-white stroke-rose-500 stroke-[1.5px]" />

            {/* Completed Line */}
            <polyline fill="none" stroke="#10B981" strokeWidth="2" points={compPoints} />
            <circle cx={x1} cy={c1} r="3" className="fill-white stroke-emerald-500 stroke-[2px]" />
            <circle cx={x2} cy={c2} r="3" className="fill-white stroke-emerald-500 stroke-[2px]" />
            <circle cx={x3} cy={c3} r="3" className="fill-white stroke-emerald-500 stroke-[2px]" />
            <circle cx={x4} cy={c4} r="3" className="fill-white stroke-emerald-500 stroke-[2px]" />
          </svg>

          {/* X-Axis Labels */}
          <div className="absolute -bottom-7 left-0 right-0 flex justify-between text-[10.5px] text-gray-400 font-medium">
            <span className="w-1/4 text-left">{chartData.labels[0]}</span>
            <span className="w-1/4 text-center">{chartData.labels[1]}</span>
            <span className="w-1/4 text-center">{chartData.labels[2]}</span>
            <span className="w-1/4 text-right">{chartData.labels[3]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
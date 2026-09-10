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

  const maxDataVal = Math.max(...chartData.completed, ...chartData.overdue);
  const max = Math.max(40, Math.ceil(maxDataVal / 10) * 10);
  const getY = (val) => {
    const topY = 15;     // Top Position
    const bottomY = 105; // Bottom (Zero) Position
    return bottomY - (val / max) * (bottomY - topY);
  };

  const c1 = getY(chartData.completed[0]);
  const c2 = getY(chartData.completed[1]);
  const c3 = getY(chartData.completed[2]);
  const c4 = getY(chartData.completed[3]);

  const o1 = getY(chartData.overdue[0]);
  const o2 = getY(chartData.overdue[1]);
  const o3 = getY(chartData.overdue[2]);
  const o4 = getY(chartData.overdue[3]);

  const compPoints = `10,${c1} 90,${c2} 170,${c3} 250,${c4}`;
  const overPoints = `10,${o1} 90,${o2} 170,${o3} 250,${o4}`;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
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

      <div className="relative h-48 w-full pt-4">
        {/* Y-Axis Label တန်ဖိုးများကို Dynamic ဖြစ်အောင် ပြင်ဆင်ထားသောနေရာ */}
        <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pointer-events-none">
          <div className="border-b border-gray-100 pb-1">{max}</div>
          <div className="border-b border-gray-100 pb-1">{max * 0.75}</div>
          <div className="border-b border-gray-100 pb-1">{max * 0.5}</div>
          <div className="border-b border-gray-100 pb-1">{max * 0.25}</div>
          <div>0</div>
        </div>

        <svg className="w-full h-full pl-6 overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
          {/* Overdue Line */}
          <polyline fill="none" stroke="#F43F5E" strokeWidth="2" points={overPoints} />
          <circle cx="10" cy={o1} r="3.5" className="fill-rose-500" />
          <circle cx="90" cy={o2} r="3.5" className="fill-rose-500" />
          <circle cx="170" cy={o3} r="3.5" className="fill-rose-500" />
          <circle cx="250" cy={o4} r="3.5" className="fill-rose-500" />

          {/* Completed Line */}
          <polyline fill="none" stroke="#10B981" strokeWidth="2.5" points={compPoints} />
          <circle cx="10" cy={c1} r="4" className="fill-emerald-500" />
          <circle cx="90" cy={c2} r="4" className="fill-emerald-500" />
          <circle cx="170" cy={c3} r="4" className="fill-emerald-500" />
          <circle cx="250" cy={c4} r="4" className="fill-emerald-500" />
        </svg>
      </div>

      <div className="flex justify-between pl-6 text-[11px] text-gray-400 mt-2 font-medium">
        <span>{chartData.labels[0]}</span>
        <span>{chartData.labels[1]}</span>
        <span>{chartData.labels[2]}</span>
        <span>{chartData.labels[3]}</span>
      </div>
    </div>
  );
}
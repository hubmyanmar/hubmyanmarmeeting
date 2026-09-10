import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

export default function MetricCards({ filter }) {
  const [metrics, setMetrics] = useState({
    meetings: { current: 0, diffPct: 0, isUp: true },
    hours: { current: 0, diffPct: 0, isUp: true },
    completedPct: { current: 0, diffPct: 0, isUp: true },
    overdue: { current: 0, diffCount: 0, isUp: false }
  });

  const compareLabel = filter?.view === 'year' ? 'last year' : 'last month';

  useEffect(() => {
    const calculateMetrics = () => {
      try {
        const now = new Date();
        const viewType = filter?.view || 'month'; 
        
        let targetYear = now.getFullYear();
        let targetMonth = now.getMonth();
        let prevYear = targetYear;
        let prevMonth = targetMonth - 1;

        if (viewType === 'month') {
          if (filter?.month === 'last_month') {
            targetMonth = now.getMonth() - 1;
            if (targetMonth < 0) { targetMonth = 11; targetYear -= 1; }
          } else if (filter?.month !== 'this_month' && filter?.month !== undefined) {
            const parsedM = parseInt(filter.month);
            targetMonth = parsedM > 11 ? parsedM - 1 : parsedM;
            if (filter.year) targetYear = filter.year;
          }
          
          prevMonth = targetMonth - 1;
          prevYear = targetYear;
          if (prevMonth < 0) { prevMonth = 11; prevYear -= 1; }

        } else if (viewType === 'year') {
          if (filter?.year) targetYear = filter.year;
          prevYear = targetYear - 1;
        }
        const isTargetPeriod = (y, m) => {
          if (viewType === 'year') return y === targetYear;
          return y === targetYear && m === targetMonth;
        };

        const isPrevPeriod = (y, m) => {
          if (viewType === 'year') return y === prevYear;
          return y === prevYear && m === prevMonth;
        };

        const rawSessions = localStorage.getItem('meetingSessions');
        const sessions = rawSessions ? JSON.parse(rawSessions) : {};
        const sessionsArray = Array.isArray(sessions) ? sessions : Object.values(sessions);

        const actionKeys = ['actionItems', 'meetingActions', 'actions', 'tasks', 'meetingSessions'];
        let actionsArray = [];
        actionKeys.forEach((key) => {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              const items = Array.isArray(parsed) ? parsed : Object.values(parsed || {});
              actionsArray = [...actionsArray, ...items];
            } catch (e) {
              console.error(`Error parsing ${key}:`, e);
            }
          }
        });
        
        let currMeetings = 0, prevMeetings = 0;
        let currHours = 0, prevHours = 0;

        // --- Helper Function to reliably calculate meeting hours ---
        const getMeetingHours = (s) => {
          // 1. Check if explicit durationHours exists
          if (s.durationHours !== undefined && s.durationHours !== null) {
            return Number(s.durationHours);
          }
          // 2. Check if explicit durationMinutes exists
          if (s.durationMinutes !== undefined && s.durationMinutes !== null) {
            return Number(s.durationMinutes) / 60;
          }
          // 3. Check for generic 'duration' field (assuming it's in minutes)
          if (s.duration !== undefined && s.duration !== null) {
            const val = Number(s.duration);
            // If the value is very large, it might be in milliseconds. Handled dynamically.
            if (val > 10000) return val / (1000 * 60 * 60); 
            return val / 60;
          }
          // 4. Calculate from Start & End times if timestamps are available
          const start = new Date(s.startedAt || s.startTime || s.createdAt || s.date);
          const end = new Date(s.endedAt || s.endTime || s.completedAt);
          
          if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
            return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Return difference in hours
          }
          return 0;
        };

        sessionsArray.forEach((s) => {
          const d = new Date(s.startedAt || s.date || s.createdAt || s.timestamp);
          if (isNaN(d.getTime())) return;

          const y = d.getFullYear();
          const m = d.getMonth();
          
          // Use the helper function here
          const durationHours = getMeetingHours(s);

          if (isTargetPeriod(y, m)) {
            currMeetings += 1;
            currHours += durationHours;
          } else if (isPrevPeriod(y, m)) {
            prevMeetings += 1;
            prevHours += durationHours;
          }
        });
        
        let currTotalAct = 0, currCompAct = 0, currOverdueAct = 0;
        let prevTotalAct = 0, prevCompAct = 0, prevOverdueAct = 0;

        const uniqueActionsMap = new Map();
        actionsArray.forEach((a) => {
          if (!a) return;
          const id = a.id || a._id || JSON.stringify(a);
          if (!uniqueActionsMap.has(id)) uniqueActionsMap.set(id, a);
        });

        uniqueActionsMap.forEach((a) => {
          const d = new Date(a.date || a.dueDate || a.createdAt || a.startedAt || a.timestamp);
          if (isNaN(d.getTime())) return;

          const y = d.getFullYear();
          const m = d.getMonth();

          const statusStr = (a.status || '').toLowerCase();
          const isComp = statusStr === 'completed' || statusStr === 'done' || statusStr === 'stopped' || a.completed === true || a.isChecked === true || a.isCompleted === true;
          const isOver = statusStr === 'overdue' || statusStr === 'pending' || a.isOverdue === true;

          if (isTargetPeriod(y, m)) {
            currTotalAct += 1;
            if (isComp) currCompAct += 1;
            if (isOver) currOverdueAct += 1;
          } else if (isPrevPeriod(y, m)) {
            prevTotalAct += 1;
            if (isComp) prevCompAct += 1;
            if (isOver) prevOverdueAct += 1;
          }
        });
        
        const calcDiffPct = (curr, prev) => {
          if (prev === 0) return curr > 0 ? 100 : 0;
          return Math.round(((curr - prev) / prev) * 100);
        };

        const currCompPct = currTotalAct > 0 ? Math.round((currCompAct / currTotalAct) * 100) : 0;
        const prevCompPct = prevTotalAct > 0 ? Math.round((prevCompAct / prevTotalAct) * 100) : 0;

        const meetingsDiff = calcDiffPct(currMeetings, prevMeetings);
        const hoursDiff = calcDiffPct(currHours, prevHours);
        const compPctDiff = calcDiffPct(currCompPct, prevCompPct);
        const overdueDiff = currOverdueAct - prevOverdueAct; 

        setMetrics({
          meetings: {
            current: currMeetings,
            diffPct: Math.abs(meetingsDiff),
            isUp: meetingsDiff >= 0
          },
          hours: {
            // Rounded to 1 decimal place to handle trailing numbers e.g. 1.5 hrs
            current: Number(currHours.toFixed(1)), 
            diffPct: Math.abs(hoursDiff),
            isUp: hoursDiff >= 0
          },
          completedPct: {
            current: currCompPct,
            diffPct: Math.abs(compPctDiff),
            isUp: compPctDiff >= 0
          },
          overdue: {
            current: currOverdueAct,
            diffCount: Math.abs(overdueDiff),
            isUp: overdueDiff > 0
          }
        });

      } catch (e) {
        console.error("MetricCards Calculation Error:", e);
      }
    };

    calculateMetrics();
    window.addEventListener('storage', calculateMetrics);
    window.addEventListener('sync-action-items', calculateMetrics);

    return () => {
      window.removeEventListener('storage', calculateMetrics);
      window.removeEventListener('sync-action-items', calculateMetrics); 
    };
  }, [filter]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Meetings */}
      <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/40 border border-indigo-100/60 p-5 rounded-2xl">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Meetings</p>
        <h3 className="text-3xl font-extrabold text-gray-900 mb-3">{metrics.meetings.current}</h3>
        <div className={`flex items-center gap-1 text-xs font-medium ${metrics.meetings.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {metrics.meetings.isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
          <span>{metrics.meetings.diffPct}% vs {compareLabel}</span>
        </div>
      </div>

      {/* Total Meeting Hours */}
      <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/40 border border-purple-100/60 p-5 rounded-2xl">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Meeting Hours</p>
        <h3 className="text-3xl font-extrabold text-gray-900 mb-3">{metrics.hours.current}</h3>
        <div className={`flex items-center gap-1 text-xs font-medium ${metrics.hours.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {metrics.hours.isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
          <span>{metrics.hours.diffPct}% vs {compareLabel}</span>
        </div>
      </div>

      {/* Completed Actions */}
      <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100/60 p-5 rounded-2xl relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Completed Actions</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-3">{metrics.completedPct.current}%</h3>
          </div>
          <div className="p-2 bg-emerald-100/60 rounded-xl text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${metrics.completedPct.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {metrics.completedPct.isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
          <span>{metrics.completedPct.diffPct}% vs {compareLabel}</span>
        </div>
      </div>

      {/* Overdue Actions */}
      <div className="bg-gradient-to-br from-rose-50/70 to-red-50/40 border border-rose-100/60 p-5 rounded-2xl relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Overdue Actions</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-3">{metrics.overdue.current}</h3>
          </div>
          <div className="p-2 bg-rose-100/60 rounded-xl text-rose-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${metrics.overdue.isUp ? 'text-rose-600' : 'text-emerald-600'}`}>
          {metrics.overdue.isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
          <span>{metrics.overdue.diffCount} vs {compareLabel}</span>
        </div>
      </div>
    </div>
  );
}
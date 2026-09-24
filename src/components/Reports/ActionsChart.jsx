import React, { useMemo } from 'react';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COMPLETED_STATUSES = new Set(['completed', 'complete', 'done', 'finished', 'closed', 'stopped', 'stop', 'ended']);

export default function ActionsChart({ filter, bookedMeetings = [], actions = [], meetingSessions = {} }) {
  
  const chartData = useMemo(() => {
    const comp = [0, 0, 0, 0];
    const over = [0, 0, 0, 0];
    const now = new Date();
    
    const targetYear = filter?.year ? parseInt(filter.year, 10) : now.getFullYear();
    const targetMonth = filter?.month === 'last_month' 
      ? (now.getMonth() === 0 ? 11 : now.getMonth() - 1)
      : (filter?.month && filter.month !== 'this_month' ? parseInt(filter.month, 10) - 1 : now.getMonth());

    const rawList = actions.length ? actions : bookedMeetings;
    const allActions = rawList.flatMap(item => item?.actions?.length ? item.actions.map(act => ({ ...act, parent: item })) : [item]);

    allActions.forEach(action => {
      const parent = action.parent || {};
      const rawDate = action.dueDate || action.date || action.meeting_date || parent.dueDate || parent.date || parent.meeting_date || action.createdAt;
      if (!rawDate) return;

      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;

      const isMatch = filter?.view === 'year' 
        ? d.getFullYear() === targetYear 
        : d.getFullYear() === targetYear && d.getMonth() === targetMonth;

      if (!isMatch) return;

      const meetingId = action.id || action.meeting_id || parent.id || parent.meeting_id;
      const session = meetingSessions[meetingId] || meetingSessions[String(meetingId)] || meetingSessions[Number(meetingId)] || {};
      
      const sessionStatus = String(session.status || action.status || parent.status || '').toLowerCase().trim();
      const isCompleted = COMPLETED_STATUSES.has(sessionStatus) || Boolean(session.actual_ended_at) || session.completed || action.completed || parent.completed;

      const deadline = new Date(rawDate);
      deadline.setHours(23, 59, 59, 999);
      
      const isOverdue = !isCompleted && (sessionStatus === 'overdue' || action.isOverdue || now > deadline);

      // Index Assignment (Year = Q1-Q4, Month = 4 Weeks)
      const index = filter?.view === 'year' 
        ? Math.min(3, Math.floor(d.getMonth() / 3)) 
        : Math.min(3, Math.floor((d.getDate() - 1) / 7));

      if (isCompleted) comp[index]++;
      else if (isOverdue) over[index]++;
    });

    const labels = filter?.view === 'year' 
      ? ['Q1', 'Q2', 'Q3', 'Q4'] 
      : (() => {
          const m = MONTHS_SHORT[targetMonth] || 'Jan';
          return [`${m} 1-7`, `${m} 8-14`, `${m} 15-21`, `${m} 22-31`];
        })();

    return { completed: comp, overdue: over, labels };
  }, [filter, bookedMeetings, actions, meetingSessions]);

  const maxVal = Math.max(...chartData.completed, ...chartData.overdue, 0);
  const step = Math.max(10, Math.ceil(maxVal / 4 / 10) * 10);
  const max = step * 4;
  const getY = val => 100 - (Math.min(val, max) / max) * 100;

  const [c1, c2, c3, c4] = chartData.completed.map(getY);
  const [o1, o2, o3, o4] = chartData.overdue.map(getY);
  const [x1, x2, x3, x4] = [10, 100, 190, 280];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900">Actions Overview</h2>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-gray-600">Completed</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span><span className="text-gray-600">Overdue</span></div>
        </div>
      </div>

      <div className="relative h-48 w-full flex">
        <div className="flex flex-col justify-between text-[10px] text-gray-400 pb-2 pr-3 items-end w-8 shrink-0">
          <span>{max}</span><span>{step * 3}</span><span>{step * 2}</span><span>{step * 1}</span><span className="font-semibold text-gray-500">0</span>
        </div>

        <div className="relative flex-1 h-[calc(100%-0.5rem)] ml-1">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[...Array(4)].map((_, i) => <div key={i} className="border-b border-gray-100 w-full h-[1px]"></div>)}
            <div className="border-b-2 border-gray-300 w-full h-[1px]"></div>
          </div>

          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 290 100" preserveAspectRatio="none">
            <polyline fill="none" stroke="#F43F5E" strokeWidth="1.5" points={`${x1},${o1} ${x2},${o2} ${x3},${o3} ${x4},${o4}`} />
            {[[x1,o1],[x2,o2],[x3,o3],[x4,o4]].map(([x,y], i) => <circle key={i} cx={x} cy={y} r="2.5" className="fill-white stroke-rose-500 stroke-[1.5px]" />)}

            <polyline fill="none" stroke="#10B981" strokeWidth="2" points={`${x1},${c1} ${x2},${c2} ${x3},${c3} ${x4},${c4}`} />
            {[[x1,c1],[x2,c2],[x3,c3],[x4,c4]].map(([x,y], i) => <circle key={i} cx={x} cy={y} r="3" className="fill-white stroke-emerald-500 stroke-[2px]" />)}
          </svg>

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
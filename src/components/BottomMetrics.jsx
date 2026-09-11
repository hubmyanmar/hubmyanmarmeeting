import React, { useMemo } from 'react';
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

const calculateTrend = (current, previous) => {
  if (!previous || previous === 0) {
    return {
      trend: current > 0 ? "100%" : "0%",
      pos: current >= 0
    };
  }
  const percentage = ((current - previous) / previous) * 100;
  return {
    trend: `${Math.abs(percentage).toFixed(1)}%`,
    pos: percentage >= 0
  };
};

const calculateDurationInHours = (m) => {
  if (m.duration) return parseFloat(m.duration);
  if (!m.startTime || !m.endTime) return 1; // Default 1 hour

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + parseInt(minutes, 10);
  };

  const startMins = parseTime(m.startTime);
  const endMins = parseTime(m.endTime);
  const diff = endMins - startMins;
  return diff > 0 ? diff / 60 : 1;
};

export default function BottomMetrics({ bookedMeetings = [], meetingSessions = {} }) {
  const metrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 - 11

    const prevDate = new Date(currentYear, currentMonth - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth();

    let curMeetings = 0, prevMeetings = 0;
    let curHours = 0, prevHours = 0;
    let curCompleted = 0, prevCompleted = 0;
    let curOverdue = 0, prevOverdue = 0;

    bookedMeetings.forEach((m) => {
      if (!m.date) return;
      const [mYear, mMonth] = m.date.split('-').map(Number);
      const meetingMonthIndex = mMonth - 1; // Month index starts from 0

      const isCurrentMonth = mYear === currentYear && meetingMonthIndex === currentMonth;
      const isPrevMonth = mYear === prevYear && meetingMonthIndex === prevMonth;

      if (!isCurrentMonth && !isPrevMonth) return;

      const duration = calculateDurationInHours(m);
      const id = m.id || `meeting_${m.title}_${m.startTime}`.replace(/[^a-zA-Z0-9]/g, '_');
      const status = meetingSessions[id]?.status;

      const isCompleted = status === 'stopped';
      
      let isOverdue = false;
      if (status !== 'stopped' && status !== 'running') {
        const [time, modifier] = (m.startTime || '00:00 AM').split(' ');
        let [hours, minutes] = (time || '00:00').split(':');
        hours = parseInt(hours, 10);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const mDateTime = new Date(m.date);
        mDateTime.setHours(hours, parseInt(minutes, 10), 0, 0);
        const graceTime = new Date(mDateTime.getTime() + 15 * 60 * 1000);
        
        if (now > graceTime) isOverdue = true;
      }

      if (isCurrentMonth) {
        curMeetings++;
        curHours += duration;
        if (isCompleted) curCompleted++;
        if (isOverdue) curOverdue++;
      } else if (isPrevMonth) {
        prevMeetings++;
        prevHours += duration;
        if (isCompleted) prevCompleted++;
        if (isOverdue) prevOverdue++;
      }
    });

    // Completed Percentages
    const curCompletedRate = curMeetings > 0 ? Math.round((curCompleted / curMeetings) * 100) : 0;
    const prevCompletedRate = prevMeetings > 0 ? Math.round((prevCompleted / prevMeetings) * 100) : 0;

    return {
      meetings: { current: curMeetings, previous: prevMeetings },
      hours: { current: parseFloat(curHours.toFixed(1)), previous: parseFloat(prevHours.toFixed(1)) },
      completed: { current: curCompletedRate, previous: prevCompletedRate },
      overdue: { current: curOverdue, previous: prevOverdue }
    };
  }, [bookedMeetings, meetingSessions]);

  const meetingsTrend = calculateTrend(metrics.meetings.current, metrics.meetings.previous);
  const hoursTrend = calculateTrend(metrics.hours.current, metrics.hours.previous);
  const completedTrend = calculateTrend(metrics.completed.current, metrics.completed.previous);
  
  const overdueTrend = calculateTrend(metrics.overdue.current, metrics.overdue.previous);
  const isOverdueBetter = metrics.overdue.current <= metrics.overdue.previous;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
      <MetricItem 
        icon={<Users className="w-5 h-5 text-indigo-500"/>} 
        title="Total Meetings (This Month)" 
        val={metrics.meetings.current} 
        trend={meetingsTrend.trend} 
        pos={meetingsTrend.pos} 
      />
      <MetricItem 
        icon={<Clock className="w-5 h-5 text-blue-500"/>} 
        title="Total Meeting Hours" 
        val={metrics.hours.current} 
        trend={hoursTrend.trend} 
        pos={hoursTrend.pos} 
      />
      <MetricItem 
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-500"/>} 
        title="Completed Actions" 
        val={`${metrics.completed.current}%`} 
        trend={completedTrend.trend} 
        pos={completedTrend.pos} 
      />
      <MetricItem 
        icon={<AlertTriangle className="w-5 h-5 text-red-500"/>} 
        title="Overdue Actions" 
        val={metrics.overdue.current} 
        trend={overdueTrend.trend} 
        pos={isOverdueBetter} 
      />
    </div>
  );
}
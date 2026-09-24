import React, { useMemo, useEffect } from 'react';
import { TrendingUp, AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function MetricCards({ filter, bookedMeetings = [], meetingSessions = {} }) {
  const compareLabel = filter?.view === 'year' ? 'last year' : 'last month';
  useEffect(() => {
    // console.log("Meeting Sessions Data: ", meetingSessions);
  }, [meetingSessions]);
  const safeSessions = useMemo(() => {
    if (!meetingSessions) return {};
    if (meetingSessions.data && typeof meetingSessions.data === 'object') {
      return meetingSessions.data;
    }
    return meetingSessions;
  }, [meetingSessions]);

  const getSessionForMeeting = (m) => {
    if (!m || !safeSessions) return null;
    const mId = m.id !== undefined && m.id !== null ? String(m.id) : null;
    const mMeetingId = m.meeting_id !== undefined && m.meeting_id !== null ? String(m.meeting_id) : null;

    if (Array.isArray(safeSessions)) {
      return safeSessions.find(s => {
        const sId = s.id !== undefined && s.id !== null ? String(s.id) : null;
        const sMeetingId = s.meeting_id !== undefined && s.meeting_id !== null ? String(s.meeting_id) : null;
        return (mId && (sId === mId || sMeetingId === mId)) || (mMeetingId && sId === mMeetingId);
      }) || null;
    }

    if (typeof safeSessions === 'object') {
      if (mId && safeSessions[mId]) return safeSessions[mId];
      if (mMeetingId && safeSessions[mMeetingId]) return safeSessions[mMeetingId];
    }

    return null;
  };

  const isMeetingCompleted = (m) => {
    if (!m) return false;
    const session = getSessionForMeeting(m);
    
    const sessionStatus = String(session?.status || '').toLowerCase().trim();
    const meetingStatus = String(m?.status || m?.meeting_status || '').toLowerCase().trim();
    const isCompletedFlag = session?.is_completed || m?.is_completed || m?.completed;

    const completedKeywords = ['stopped', 'completed', 'complete', 'done', 'ended', 'finished', 'closed'];

    if (completedKeywords.includes(sessionStatus) || completedKeywords.includes(meetingStatus) || isCompletedFlag) {
      return true;
    }

    const actualDur = session?.actual_duration ?? m?.actual_duration;
    if (actualDur !== undefined && actualDur !== null && Number(actualDur) > 0) return true;

    if (session?.actual_ended_at || m?.actual_ended_at) return true;

    return false;
  };
  const getMeetingHours = (m) => {
    if (m.start_time && m.end_time) {
      const startParts = String(m.start_time).split(':');
      const endParts = String(m.end_time).split(':');

      if (startParts.length >= 2 && endParts.length >= 2) {
        const startH = parseInt(startParts[0], 10);
        const startM = parseInt(startParts[1], 10);
        
        const endH = parseInt(endParts[0], 10);
        const endM = parseInt(endParts[1], 10);

        const startTotalHours = startH + (startM / 60);
        const endTotalHours = endH + (endM / 60);

        let hrs = endTotalHours - startTotalHours;
        
        if (hrs < 0) {
          hrs += 24; 
        }

        if (hrs > 0) {
          return hrs;
        }
      }
    }
    return 0;
  };

  // 3. Overdue
  const isMeetingOverdue = (m, now) => {
    if (isMeetingCompleted(m)) return false;

    const session = getSessionForMeeting(m);
    const status = String(session?.status || m?.status || '').toLowerCase();
    if (status === 'running' || status === 'stopped' || status === 'completed') return false;

    const dateStr = m?.date || m?.meeting_date;
    if (!dateStr) return false;

    const meetingDate = new Date(dateStr);
    if (isNaN(meetingDate.getTime())) return false;

    meetingDate.setHours(23, 59, 59, 999);
    return now > meetingDate;
  };

  const calculateChange = (current, previous) => {
    if (previous === 0) {
      if (current === 0) return { pct: 0, isIncrease: true, isSame: true };
      return { pct: 100, isIncrease: true, isSame: false };
    }
    const diff = current - previous;
    const pct = Math.round((diff / previous) * 100);
    return { pct: Math.abs(pct), isIncrease: diff >= 0, isSame: diff === 0 };
  };

  const metrics = useMemo(() => {
    const now = new Date();
    const meetingsList = Array.isArray(bookedMeetings) ? bookedMeetings : [];

    const currentCount = meetingsList.length;
    let completedHours = 0; 
    let completedCount = 0;

    meetingsList.forEach((m) => {
      if (isMeetingCompleted(m)) {
        completedCount += 1;
        completedHours += getMeetingHours(m);
      }
    });

    const currentOverdue = meetingsList.filter((m) => isMeetingOverdue(m, now)).length;
    const currentCompletedPct = currentCount > 0 ? Math.round((completedCount / currentCount) * 100) : 0;

    return {
      meetings: { current: currentCount, change: calculateChange(currentCount, 0) },
      hours: { current: Number(completedHours.toFixed(2)), change: calculateChange(completedHours, 0) }, 
      completedPct: { current: currentCompletedPct, change: calculateChange(currentCompletedPct, 0) },
      overdue: { current: currentOverdue, change: calculateChange(currentOverdue, 0) }
    };
  }, [bookedMeetings, safeSessions, filter]);

  const TrendBadge = ({ change, reverseColor = false }) => {
    if (change.isSame) {
      return (
        <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
          <Minus className="w-3.5 h-3.5" />
          <span>0% vs {compareLabel}</span>
        </div>
      );
    }
    const isGood = reverseColor ? !change.isIncrease : change.isIncrease;
    const colorClass = isGood ? 'text-emerald-600' : 'text-rose-600';
    const Icon = change.isIncrease ? ArrowUp : ArrowDown;
    const sign = change.isIncrease ? '+' : '-';

    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{sign}{change.pct}% vs {compareLabel}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/40 border border-indigo-100/60 p-5 rounded-2xl">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Meetings</p>
        <h3 className="text-3xl font-extrabold text-gray-900 mb-3">{metrics.meetings.current}</h3>
        <TrendBadge change={metrics.meetings.change} />
      </div>

      <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/40 border border-purple-100/60 p-5 rounded-2xl">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Completed Meeting Hours</p>
        <h3 className="text-3xl font-extrabold text-gray-900 mb-3">{metrics.hours.current} hrs</h3>
        <TrendBadge change={metrics.hours.change} />
      </div>

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
        <TrendBadge change={metrics.completedPct.change} />
      </div>

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
        <TrendBadge change={metrics.overdue.change} reverseColor={true} />
      </div>
    </div>
  );
}
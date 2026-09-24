import React, { useState, useMemo } from 'react';
import { SquareCheck, ArrowRight, ArrowDown } from 'lucide-react';

export default function OverdueActions({ bookedMeetings = [], meetingSessions = {} }) {
  const [showAll, setShowAll] = useState(false);

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

    const completedKeywords = [
      'stopped', 'completed', 'complete', 'done', 
      'ended', 'finished', 'closed',
    ];

    if (completedKeywords.includes(sessionStatus) || completedKeywords.includes(meetingStatus) || isCompletedFlag) {
      return true;
    }

    const actualDur = session?.actual_duration ?? m?.actual_duration;
    if (actualDur !== undefined && actualDur !== null && Number(actualDur) > 0) return true;

    if (session?.actual_ended_at || m?.actual_ended_at) return true;

    return false;
  };
  const overdueItems = useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const meetingsList = Array.isArray(bookedMeetings) ? bookedMeetings : [];

    return meetingsList.flatMap((meeting, index) => {
      if (!meeting) return [];

      const actionsList = Array.isArray(meeting.actions) && meeting.actions.length > 0 
        ? meeting.actions 
        : [meeting];

      return actionsList.map((action, actIndex) => {
        if (isMeetingCompleted(action) || isMeetingCompleted(meeting)) return null;
        const rawDate = action?.dueDate || action?.date || meeting?.date || meeting?.meeting_date;
        if (!rawDate) return null;

        const itemDate = new Date(rawDate);
        if (isNaN(itemDate.getTime())) return null;

        itemDate.setHours(0, 0, 0, 0);
        const diffTime = todayMidnight.getTime() - itemDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return null;

        const overdueText = `${diffDays} day${diffDays > 1 ? 's' : ''} overdue`;

        return {
          id: action?.id || `${meeting?.id || index}-${actIndex}`,
          title: action?.title || action?.action_title || meeting?.title || 'Untitled Action',
          company: action?.company || meeting?.company || meeting?.company_name || 'Unspecified',
          dept: action?.department || meeting?.department || meeting?.room || 'General',
          overdue: overdueText,
          diffDays: diffDays,
        };
      });
    })
    .filter(Boolean)
    .sort((a, b) => b.diffDays - a.diffDays);
  }, [bookedMeetings, safeSessions]);

  const displayedItems = showAll ? overdueItems : overdueItems.slice(0, 3);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Recent Overdue Actions</h2>
          <span className="text-xs font-medium text-gray-400">
            ({overdueItems.length} total)
          </span>
        </div>
        
        <div className="space-y-3">
          {overdueItems.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-6">No overdue actions at the moment</p>
          ) : (
            displayedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <SquareCheck className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">{item.title}</span>
                    <span className="text-[10px] text-gray-400">{item.company}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{item.dept}</span>
                  <span className="text-xs font-medium text-rose-500 whitespace-nowrap">{item.overdue}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {overdueItems.length > 3 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
          >
            <span>{showAll ? 'Show less' : 'View all overdue actions'}</span>
            {showAll ? <ArrowDown className="w-3.5 h-3.5 rotate-180" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
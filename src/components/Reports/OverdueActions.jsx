import React, { useState } from 'react';
import { SquareCheck, ArrowRight, ArrowDown } from 'lucide-react';

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const upper = timeStr.trim().toUpperCase();
  let hours = 0, minutes = 0;
  if (upper.includes('AM') || upper.includes('PM')) {
    const isPM = upper.includes('PM');
    const isAM = upper.includes('AM');
    const [h, m] = upper.replace('AM', '').replace('PM', '').trim().split(':');
    hours = parseInt(h, 10) || 0;
    minutes = parseInt(m, 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
  } else {
    const [h, m] = upper.split(':');
    hours = parseInt(h, 10) || 0;
    minutes = parseInt(m, 10) || 0;
  }
  return hours * 60 + minutes;
};

export default function OverdueActions({ bookedMeetings = [] }) {
  const [showAll, setShowAll] = useState(false);

  const now = new Date();

  const overdueItems = bookedMeetings.map((meeting, index) => {
    if (!meeting.date) return null;

    const meetingDate = new Date(meeting.date);
    const timeStr = meeting.endTime || meeting.startTime || "09:00 AM";
    const totalMinutes = parseTimeToMinutes(timeStr);
    
    meetingDate.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);

    const diffMs = now - meetingDate;
    if (diffMs <= 0) return null;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const overdueText = diffDays === 0 ? 'Due today' : `${diffDays} day${diffDays > 1 ? 's' : ''} overdue`;

    return {
      id: meeting.id || index,
      title: meeting.title || 'Untitled Meeting',
      company: meeting.company || 'Unspecified',
      dept: meeting.room || 'General',
      overdue: overdueText,
    };
  }).filter(Boolean);

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
            <p className="text-gray-400 text-xs text-center py-6">No overdue meetings at the moment</p>
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
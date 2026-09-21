import React from 'react';
import { CalendarPlus, FileText, Upload, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDisplayDate = (dateString) => {
  if (!dateString) return 'Upcoming';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDaysLeftBadge = (dateString) => {
  if (!dateString) return 'Soon';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);

  if (isNaN(target.getTime())) return 'Upcoming';

  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return 'Passed';
  return `${diffDays} days left`;
};

const formatTimeToAMPM = (timeStr) => {
  if (!timeStr) return '';
  const upper = String(timeStr).toUpperCase();
  if (upper.includes('AM') || upper.includes('PM')) {
    return upper;
  }

  const parts = String(timeStr).trim().split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return timeStr;

  const modifier = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedHours = String(hours).padStart(2, '0');
  return `${formattedHours}:${minutes} ${modifier}`;
};

const formatDisplayValue = (val, fallback = '') => {
  if (!val) return fallback;
  if (typeof val === 'object') {
    return val.name || val.title || val.room_name || val.room || fallback;
  }
  return String(val);
};

const ActionItem = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
  >
    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-indigo-600 border border-indigo-100">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
);

const UpcomingItem = ({ date, time, title, room, badge }) => (
  <div className="flex items-start gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0"></div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-0.5">
        <p className="text-[11px] font-bold text-gray-500">
          {date}{time ? `, ${time}` : ''}
        </p>
        <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded">
          {badge}
        </span>
      </div>
      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{title}</h4>
      {room && <p className="text-[12px] text-gray-500 mt-0.5">{room}</p>}
    </div>
  </div>
);

export default function RightSidebar({ upcomingMeetings = [] }) {
  const navigate = useNavigate();
  const displayMeetings = [...upcomingMeetings]
    .sort((a, b) => {
      const dateA = a.date || a.meeting_date || a.created_at || '';
      const timeA = a.startTime || a.start_time || a.time || '00:00';
      const dateB = b.date || b.meeting_date || b.created_at || '';
      const timeB = b.startTime || b.start_time || b.time || '00:00';
      return new Date(`${dateA} ${timeA}`) - new Date(`${dateB} ${timeB}`);
    })
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-2 h-auto">
      {/* Quick Actions Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Quick Actions</h3>
        <div className="space-y-1">
          <ActionItem 
            icon={<CalendarPlus className="w-4 h-4"/>} 
            label="Book a Meeting" 
            onClick={() => navigate('/dashboard/book-meeting')}
          />
          <ActionItem 
            icon={<FileText className="w-4 h-4"/>} 
            label="Add Meeting Note" 
            onClick={() => navigate('/dashboard/meeting-records')}
          />
          <ActionItem 
            icon={<Upload className="w-4 h-4"/>} 
            label="Upload Recording" 
          />
          <ActionItem 
            icon={<ListChecks className="w-4 h-4"/>} 
            label="View Action Items" 
            onClick={() => navigate('/dashboard/action-items')}
          />
        </div>
      </div>

      {/* Upcoming Meetings Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-900">Upcoming Meetings</h3>
          <button 
            onClick={() => navigate('/dashboard/calendar')}
            className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            View Calendar →
          </button>
        </div>
        
        <div className="space-y-4">
          {displayMeetings.length > 0 ? (
            displayMeetings.map((meeting, index) => {
              const meetingDate = meeting.date || meeting.meeting_date || meeting.start_date;
              const meetingTime = meeting.startTime || meeting.start_time || meeting.time;
              const meetingTitle = meeting.title || meeting.meeting_title || meeting.name;
              const meetingRoom = meeting.room || meeting.meeting_room || meeting.room_name;

              return (
                <UpcomingItem 
                  key={meeting.id || index}
                  date={formatDisplayDate(meetingDate)}
                  time={formatTimeToAMPM(meetingTime)}
                  title={formatDisplayValue(meetingTitle, 'Untitled Meeting')}
                  room={formatDisplayValue(meetingRoom)}
                  badge={getDaysLeftBadge(meetingDate)}
                />
              );
            })
          ) : (
            <div className="text-center py-6 text-sm text-gray-400">
              No upcoming meetings scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, CheckCircle2, Calendar } from 'lucide-react';

const normalizeMeetingStatus = (value, sessionLike = {}) => {
  const rawStatus = String(value || sessionLike?.status || '').trim().toLowerCase();
  if (['stopped', 'done', 'completed', 'finished', 'ended', 'closed'].includes(rawStatus)) {
    return 'stopped';
  }

  const terminalTimestamp =
    sessionLike?.stopped_at ||
    sessionLike?.ended_at ||
    sessionLike?.finished_at ||
    sessionLike?.completed_at ||
    sessionLike?.closed_at ||
    sessionLike?.actual_ended_at ||
    sessionLike?.actual_stopped_at ||
    sessionLike?.endedAt ||
    sessionLike?.finishedAt ||
    sessionLike?.completedAt ||
    sessionLike?.closedAt;

  if (terminalTimestamp) {
    return 'stopped';
  }

  if (!value && value !== 0) {
    return null;
  }

  if (['running', 'active', 'in_progress', 'started', 'live', 'recording'].includes(rawStatus)) {
    return 'running';
  }

  return rawStatus || null;
};

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeToAMPM = (timeStr) => {
  if (!timeStr) return '';
  let str = String(timeStr).trim();
  if (str.includes(' - ')) str = str.split(' - ')[0].trim();
  if (str.includes('T')) {
    const timePart = str.split('T')[1];
    if (timePart) return formatTimeToAMPM(timePart.split('.')[0]);
  }
  const upper = str.toUpperCase();
  if (upper.includes('AM') || upper.includes('PM')) return upper;
  const parts = str.split(':');
  if (parts.length < 2) return str;
  let hours = parseInt(parts[0], 10);
  let minutes = parseInt(parts[1], 10);
  if (isNaN(hours)) return str;
  if (isNaN(minutes)) minutes = 0;
  const modifier = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${modifier}`;
};

const parseTimeToDate = (timeStr) => {
  if (!timeStr) return null;
  let str = String(timeStr).trim();
  if (!str) return null;
  if (str.includes(' - ')) str = str.split(' - ')[0].trim();
  if (str.includes('T') || (str.includes('-') && str.includes(':'))) {
    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) return parsedDate;
  }
  const formattedStr = formatTimeToAMPM(str);
  if (!formattedStr) return null;
  const parts = formattedStr.split(' ');
  const timePart = parts[0] || '';
  const modifier = parts[1] || '';
  const timeSubParts = timePart.split(':');
  if (timeSubParts.length < 2) return null;
  let h = parseInt(timeSubParts[0], 10);
  let m = parseInt(timeSubParts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  if (modifier === 'PM' && h < 12) h += 12;
  if (modifier === 'AM' && h === 12) h = 0;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const formatElapsedDuration = (elapsedMins) => {
  if (elapsedMins < 1) return `1 min`;
  if (elapsedMins < 60) {
    return `${elapsedMins} min${elapsedMins === 1 ? '' : 's'}`;
  }
  const hrs = Math.floor(elapsedMins / 60);
  const remainingMins = elapsedMins % 60;
  if (remainingMins === 0) {
    return `${hrs} hr${hrs === 1 ? '' : 's'}`;
  }
  return `${hrs} hr ${remainingMins} min${remainingMins === 1 ? '' : 's'}`;
};

const formatDisplayValue = (val) => {
  if (!val) return '';
  if (typeof val === 'object') {
    return val.name || val.title || val.room_name || val.room || val.label || '';
  }
  return String(val);
};

const sanitizeMeetingData = (meeting) => {
  if (!meeting) return {};
  const link = meeting.meetingLink || meeting.meeting_link || meeting.join_url || meeting.zoom_link || meeting.zoho_link || meeting.url || '';
  const platform = meeting.platform || meeting.meeting_type || meeting.type || '';
  const lowerLink = link.toLowerCase();
  const lowerPlatform = platform.toLowerCase();
  const isOnline = !!link || lowerPlatform.includes('zoom') || lowerPlatform.includes('zoho') || lowerPlatform.includes('online') || lowerLink.includes('zoom') || lowerLink.includes('zoho');
  const rawRoom = formatDisplayValue(meeting.room || meeting.meeting_room || meeting.room_name);
  const roomName = isOnline ? 'Online Meeting' : (rawRoom || 'Main Room');
  const realId = meeting.id || meeting._id || meeting.meeting_id || meeting.meetingId;
  const startTimeRaw = meeting.startTime || meeting.start_time || meeting.time || meeting.start || meeting.meeting_time || meeting.schedule_time || meeting.from_time || '';
  const titleStr = formatDisplayValue(meeting.title || meeting.meeting_title || meeting.name) || 'Untitled Meeting';
  const fallbackId = `meeting_${startTimeRaw || 'notime'}_${titleStr}`.replace(/[^a-zA-Z0-9]/g, '_');

  return {
    id: realId ? String(realId) : fallbackId,
    title: titleStr,
    room: roomName,
    date: formatDisplayValue(meeting.date || meeting.meeting_date),
    startTime: startTimeRaw,
    meetingLink: link,
    platform: platform
  };
};

export default function TodaySchedule({ 
  bookedMeetings = [], 
  todayMeetings = [], 
  currentUser, 
  meetingSessions = {}, 
  refetchSessions,
  onSaveSession
}) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleSessionSync = () => {
      if (refetchSessions) refetchSessions();
    };

    window.addEventListener('sync-meeting-sessions', handleSessionSync);

    return () => {
      window.removeEventListener('sync-meeting-sessions', handleSessionSync);
    };
  }, [refetchSessions]);

  const getSessionData = (cleanData) => {
    if (!meetingSessions || typeof meetingSessions !== 'object') return null;

    const targetId = String(cleanData.id || '').trim();
    const targetTitle = String(cleanData.title || '').trim().toLowerCase();

    const directMatch = meetingSessions[targetId];
    if (directMatch) {
      return {
        ...directMatch,
        meeting_id: directMatch.meeting_id || targetId,
        id: directMatch.id || targetId,
      };
    }

    const values = Object.values(meetingSessions);
    const fallbackMatch = values.find((session) => {
      if (!session) return false;
      const sessionId = String(session.meeting_id || session.id || session.meetingId || '').trim();
      const sessionTitle = String(session.title || session.meeting_title || '').trim().toLowerCase();
      return (targetId && sessionId === targetId) || (targetTitle && sessionTitle === targetTitle);
    });

    return fallbackMatch || null;
  };

  const handleJoin = async (e, item) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    const cleanData = item.cleanData || sanitizeMeetingData(item.originalData || item);
    const meetingId = String(item.id || cleanData.id);
    const meetingWithId = { ...cleanData, id: meetingId };

    try {
      const startIso = new Date().toISOString();
      const runningPayload = { status: 'running', actual_started_at: startIso };

      if (onSaveSession) {
        await onSaveSession(meetingId, runningPayload);
      }

      if (refetchSessions) refetchSessions();
    } catch (error) {
      console.error("❌ Failed to update meeting status to running:", error);
    }

    const link = (meetingWithId.meetingLink || '').trim();
    if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }

    navigate('/dashboard/live-meeting', { 
      state: { meeting: meetingWithId, mode: 'join' } 
    });
  };

  const handleView = (item) => {
    const cleanData = item.cleanData || sanitizeMeetingData(item.originalData || item);
    const meetingWithId = { ...cleanData, id: String(item.id) };
    navigate('/dashboard/action-items', { state: { meeting: meetingWithId, mode: 'view' } });
  };

  const todayDate = getTodayDate();
  const rawList = todayMeetings.length > 0 ? todayMeetings : bookedMeetings;
  
  const todayFilteredMeetings = rawList.filter(m => {
    const rawDate = m.date || m.meeting_date || '';
    if (!rawDate) return false;
    return String(rawDate).includes(todayDate) || todayDate.includes(String(rawDate));
  });

  const processedMeetings = todayFilteredMeetings
    .sort((a, b) => {
      const timeStrA = a.startTime || a.start_time || a.time || '';
      const timeStrB = b.startTime || b.start_time || b.time || '';
      const dateA = parseTimeToDate(timeStrA);
      const dateB = parseTimeToDate(timeStrB);
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    })
    .map((meeting) => {
      const cleanData = sanitizeMeetingData(meeting);
      const startTimeStr = formatTimeToAMPM(cleanData.startTime);
      const start = parseTimeToDate(cleanData.startTime);
      
      const session = getSessionData(cleanData);
      const normalizedStatus = normalizeMeetingStatus(
        session?.status || session?.meeting_status || session?.state,
        session
      );
      const rawStatus = String(normalizedStatus || 'none').toLowerCase().trim();
      const isCompleted = rawStatus === 'stopped' || session?.status === 'stopped';
      
      const startedAt = !isCompleted ? (session?.actual_started_at || session?.started_at || session?.startedAt) : null;
      
      const isRunning = !isCompleted && (['running', 'active', 'in_progress', 'started', 'live', 'recording'].includes(rawStatus) || Boolean(startedAt));

      let status = 'outline';
      let text = 'View';
      let remainingMins = 0;

      if (isCompleted) {
        status = 'completed';
        text = 'Completed';
      } else if (isRunning) {
        const startTimeObj = startedAt ? new Date(startedAt) : currentTime;
        const diffMs = currentTime - startTimeObj;
        const elapsedMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
        
        status = 'badge';
        text = formatElapsedDuration(elapsedMins);
      } else if (start !== null) {
        const diffStartMs = start - currentTime;
        const diffStartMins = Math.floor(diffStartMs / (1000 * 60));
        remainingMins = diffStartMins;

        if (diffStartMins <= 15) {
          status = 'primary';
          text = 'Join';
        } else {
          status = 'outline';
          text = 'View';
        }
      } else {
        status = 'outline';
        text = 'View';
      }

      const participantsList = Array.isArray(meeting.participants) ? meeting.participants : Array.isArray(meeting.attendees) ? meeting.attendees : [];

      return {
        id: cleanData.id,
        time: startTimeStr || 'TBD',
        title: cleanData.title,
        room: cleanData.room,
        status,
        text,
        remainingMins,
        participants: participantsList,
        originalData: meeting,
        cleanData: cleanData
      };
    });

  const isScrollable = processedMeetings.length > 3;

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-auto sm:h-full relative">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3 sm:mb-3.5 shrink-0">
          <h2 className="text-sm sm:text-base font-bold text-gray-900">Today's Schedule</h2>
          <button onClick={() => navigate('/dashboard/my-meetings')} className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 transition-colors cursor-pointer">
            View all <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {processedMeetings.length > 0 ? (
          <div className={`space-y-2 sm:space-y-2.5 ${isScrollable ? 'max-h-[240px] sm:max-h-[320px] overflow-y-auto pr-1' : ''}`}>
            {processedMeetings.map((m) => {
              const extraParticipantsCount = m.participants.length > 3 ? m.participants.length - 3 : 0;
              return (
                <div key={m.id} className="flex items-start gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="text-left shrink-0 w-14 sm:w-16">
                    <p className="text-[11px] sm:text-xs font-bold text-gray-900">{m.time}</p>
                    <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 mt-0.5">
                      {m.status === 'badge' ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </span>
                      ) : m.status === 'completed' ? (
                        <span className="text-emerald-600 font-semibold">Done</span>
                      ) : (
                        m.remainingMins > 0 ? `In ${m.remainingMins}m` : (m.remainingMins < 0 ? 'Late' : 'Starting')
                      )}
                    </p>
                  </div>
                  <div className="w-0.5 bg-indigo-600 rounded-full shrink-0 self-stretch my-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{m.title}</h4>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{m.room}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1.5">
                        {m.participants.length > 0 ? (
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {m.participants.slice(0, 3).map((p, pIdx) => {
                              const nameStr = typeof p === 'string' ? p : p.name || p.email || 'U';
                              const initials = nameStr.substring(0, 2).toUpperCase();
                              return (
                                <div key={pIdx} className="flex h-4 sm:h-5 w-4 sm:w-5 rounded-full bg-indigo-600 text-white text-[8px] sm:text-[9px] font-bold items-center justify-center ring-2 ring-white">
                                  {initials}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[9px] sm:text-[10px] text-gray-400">No attendees</span>
                        )}
                        {extraParticipantsCount > 0 && (
                          <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 ml-0.5">+{extraParticipantsCount}</span>
                        )}
                      </div>
                      <div className="shrink-0">
                        {m.status === 'primary' && (
                          <button onClick={(e) => handleJoin(e, m)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold transition-colors shadow-sm cursor-pointer">
                            Join
                          </button>
                        )}
                        {m.status === 'badge' && (
                          <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[9px] sm:text-xs font-bold select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {m.text}
                          </div>
                        )}
                        {m.status === 'completed' && (
                          <button onClick={() => handleView(m)} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded text-[9px] sm:text-xs font-bold transition-colors cursor-pointer">
                            <CheckCircle2 size={12} /> Done
                          </button>
                        )}
                        {m.status === 'outline' && (
                          <button onClick={() => handleView(m)} className="text-gray-500 hover:text-indigo-600 text-[10px] sm:text-xs font-semibold transition-colors px-1 cursor-pointer">
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[240px] p-3.5 sm:p-6 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-800">No meetings scheduled for today</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Your schedule is completely clear.</p>
          </div>
        )}
      </div>
    </div>
  );
}
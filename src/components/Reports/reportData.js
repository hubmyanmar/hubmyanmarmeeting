const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COMPLETED_STATUSES = new Set(['completed', 'complete', 'done', 'finished', 'closed', 'stopped', 'stop', 'ended']);

const getSafeSessions = (meetingSessions = {}) => {
  if (!meetingSessions) return {};
  if (meetingSessions.data && typeof meetingSessions.data === 'object') return meetingSessions.data;
  return meetingSessions;
};

const getSessionForMeeting = (meeting, safeSessions) => {
  if (!meeting || !safeSessions) return null;
  const id = meeting.id !== undefined && meeting.id !== null ? String(meeting.id) : null;
  const meetingId = meeting.meeting_id !== undefined && meeting.meeting_id !== null ? String(meeting.meeting_id) : null;

  if (Array.isArray(safeSessions)) {
    return safeSessions.find((session) => {
      const sessionId = session.id !== undefined && session.id !== null ? String(session.id) : null;
      const sessionMeetingId = session.meeting_id !== undefined && session.meeting_id !== null ? String(session.meeting_id) : null;
      return (id && (sessionId === id || sessionMeetingId === id)) || (meetingId && sessionId === meetingId);
    }) || null;
  }

  if (typeof safeSessions === 'object') {
    if (id && safeSessions[id]) return safeSessions[id];
    if (meetingId && safeSessions[meetingId]) return safeSessions[meetingId];
  }
  return null;
};

const isMeetingCompleted = (meeting, safeSessions) => {
  if (!meeting) return false;
  const session = getSessionForMeeting(meeting, safeSessions);
  const sessionStatus = String(session?.status || '').toLowerCase().trim();
  const meetingStatus = String(meeting.status || meeting.meeting_status || '').toLowerCase().trim();
  const completedFlag = session?.is_completed || meeting.is_completed || meeting.completed;
  const completedKeywords = ['stopped', 'completed', 'complete', 'done', 'ended', 'finished', 'closed'];

  if (completedKeywords.includes(sessionStatus) || completedKeywords.includes(meetingStatus) || completedFlag) return true;
  const actualDuration = session?.actual_duration ?? meeting.actual_duration;
  if (actualDuration !== undefined && actualDuration !== null && Number(actualDuration) > 0) return true;
  return Boolean(session?.actual_ended_at || meeting.actual_ended_at);
};

const isMeetingOverdue = (meeting, safeSessions) => {
  const rawDate = meeting?.date || meeting?.meeting_date || meeting?.dueDate;
  if (!rawDate) return false;
  const meetingDate = String(rawDate).split('T')[0];
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const session = getSessionForMeeting(meeting, safeSessions);
  const status = String(session?.status || meeting?.status || '').toLowerCase().trim();
  if (isMeetingCompleted(meeting, safeSessions) || status === 'stopped' || status === 'completed') return false;
  return meetingDate < todayString;
};

const getMeetingHours = (meeting) => {
  if (!meeting.start_time || !meeting.end_time) return 0;
  const startParts = String(meeting.start_time).split(':');
  const endParts = String(meeting.end_time).split(':');
  if (startParts.length < 2 || endParts.length < 2) return 0;

  const startHours = parseInt(startParts[0], 10) + parseInt(startParts[1], 10) / 60;
  const endHours = parseInt(endParts[0], 10) + parseInt(endParts[1], 10) / 60;
  let hours = endHours - startHours;
  if (hours < 0) hours += 24;
  return hours > 0 ? hours : 0;
};

const calculateChange = (current, previous) => {
  if (previous === 0) {
    if (current === 0) return { pct: 0, isIncrease: true, isSame: true };
    return { pct: 100, isIncrease: true, isSame: false };
  }
  const difference = current - previous;
  return { pct: Math.abs(Math.round((difference / previous) * 100)), isIncrease: difference >= 0, isSame: difference === 0 };
};

export function getReportSummary(bookedMeetings = [], meetingSessions = {}, filter = {}) {
  const safeSessions = getSafeSessions(meetingSessions);
  const meetings = Array.isArray(bookedMeetings) ? bookedMeetings : [];
  let completedHours = 0;
  let completedCount = 0;

  meetings.forEach((meeting) => {
    if (isMeetingCompleted(meeting, safeSessions)) {
      completedCount += 1;
      completedHours += getMeetingHours(meeting);
    }
  });

  const completedPercentage = meetings.length > 0 ? Math.round((completedCount / meetings.length) * 100) : 0;
  const overdueCount = meetings.filter((meeting) => isMeetingOverdue(meeting, safeSessions)).length;
  return {
    compareLabel: filter?.view === 'year' ? 'last year' : 'last month',
    meetings: { current: meetings.length, change: calculateChange(meetings.length, 0) },
    hours: { current: Number(completedHours.toFixed(2)), change: calculateChange(completedHours, 0) },
    completedPct: { current: completedPercentage, change: calculateChange(completedPercentage, 0) },
    overdue: { current: overdueCount, change: calculateChange(overdueCount, 0) },
  };
}

export function getCompanyBreakdown(bookedMeetings = []) {
  const meetings = Array.isArray(bookedMeetings)
    ? bookedMeetings
    : (bookedMeetings?.data || bookedMeetings?.meetings || []);
  const counts = {};

  meetings.forEach((meeting) => {
    if (!meeting) return;
    const company = meeting.company || meeting.company_name || meeting.org || meeting.organization;
    const department = meeting.department || meeting.department_name || meeting.dept;
    const name = company && String(company).trim() !== ''
      ? String(company).trim()
      : department && String(department).trim() !== ''
        ? String(department).trim()
        : 'Unspecified';
    counts[name] = (counts[name] || 0) + 1;
  });

  const total = meetings.length;
  let accumulatedPercentage = 0;
  const chartData = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => {
      const percentage = total > 0 ? (count / total) * 100 : 0;
      const result = {
        name,
        count,
        percentage: Math.round(percentage),
        strokeDasharray: `${percentage}${100 - percentage}`,
        strokeDashoffset: -accumulatedPercentage,
        colorIndex: index,
      };
      accumulatedPercentage += percentage;
      return result;
    });

  return { total, chartData };
}

export function getActionsOverview(filter = {}, bookedMeetings = [], meetingSessions = {}, actions = []) {
  const completed = [0, 0, 0, 0];
  const overdue = [0, 0, 0, 0];
  const now = new Date();
  const targetYear = filter?.year ? parseInt(filter.year, 10) : now.getFullYear();
  const targetMonth = filter?.month === 'last_month'
    ? (now.getMonth() === 0 ? 11 : now.getMonth() - 1)
    : (filter?.month && filter.month !== 'this_month' ? parseInt(filter.month, 10) - 1 : now.getMonth());
  const rawList = actions.length ? actions : bookedMeetings;
  const allActions = rawList.flatMap((item) => item?.actions?.length
    ? item.actions.map((action) => ({ ...action, parent: item }))
    : [item]);

  allActions.forEach((action) => {
    const parent = action.parent || {};
    const rawDate = action.dueDate || action.date || action.meeting_date || parent.dueDate || parent.date || parent.meeting_date || action.createdAt;
    if (!rawDate) return;
    const date = new Date(rawDate);
    if (isNaN(date.getTime())) return;

    const matches = filter?.view === 'year'
      ? date.getFullYear() === targetYear
      : date.getFullYear() === targetYear && date.getMonth() === targetMonth;
    if (!matches) return;

    const meetingId = action.id || action.meeting_id || parent.id || parent.meeting_id;
    const session = meetingSessions[meetingId] || meetingSessions[String(meetingId)] || meetingSessions[Number(meetingId)] || {};
    const status = String(session.status || action.status || parent.status || '').toLowerCase().trim();
    const isCompleted = COMPLETED_STATUSES.has(status) || Boolean(session.actual_ended_at) || session.completed || action.completed || parent.completed;
    const deadline = new Date(rawDate);
    deadline.setHours(23, 59, 59, 999);
    const isOverdue = !isCompleted && (status === 'overdue' || action.isOverdue || now > deadline);
    const index = filter?.view === 'year'
      ? Math.min(3, Math.floor(date.getMonth() / 3))
      : Math.min(3, Math.floor((date.getDate() - 1) / 7));

    if (isCompleted) completed[index] += 1;
    else if (isOverdue) overdue[index] += 1;
  });

  const labels = filter?.view === 'year'
    ? ['Q1', 'Q2', 'Q3', 'Q4']
    : (() => {
        const month = MONTHS_SHORT[targetMonth] || 'Jan';
        return [`${month} 1-7`, `${month} 8-14`, `${month} 15-21`, `${month} 22-31`];
      })();
  return { completed, overdue, labels };
}

const getRoomName = (room) => room && typeof room === 'object'
  ? room.name || room.room_name || room.title || room.room
  : room;

export function getTopMeetingRooms(filter = {}, meetingSessions = {}, bookedMeetings = []) {
  const counts = {};
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const targetYear = filter?.year ? parseInt(filter.year, 10) : currentYear;
  let targetMonth = currentMonth;

  if (filter?.month) {
    if (filter.month === 'this_month') targetMonth = currentMonth;
    else if (filter.month === 'last_month') targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    else {
      const parsedMonth = parseInt(filter.month, 10);
      targetMonth = parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth - 1 : parsedMonth;
    }
  }

  const meetingsById = {};
  const roomNamesById = {};
  (Array.isArray(bookedMeetings) ? bookedMeetings : []).forEach((meeting) => {
    if (!meeting) return;
    const id = meeting.id ?? meeting.meeting_id ?? meeting.meetingId;
    const rawRoom = meeting.room ?? meeting.meeting_room ?? meeting.room_name ?? meeting.roomName;
    const roomName = getRoomName(rawRoom);
    const roomId = meeting.room_id ?? meeting.roomId ?? (rawRoom && typeof rawRoom === 'object' ? rawRoom.id : null);
    const date = meeting.meeting_date || meeting.date || meeting.startTime || meeting.started_at || meeting.startedAt;
    if (id !== undefined && id !== null) meetingsById[String(id)] = { roomName, date };
    if (roomId !== undefined && roomId !== null && roomName) roomNamesById[String(roomId)] = roomName;
  });

  Object.entries(meetingSessions).forEach(([meetingId, session]) => {
    if (!session) return;
    const status = String(session.status || '').toLowerCase().trim();
    if (!['stopped', 'completed', 'running'].includes(status)) return;

    const meeting = meetingsById[String(session.meeting_id ?? session.meetingId ?? meetingId)];
    const rawDate = session.actual_started_at || session.started_at || session.startedAt || session.date || meeting?.date;
    if (!rawDate) return;
    const normalizedDate = typeof rawDate === 'string' ? rawDate.replace(/^(\d{4}-\d{2}-\d{2}) /, '$1T') : rawDate;
    const date = new Date(normalizedDate);
    if (isNaN(date.getTime())) return;

    const matches = filter?.view === 'year'
      ? date.getFullYear() === targetYear
      : date.getFullYear() === targetYear && date.getMonth() === targetMonth;
    if (!matches) return;

    const sessionRoom = session.room ?? session.room_name ?? session.roomName;
    const sessionRoomName = sessionRoom && typeof sessionRoom === 'object'
      ? getRoomName(sessionRoom)
      : roomNamesById[String(sessionRoom)] || sessionRoom ||
        (session.room_id !== undefined && session.room_id !== null ? roomNamesById[String(session.room_id)] : null);
    const roomName = sessionRoomName || meeting?.roomName || 'Unknown Room';
    if (filter?.room && filter.room !== 'All Rooms' && roomName !== filter.room) return;
    counts[roomName] = (counts[roomName] || 0) + 1;
  });

  const maxCount = Math.max(0, ...Object.values(counts));
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%' }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}

export function getOverdueActions(bookedMeetings = [], meetingSessions = {}) {
  const safeSessions = getSafeSessions(meetingSessions);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const meetings = Array.isArray(bookedMeetings) ? bookedMeetings : [];

  return meetings.flatMap((meeting, index) => {
    if (!meeting) return [];
    const actions = Array.isArray(meeting.actions) && meeting.actions.length > 0 ? meeting.actions : [meeting];
    return actions.map((action, actionIndex) => {
      if (isMeetingCompleted(action, safeSessions) || isMeetingCompleted(meeting, safeSessions)) return null;
      const rawDate = action?.dueDate || action?.date || meeting?.date || meeting?.meeting_date;
      if (!rawDate) return null;
      const itemDate = new Date(rawDate);
      if (isNaN(itemDate.getTime())) return null;

      itemDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((todayMidnight.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return null;
      const company = action?.company || meeting?.company || meeting?.company_name || 'Unspecified';
      const department = action?.department || meeting?.department || meeting?.room || 'General';
      return {
        id: action?.id || `${meeting?.id || index}-${actionIndex}`,
        title: action?.title || action?.action_title || meeting?.title || 'Untitled Action',
        company: typeof company === 'object' ? company.name || 'Unspecified' : company,
        dept: typeof department === 'object' ? department.name || 'General' : department,
        dueDate: rawDate,
        overdue: `${diffDays} day${diffDays > 1 ? 's' : ''} overdue`,
        diffDays,
      };
    });
  }).filter(Boolean).sort((a, b) => b.diffDays - a.diffDays);
}

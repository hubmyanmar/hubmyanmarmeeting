export const TERMINAL_STATUSES = new Set(['stopped', 'done', 'completed', 'finished', 'ended', 'closed']);

export const normalizeMeetingStatus = (value, sessionLike = {}) => {
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

  if (!value && value !== 0) {
    if (terminalTimestamp) return 'stopped';
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  if (TERMINAL_STATUSES.has(normalized)) return 'stopped';
  if (normalized === 'running' || normalized === 'active' || normalized === 'in_progress' || normalized === 'started' || normalized === 'live' || normalized === 'recording') {
    if (terminalTimestamp) return 'stopped';
    return 'running';
  }

  if (terminalTimestamp) return 'stopped';

  return normalized || null;
};

export const isMeetingStopped = (sessionLike = {}) => {
  const status = normalizeMeetingStatus(
    sessionLike?.status || sessionLike?.meeting_status || sessionLike?.state,
    sessionLike
  );

  return status === 'stopped';
};

export const applyMeetingStopState = (session = {}, stoppedAtIso = new Date().toISOString()) => {
  const nextSession = {
    ...session,
    status: 'stopped',
    stopped_at: stoppedAtIso,
    updated_at: stoppedAtIso,
  };

  if (!nextSession.actual_started_at && session?.started_at) {
    nextSession.actual_started_at = session.started_at;
  }

  return nextSession;
};

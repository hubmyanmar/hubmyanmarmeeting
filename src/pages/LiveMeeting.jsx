import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ActionModal from '../components/Records/ActionModal'; 
import LeftPanel from '../components/Records/LeftPanel';
import MeetingHeader from '../components/Records/MeetingHeader';
import RightPanel from '../components/Records/RightPanel';
import StatusBanner from '../components/Records/StatusBanner';

import { useRecording } from '../context/RecordingContext';

const formatTimeToAMPM = (timeStr) => {
  if (!timeStr) return '';
  const str = String(timeStr).trim();
  
  if (str.toUpperCase().includes('AM') || str.toUpperCase().includes('PM')) {
    return str.toUpperCase();
  }
  
  const parts = str.split(':');
  if (parts.length < 2) return str;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return str;

  const modifier = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${String(hours).padStart(2, '0')}:${minutes} ${modifier}`;
};

const formatDisplayValue = (val, fallback = '') => {
  if (!val) return fallback;
  if (typeof val === 'object') {
    return val.name || val.title || val.room_name || val.room || fallback;
  }
  return String(val);
};

const getMeetingId = (target) => {
  const rawId = target?.id || target?._id || target?.meeting_id || target?.meetingId;
  if (rawId) return String(rawId);
  const mTitle = formatDisplayValue(target?.title || target?.meeting_title || target?.name || 'meeting');
  const mTime = formatDisplayValue(target?.startTime || target?.start_time || target?.time || '');
  return `meeting_${mTitle}_${mTime}`.replace(/[^a-zA-Z0-9]/g, '_');
};

export default function LiveMeeting({ 
  selectedMeetingData: propMeetingData, 
  currentUser, 
  refreshSessions, 
  onSaveSession,
  apiUrl = 'http://192.168.57.191:8000/api/v1/meeting-sessions'
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const activeUser = currentUser || {};
  const userId = activeUser?.id || activeUser?._id || 'guest_user';

  const { 
    status, actionType, timer, fileName, liveTranscript, 
    handleStart, handleFileUpload, handlePause, handleResume, handleStop, formatTime 
  } = useRecording();

  const [selectedMeetingData, setSelectedMeetingData] = useState(() => {
    const passedData = propMeetingData || location.state;
    if (passedData) {
      localStorage.setItem('active_live_meeting', JSON.stringify(passedData));
      return passedData;
    }
    const saved = localStorage.getItem('active_live_meeting');
    return saved ? JSON.parse(saved) : null;
  });

  const [actionChosen, setActionChosen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [frozenTimer, setFrozenTimer] = useState(null);

  useEffect(() => {
    const passedData = propMeetingData || location.state;
    if (passedData) {
      setSelectedMeetingData(passedData);
      localStorage.setItem('active_live_meeting', JSON.stringify(passedData));
    }
  }, [propMeetingData, location.state]);

  const rawMeeting = selectedMeetingData?.meeting || selectedMeetingData || {};

  const mockSummary = {
    englishSummary: "This is a test English summary for the meeting discussion.",
    myanmarSummary: "ဒါကတော့ အစည်းအဝေးအတွက် စမ်းသပ်ရေးသားထားတဲ့ မြန်မာလို အကျဉ်းချုပ် ဖြစ်ပါတယ်။",
    keyDecisions: [
      "Decision 1: Approved budget",
      "Decision 2: Next meeting on Friday"
    ],
    actionItems: [
      {
        task: "Prepare report",
        owner: "Aung Aung",
        dueDate: "2026-09-12",
        status: "To Do",
        priority: "High"
      }
    ],
  };

  const formattedStartTime = formatTimeToAMPM(rawMeeting.startTime || rawMeeting.start_time || rawMeeting.time);

  const meeting = { 
    ...rawMeeting, 
    startTime: formattedStartTime,
    ...mockSummary
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const isViewMode = location.state?.mode === 'view' || selectedMeetingData?.mode === 'view';

    if (isViewMode || meeting?.status === 'stopped' || status !== 'idle' || actionChosen) {
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  }, [status, selectedMeetingData, meeting?.status, location.state, actionChosen]);

  const saveRunningSession = async (meetingData) => {
    try {
      const target = meetingData || rawMeeting || meeting;
      const meetingId = getMeetingId(target);
      const nowIso = new Date().toISOString();

      const sessionPayload = {
        meeting_id: meetingId,
        id: meetingId,
        status: 'running',
        actual_started_at: nowIso,
        started_at: nowIso,
        user_id: userId,
        title: target.title || "Untitled Meeting",
        date: target.date || nowIso.split('T')[0],
        room: target.room || target.location || 'Online Meeting'
      };

      if (onSaveSession) {
        await onSaveSession(meetingId, sessionPayload);
      } else {
        await fetch(`${apiUrl}/${meetingId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionPayload)
        });
      }

      if (refreshSessions) {
        await refreshSessions();
      }
    } catch (err) {
      console.error("Failed to save running session status:", err);
    }
  };

  const onStartRecording = (type) => {
    setActionChosen(true);
    setShowModal(false);
    handleStart(type); 
    saveRunningSession(rawMeeting); 
  };

  const onUpload = (e) => {
    setActionChosen(true);
    setShowModal(false);
    handleFileUpload(e);
    saveRunningSession(rawMeeting);
  };

  const onStopRecording = async () => {
    try {
      setFrozenTimer(timer);

      const target = meeting || rawMeeting;
      const meetingId = getMeetingId(target);
      
      const stoppedAtIso = new Date().toISOString();

      const sessionPayload = {
        meeting_id: meetingId,
        id: meetingId,
        status: 'stopped',
        stopped_at: stoppedAtIso,
        updated_at: stoppedAtIso,
        actual_ended_at: stoppedAtIso,
        actual_duration: timer,
      };

      if (onSaveSession) {
        await onSaveSession(meetingId, sessionPayload);
      } else {
        await fetch(`${apiUrl}/${meetingId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionPayload)
        });
      }
      window.dispatchEvent(new CustomEvent('sync-meeting-sessions', { detail: sessionPayload }));
      localStorage.removeItem('active_live_meeting');

      handleStop();

      if (refreshSessions) {
        await refreshSessions();
      }
    } catch (err) {
      console.error("Failed to stop recording/session:", err);
    }
  };

  const isMeetingStopped = meeting?.status === 'stopped' || selectedMeetingData?.status === 'stopped';
  const displayStatus = isMeetingStopped ? 'stopped' : status;
  const displayTimer = isMeetingStopped ? (frozenTimer !== null ? frozenTimer : timer) : timer;

  return (
    <div className="relative flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10">

      <MeetingHeader 
        title={meeting?.title || "Untitled Meeting"} 
        date={meeting?.date}
        startTime={meeting?.startTime}
        endTime={meeting?.endTime}
        room={meeting?.room || meeting?.location}
        participants={meeting?.participants} 
        englishSummary={meeting?.englishSummary}
        myanmarSummary={meeting?.myanmarSummary}
        keyDecisions={meeting?.keyDecisions}
        actionItems={meeting?.actionItems}
      />

      <StatusBanner 
        status={displayStatus} 
        actionType={actionType} 
        timer={displayTimer} 
        fileName={fileName} 
        formatTime={formatTime} 
        handleStop={onStopRecording}
        handlePause={handlePause}
        handleResume={handleResume}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 mt-2 items-start">
        <LeftPanel 
          status={displayStatus}
          timer={displayTimer} 
          formatTime={formatTime}
          handlePause={handlePause} 
          handleResume={handleResume} 
          englishSummary={meeting.englishSummary}
          myanmarSummary={meeting.myanmarSummary}
        />
        <RightPanel 
          status={displayStatus} 
          actionType={actionType}
          liveTranscript={liveTranscript}
          keyDecisions={meeting.keyDecisions}
          actionItems={meeting.actionItems}
        />
      </div>

      <ActionModal 
        showModal={showModal}
        handleStart={onStartRecording}
        fileInputRef={fileInputRef}
        handleFileUpload={onUpload}
        onClose={handleGoHome}
      />
    </div>
  );
}
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
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioUrlRef = useRef(null);
  const audioRef = useRef(null);
  const recordingSegmentStartRef = useRef(null);
  const recordedDurationMsRef = useRef(0);
  const speechRecognitionRef = useRef(null);
  const shouldRestartSpeechRef = useRef(false);
  const isRecordingRef = useRef(false);
  const speechErrorAlertedRef = useRef(false);
  const speechHasErrorRef = useRef(false);
  const speechRestartTimerRef = useRef(null);
  const finalizedSpeechRef = useRef('');

  const activeUser = currentUser || {};
  const userId = activeUser?.id || activeUser?._id || 'guest_user';

  const { 
    status, actionType, timer, fileName, liveTranscript, 
    handleStart, handleFileUpload, handlePause, handleResume, handleStop, handleTranscript, formatTime
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
  const [audioUrl, setAudioUrl] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [speechActivity, setSpeechActivity] = useState('');

  const updatePlaybackUrl = (blob) => {
    if (!blob.size) return;
    const nextUrl = URL.createObjectURL(blob);
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = nextUrl;
    setAudioUrl(nextUrl);
  };

  useEffect(() => () => {
    audioRef.current?.pause();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    shouldRestartSpeechRef.current = false;
    isRecordingRef.current = false;
    clearTimeout(speechRestartTimerRef.current);
    speechRecognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!audioUrl) return;
    const audio = audioRef.current;
    if (audio) audio.currentTime = 0;
  }, [audioUrl]);

  const onPlaybackToggle = async () => {
    if (!audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (audio.ended) audio.currentTime = 0;
      try {
        await audio.play();
      } catch (err) {
        console.error('Unable to play recorded audio:', err);
        setIsAudioPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

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

  const onStartRecording = async (type) => {
    if (type === 'quick_voice_note' || type === 'live_transcription') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (type === 'live_transcription' && SpeechRecognition) {
        try {
          shouldRestartSpeechRef.current = true;
          isRecordingRef.current = true;
          speechErrorAlertedRef.current = false;
          speechHasErrorRef.current = false;
          setSpeechActivity('Starting speech recognition...');
          finalizedSpeechRef.current = '';
          const recognition = new SpeechRecognition();
          speechRecognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = navigator.language || 'en-US';
          recognition.onstart = () => setSpeechActivity('Listening for speech...');
          recognition.onaudiostart = () => setSpeechActivity('Listening for speech...');
          recognition.onspeechstart = () => setSpeechActivity('Speech detected...');
          recognition.onresult = (event) => {
            const interimParts = [];
            // Some prefixed implementations omit resultIndex; process the full
            // result list in that case so interim text is not silently skipped.
            const results = event.results;
            const firstChangedResult = Number.isInteger(event.resultIndex)
              ? Math.min(event.resultIndex, results?.length || 0)
              : Math.max((results?.length || 0) - 1, 0);
            for (let i = firstChangedResult; i < (results?.length || 0); i += 1) {
              const result = results[i];
              const text = result?.[0]?.transcript?.trim() || '';
              if (result?.isFinal) {
                finalizedSpeechRef.current = `${finalizedSpeechRef.current}${finalizedSpeechRef.current ? ' ' : ''}${text}`;
              } else if (text) {
                interimParts.push(text);
              }
            }
            setSpeechActivity('Speech detected...');
            handleTranscript([finalizedSpeechRef.current, ...interimParts].filter(Boolean).join(' '));
          };
          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            shouldRestartSpeechRef.current = false;
            isRecordingRef.current = false;
            speechHasErrorRef.current = true;
            clearTimeout(speechRestartTimerRef.current);
            setSpeechActivity(`Speech recognition error: ${event.error}`);
            if (['network', 'not-allowed'].includes(event.error) && !speechErrorAlertedRef.current) {
              speechErrorAlertedRef.current = true;
              window.alert('Speech Server Blocked: Please use localtunnel HTTPS.');
            }
            try { recognition.stop(); } catch (stopError) {
              console.error('Unable to stop speech recognition after error:', stopError);
            }
          };
          recognition.onend = () => {
            if (!speechHasErrorRef.current) setSpeechActivity('');
            if (shouldRestartSpeechRef.current && isRecordingRef.current) {
              clearTimeout(speechRestartTimerRef.current);
              setSpeechActivity('Restarting speech recognition...');
              speechRestartTimerRef.current = setTimeout(() => {
                if (!shouldRestartSpeechRef.current || !isRecordingRef.current) return;
                try { recognition.start(); } catch (err) {
                  console.error('Unable to restart speech recognition:', err);
                }
              }, 1000);
            }
          };
          recognition.start();
        } catch (err) {
          console.error('Speech recognition is unavailable or failed to start:', err);
        }
      } else if (type === 'live_transcription') {
        console.error('Speech recognition is blocked or not supported by this browser.');
        setSpeechActivity('Speech recognition is unavailable in this browser.');
        window.alert('Live transcription is not supported by this browser.');
      }
      try {
        if (window.isSecureContext === false && window.location.hostname !== 'localhost') {
          throw new Error('Microphone access requires HTTPS (or localhost).');
        }
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Microphone recording is not supported by this browser.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        if (!window.MediaRecorder) throw new Error('Audio recording is not supported by this browser.');
        const formats = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
        const mimeType = formats.find((format) => MediaRecorder.isTypeSupported?.(format));
        let recorder;
        try {
          recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        } catch {
          // Some mobile browsers report MIME support but reject that type on construction.
          recorder = new MediaRecorder(stream);
        }

        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        recordedDurationMsRef.current = 0;
        recordingSegmentStartRef.current = null;
        setAudioDuration(0);
        setPlaybackTime(0);
        setAudioUrl('');
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;

        recorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            updatePlaybackUrl(new Blob(audioChunksRef.current, {
              type: recorder.mimeType || event.data.type || '',
            }));
          }
        });
        recorder.addEventListener('stop', () => {
          const blob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || audioChunksRef.current[0]?.type || '',
          });
          if (recordingSegmentStartRef.current !== null) {
            recordedDurationMsRef.current += Date.now() - recordingSegmentStartRef.current;
            recordingSegmentStartRef.current = null;
          }
          setAudioDuration(Math.ceil(recordedDurationMsRef.current / 1000));
          updatePlaybackUrl(blob);
          console.log('Recording audio Blob:', blob);
          window.dispatchEvent(new CustomEvent('meeting-audio-recorded', { detail: { blob } }));
          stream.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
          mediaRecorderRef.current = null;
        }, { once: true });

        recorder.start();
        recordingSegmentStartRef.current = Date.now();
      } catch (err) {
        console.error('Unable to start audio recording:', err);
        isRecordingRef.current = false;
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        shouldRestartSpeechRef.current = false;
        speechRecognitionRef.current?.stop();
        const message = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
          ? 'Microphone permission was denied. Allow microphone access in your browser settings and try again.'
          : /HTTPS|secure/i.test(err?.message || '')
            ? 'Microphone access requires a secure HTTPS connection.'
            : 'Unable to access the microphone. Check your browser permissions and try again.';
        window.alert(message);
        return;
      }
    }

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
      shouldRestartSpeechRef.current = false;
      isRecordingRef.current = false;
      clearTimeout(speechRestartTimerRef.current);
      speechRecognitionRef.current?.stop();
      speechRecognitionRef.current = null;
      if (recordingSegmentStartRef.current !== null) {
        recordedDurationMsRef.current += Date.now() - recordingSegmentStartRef.current;
        recordingSegmentStartRef.current = null;
      }
      setAudioDuration(Math.ceil(recordedDurationMsRef.current / 1000));
      if (mediaRecorderRef.current?.state === 'recording' || mediaRecorderRef.current?.state === 'paused') {
        mediaRecorderRef.current.stop();
      }
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

  const onPauseRecording = () => {
    shouldRestartSpeechRef.current = false;
    isRecordingRef.current = false;
    speechRecognitionRef.current?.stop();
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === 'recording') {
      if (recordingSegmentStartRef.current !== null) {
        recordedDurationMsRef.current += Date.now() - recordingSegmentStartRef.current;
        recordingSegmentStartRef.current = null;
      }
      setAudioDuration(Math.ceil(recordedDurationMsRef.current / 1000));
      recorder.pause();
      recorder.requestData();
    }
    handlePause();
  };

  const onResumeRecording = () => {
    isRecordingRef.current = true;
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      recordingSegmentStartRef.current = Date.now();
    }
    if (actionType === 'live_transcription' && speechRecognitionRef.current) {
      shouldRestartSpeechRef.current = true;
      speechHasErrorRef.current = false;
      setSpeechActivity('Listening for speech...');
      try { speechRecognitionRef.current.start(); } catch (err) {
        console.error('Unable to resume speech recognition:', err);
      }
    }
    handleResume();
  };

  const onPlaybackEnded = () => {
    setIsAudioPlaying(false);
    setPlaybackTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const isMeetingStopped = meeting?.status === 'stopped' || selectedMeetingData?.status === 'stopped';
  const displayStatus = isMeetingStopped ? 'stopped' : status;
  const displayTimer = isMeetingStopped ? (frozenTimer !== null ? frozenTimer : timer) : timer;

  return (
    <div className="relative flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10">

      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        hidden
        onPlay={() => setIsAudioPlaying(true)}
        onPause={() => setIsAudioPlaying(false)}
        onEnded={onPlaybackEnded}
        onTimeUpdate={(event) => setPlaybackTime(event.currentTarget.currentTime)}
      />

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
        handlePause={onPauseRecording}
        handleResume={onResumeRecording}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 mt-2 items-start">
        <LeftPanel 
          status={displayStatus}
          timer={displayTimer} 
          formatTime={formatTime}
          handlePause={onPauseRecording} 
          handleResume={onResumeRecording} 
          audioUrl={audioUrl}
          isAudioPlaying={isAudioPlaying}
          playbackTime={playbackTime}
          audioDuration={audioDuration}
          onPlaybackToggle={onPlaybackToggle}
          englishSummary={meeting.englishSummary}
          myanmarSummary={meeting.myanmarSummary}
        />
        <RightPanel 
          status={displayStatus} 
          actionType={actionType}
          liveTranscript={liveTranscript}
          speechActivity={speechActivity}
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

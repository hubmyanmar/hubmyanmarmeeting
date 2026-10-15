import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ActionModal from '../components/Records/ActionModal'; 
import LeftPanel from '../components/Records/LeftPanel';
import MeetingHeader from '../components/Records/MeetingHeader';
import RightPanel from '../components/Records/RightPanel';
import StatusBanner from '../components/Records/StatusBanner';

import { useRecording } from '../context/RecordingContext';
import api from '../api';
import { createMultipartUpload, uploadFileToS3 } from '../api/s3Upload';
import { isMeetingStopped as isStoppedSession } from '../utils/meetingSessionState';

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

const formatRecordingTime = (totalSeconds = 0) => {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;
  return `${String(minutesPart).padStart(2, '0')}:${String(secondsPart).padStart(2, '0')}`;
};

const getAudioExtension = (mimeType) => {
  const mediaType = String(mimeType || '').split(';')[0].trim().toLowerCase();
  const extensions = {
    'audio/mp4': 'mp4',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
  };
  return extensions[mediaType] || 'webm';
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

const hasSavedRecording = (meeting) => Boolean(
  meeting?.recording_completed || meeting?.recording_uploaded || meeting?.audio_url ||
  isStoppedSession(meeting) || isStoppedSession(meeting?.meeting)
);

const persistUploadedAudio = (meeting, audioUrl) => {
  let savedMeeting = null;
  try { savedMeeting = JSON.parse(localStorage.getItem('active_live_meeting') || 'null'); } catch { /* ignore invalid saved state */ }
  localStorage.setItem('active_live_meeting', JSON.stringify({
    ...(savedMeeting || meeting),
    audio_url: audioUrl,
    recording_uploaded: true,
  }));
};

const getUserMediaWithTimeout = (constraints, timeoutMs = 30000) => {
  let requestTimedOut = false;
  let timeoutId;
  const mediaRequest = navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    // The browser may resolve after the timeout; do not leave a late stream open.
    if (requestTimedOut) stream.getTracks().forEach((track) => track.stop());
    return stream;
  });
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      requestTimedOut = true;
      const error = new Error('Microphone permission request timed out.');
      error.name = 'TimeoutError';
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([mediaRequest, timeout]).finally(() => window.clearTimeout(timeoutId));
};

export default function LiveMeeting({ 
  selectedMeetingData: propMeetingData, 
  currentUser, 
  refreshSessions, 
  onSaveSession
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordedAudioBlobRef = useRef(null);
  const uploadCompletionRef = useRef(Promise.resolve(null));
  const retryActionRef = useRef('quick_voice_note');
  const retryFileRef = useRef(null);
  const errorSourceRef = useRef('mic');
  const audioUrlRef = useRef(null);
  const audioRef = useRef(null);
  const restoredMeetingIdRef = useRef(null);
  const recordingSegmentStartRef = useRef(null);
  const recordedDurationMsRef = useRef(0);
  const speechRecognitionRef = useRef(null);
  const shouldRestartSpeechRef = useRef(false);
  const isRecordingRef = useRef(false);
  const speechErrorAlertedRef = useRef(false);
  const speechHasErrorRef = useRef(false);
  const speechRestartTimerRef = useRef(null);
  const finalizedSpeechRef = useRef('');
  const translationInFlightRef = useRef(false);
  const isMountedRef = useRef(false);
  const statusPollIntervalRef = useRef(null);
  const statusPollAbortRef = useRef(null);
  const cancelStatusPollRef = useRef(null);

  const activeUser = currentUser || {};
  const userId = activeUser?.id || activeUser?._id || 'guest_user';

  const { 
    status, actionType, fileName, liveTranscript, uploadProgress, audioUrl: uploadedAudioUrl,
    setStatus, setActionType, setFileName, setUploadProgress, setAudioUrl: setUploadedAudioUrl,
    handleStart, handlePause, handleResume, handleStop, handleTranscript, resetRecording
  } = useRecording();

  const [selectedMeetingData, setSelectedMeetingData] = useState(() => {
    const passedData = propMeetingData || location.state;
    const savedValue = localStorage.getItem('active_live_meeting');
    let savedData = null;
    try {
      savedData = savedValue ? JSON.parse(savedValue) : null;
    } catch (error) {
      console.error('Unable to restore saved meeting state:', error);
    }
    const savedId = getMeetingId(savedData?.meeting || savedData || {});
    const passedId = getMeetingId(passedData?.meeting || passedData || {});
    if (hasSavedRecording(savedData) && (!passedData || savedId === passedId)) return savedData;
    if (passedData) {
      localStorage.setItem('active_live_meeting', JSON.stringify(passedData));
      return passedData;
    }
    return savedData;
  });
  const [generatedContent, setGeneratedContent] = useState({
    englishSummary: '',
    myanmarSummary: '',
    keyDecisions: [],
    actionItems: [],
  });
  const [isGeneratingTranslation, setIsGeneratingTranslation] = useState(false);
  const [translationComplete, setTranslationComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [actionChosen, setActionChosen] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [speechActivity, setSpeechActivity] = useState('');
  const [isRestoringMeeting, setIsRestoringMeeting] = useState(true);

  const saveStoppedSession = async (meetingData, duration) => {
    const meetingId = Number.parseInt(getMeetingId(meetingData), 10);
    if (!Number.isInteger(meetingId)) return;
    const stoppedAt = new Date().toISOString();
    const session = {
      meeting_id: meetingId,
      id: meetingId,
      status: 'stopped',
      stopped_at: stoppedAt,
      actual_ended_at: stoppedAt,
      ended_at: stoppedAt,
      updated_at: stoppedAt,
      actual_duration: duration,
      title: meetingData?.title || meetingData?.meeting_title || 'Untitled Meeting',
      date: meetingData?.date || stoppedAt.split('T')[0],
      room: meetingData?.room || meetingData?.location || 'Online Meeting',
    };
    try {
      if (onSaveSession) {
        await onSaveSession(meetingId, session);
        return true;
      }
      await api.post(`/meeting-sessions/${meetingId}/status`, session);
    } catch (error) {
      console.error('Failed to save stopped meeting session:', error);
    }
    return false;
  };

  useEffect(() => {
    if (!isRecording || isPaused) return undefined;
    const intervalId = window.setInterval(() => {
      setRecordingSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [isRecording, isPaused]);

  useEffect(() => {
    resetRecording();
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (statusPollIntervalRef.current) {
        window.clearInterval(statusPollIntervalRef.current);
        statusPollIntervalRef.current = null;
      }
      cancelStatusPollRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!selectedMeetingData) {
      setIsRestoringMeeting(false);
      return undefined;
    }
    const meetingId = getMeetingId(selectedMeetingData?.meeting || selectedMeetingData || {});
    if (restoredMeetingIdRef.current === meetingId) return undefined;
    restoredMeetingIdRef.current = meetingId;
    let cancelled = false;
    setIsRestoringMeeting(true);

    const hasLocalRecording = hasSavedRecording(selectedMeetingData);
    if (hasLocalRecording) {
      const completed = { ...selectedMeetingData, status: 'stopped', recording_completed: true };
      localStorage.setItem('active_live_meeting', JSON.stringify(completed));
      setStatus('ready');
      setActionChosen(true);
      setAudioUrl(selectedMeetingData.audio_url || null);
      setUploadedAudioUrl(selectedMeetingData.audio_url || '');
      setRecordingSeconds(Number(selectedMeetingData.duration_seconds || selectedMeetingData.actual_duration || 0));
      handleTranscript(selectedMeetingData.transcript || '');
      setGeneratedContent((current) => ({
        ...current,
        englishSummary: selectedMeetingData.summary || selectedMeetingData.ai_summary_en || '',
        myanmarSummary: selectedMeetingData.ai_summary_my || '',
        keyDecisions: selectedMeetingData.decisions || selectedMeetingData.key_decisions || [],
        actionItems: selectedMeetingData.action_items || [],
      }));
      setTranslationComplete(Boolean(selectedMeetingData.summary || selectedMeetingData.ai_summary_en || selectedMeetingData.ai_summary_my));
    }
    if (!/^\d+$/.test(meetingId)) {
      restoredMeetingIdRef.current = meetingId;
      setIsRestoringMeeting(false);
      return undefined;
    }
    let restoreComplete = false;
    (async () => {
      try {
        if (!cancelled && hasLocalRecording) {
          const completed = { ...selectedMeetingData, status: 'stopped', recording_completed: true };
          const savedInParent = await saveStoppedSession(completed, Number(completed.duration_seconds || completed.actual_duration || 0));
          if (!savedInParent) {
            window.dispatchEvent(new CustomEvent('sync-meeting-sessions', {
              detail: { meeting_id: meetingId, id: meetingId, status: 'stopped' },
            }));
            if (refreshSessions) await refreshSessions();
          }
        }
        const { data: responseData } = await api.get('/uploads', { params: { meeting_id: meetingId } });
        const upload = responseData?.data?.data || responseData?.data || responseData?.result || responseData;
        const stored = (() => {
          try { return JSON.parse(localStorage.getItem('active_live_meeting') || 'null'); }
          catch { return null; }
        })();
        if (!cancelled && upload?.audio_url) {
          restoreComplete = true;
          restoredMeetingIdRef.current = meetingId;
          setUploadedAudioUrl(upload.audio_url);
          setAudioUrl(upload.audio_url);
          const processingContent = applyProcessingResult(upload);
          setGeneratedContent((current) => ({
            ...current,
            englishSummary: processingContent.summary || current.englishSummary || '',
            myanmarSummary: upload.ai_summary_my || current.myanmarSummary || '',
            keyDecisions: processingContent.decisions || current.keyDecisions || [],
            actionItems: processingContent.action_items || current.actionItems || [],
          }));
          setActionChosen(true);
          setTranslationComplete(Boolean(processingContent.summary || upload.ai_summary_my));
          setStatus('ready');
          const completed = {
            ...(stored || selectedMeetingData),
            status: 'stopped',
            recording_completed: true,
            audio_url: upload.audio_url,
            transcript: upload.transcript || stored?.transcript || '',
            summary: processingContent.summary || stored?.summary || '',
            ai_summary_en: processingContent.summary || stored?.ai_summary_en || '',
            ai_summary_my: upload.ai_summary_my || stored?.ai_summary_my || '',
            decisions: processingContent.decisions || stored?.decisions || [],
            action_items: processingContent.action_items || stored?.action_items || [],
          };
          localStorage.setItem('active_live_meeting', JSON.stringify(completed));
          setSelectedMeetingData(completed);
          if (!hasLocalRecording) {
            const savedInParent = await saveStoppedSession(completed, Number(completed.duration_seconds || completed.actual_duration || 0));
            if (!savedInParent) {
              window.dispatchEvent(new CustomEvent('sync-meeting-sessions', {
                detail: { meeting_id: meetingId, id: meetingId, status: 'stopped' },
              }));
              if (refreshSessions) await refreshSessions();
            }
          }
        }
      } catch (error) {
        if (error.response?.status !== 404) console.error('Unable to restore meeting upload:', error);
        if (hasSavedRecording(selectedMeetingData)) setStatus('ready');
      } finally {
        if (!cancelled) {
          restoreComplete = true;
          restoredMeetingIdRef.current = meetingId;
          setIsRestoringMeeting(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      if (!restoreComplete && restoredMeetingIdRef.current === meetingId) restoredMeetingIdRef.current = null;
    };
  }, [selectedMeetingData]);

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

  const onDownloadAudio = async () => {
    try {
      let blob = recordedAudioBlobRef.current;
      if (!blob && audioUrl) {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`Audio download failed (${response.status}).`);
        blob = await response.blob();
      }
      if (!blob?.size) throw new Error('No recorded audio is available to download.');

      const sourceBlob = blob.type ? blob : new Blob([blob], { type: 'audio/webm' });
      let Mp3Encoder = window.lamejs?.Mp3Encoder;
      if (!Mp3Encoder) {
        const { default: encoderScriptUrl } = await import('lamejs/lame.min.js?url');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = encoderScriptUrl;
          script.onload = resolve;
          script.onerror = () => reject(new Error('The MP3 encoder script could not be loaded.'));
          document.head.appendChild(script);
        });
        Mp3Encoder = window.lamejs?.Mp3Encoder;
      }
      if (!Mp3Encoder) throw new Error('The MP3 encoder could not be loaded.');
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const OfflineAudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!AudioContextClass || !OfflineAudioContextClass) throw new Error('This browser cannot convert the recording to MP3.');

      const audioContext = new AudioContextClass();
      let mp3Blob;
      try {
        const decodedAudio = await audioContext.decodeAudioData(await sourceBlob.arrayBuffer());
        const channelCount = Math.min(decodedAudio.numberOfChannels, 2);
        const sampleRate = 44100;
        const offlineContext = new OfflineAudioContextClass(
          channelCount,
          Math.ceil(decodedAudio.duration * sampleRate),
          sampleRate
        );
        const source = offlineContext.createBufferSource();
        source.buffer = decodedAudio;
        source.connect(offlineContext.destination);
        source.start();
        const resampledAudio = await offlineContext.startRendering();
        const encoder = new Mp3Encoder(channelCount, sampleRate, 128);
        const left = resampledAudio.getChannelData(0);
        const right = channelCount > 1 ? resampledAudio.getChannelData(1) : null;
        const mp3Chunks = [];
        const frameSize = 1152;

        for (let offset = 0; offset < resampledAudio.length; offset += frameSize) {
          const frameLength = Math.min(frameSize, resampledAudio.length - offset);
          const leftFrame = new Int16Array(frameLength);
          const rightFrame = right ? new Int16Array(frameLength) : null;
          for (let i = 0; i < frameLength; i += 1) {
            const leftSample = Math.max(-1, Math.min(1, left[offset + i]));
            leftFrame[i] = leftSample < 0 ? leftSample * 0x8000 : leftSample * 0x7fff;
            if (rightFrame) {
              const rightSample = Math.max(-1, Math.min(1, right[offset + i]));
              rightFrame[i] = rightSample < 0 ? rightSample * 0x8000 : rightSample * 0x7fff;
            }
          }
          const encodedFrame = rightFrame
            ? encoder.encodeBuffer(leftFrame, rightFrame)
            : encoder.encodeBuffer(leftFrame);
          if (encodedFrame.length) mp3Chunks.push(encodedFrame);
        }
        const finalFrame = encoder.flush();
        if (finalFrame.length) mp3Chunks.push(finalFrame);
        mp3Blob = new Blob(mp3Chunks, { type: 'audio/mpeg' });
      } finally {
        await audioContext.close();
      }

      const downloadUrl = URL.createObjectURL(mp3Blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Meeting_Record_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (error) {
      console.error('Unable to download recorded audio:', error);
    }
  };

  const setAudioPreview = (blob) => {
    if (!blob?.size) return;
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    const previewUrl = URL.createObjectURL(blob);
    audioUrlRef.current = previewUrl;
    setAudioUrl(previewUrl);
  };

  const applyProcessingResult = (response) => {
    const content = response?.data?.data?.data || response?.data?.data || response?.data?.result || response?.data || response || {};
    const transcript = content.transcript;
    const summary = content.summary || content.summary_en || content.ai_summary_en;
    const decisions = content.decisions || content.key_decisions;
    const actionItems = content.action_items;

    if (transcript) handleTranscript(transcript);
    setGeneratedContent((current) => ({
      ...current,
      englishSummary: summary || current.englishSummary,
      myanmarSummary: content.summary_my || current.myanmarSummary,
      keyDecisions: Array.isArray(decisions) ? decisions : current.keyDecisions,
      actionItems: Array.isArray(actionItems) ? actionItems : current.actionItems,
    }));
    return {
      ...content,
      ...(transcript ? { transcript } : {}),
      ...(summary ? { summary } : {}),
      ...(Array.isArray(decisions) ? { decisions } : {}),
      ...(Array.isArray(actionItems) ? { action_items: actionItems } : {}),
    };
  };

  const loadMeetingUpload = async (meetingId) => {
    if (!meetingId) {
      console.warn('Cannot load meeting upload without a meeting ID.');
      return;
    }
    try {
      const { data: responseData } = await api.get('/uploads', {
        params: { meeting_id: meetingId },
      });
      const upload = responseData?.data?.data || responseData?.data || responseData?.result || responseData;
      if (upload.audio_url) {
        setUploadedAudioUrl(upload.audio_url);
        setAudioUrl(upload.audio_url);
      }
      return applyProcessingResult(upload);
    } catch (error) {
      console.error('Unable to load meeting upload:', error.response?.data?.detail || error);
    }
  };

  useEffect(() => {
    const passedData = propMeetingData || location.state;
    if (passedData) {
      let savedData = null;
      try { savedData = JSON.parse(localStorage.getItem('active_live_meeting') || 'null'); } catch { /* ignore invalid saved state */ }
      const savedId = getMeetingId(savedData?.meeting || savedData || {});
      const passedId = getMeetingId(passedData?.meeting || passedData || {});
      const meetingData = hasSavedRecording(savedData) && savedId === passedId ? savedData : passedData;
      setSelectedMeetingData(meetingData);
      localStorage.setItem('active_live_meeting', JSON.stringify(meetingData));
    }
  }, [propMeetingData, location.state]);

  const rawMeeting = selectedMeetingData?.meeting || selectedMeetingData || {};

  const formattedStartTime = formatTimeToAMPM(rawMeeting.startTime || rawMeeting.start_time || rawMeeting.time);

  const meeting = { 
    ...rawMeeting, 
    startTime: formattedStartTime,
    ...generatedContent,
    summary: generatedContent.englishSummary || rawMeeting.summary || rawMeeting.ai_summary_en || '',
  };
  const isViewMode = location.state?.mode === 'view' || selectedMeetingData?.mode === 'view';
  const showModal = !isRestoringMeeting && !isViewMode && status === 'idle' && !actionChosen && !hasSavedRecording(selectedMeetingData);

  const waitForProcessingStatus = (meetingId) => new Promise((resolve, reject) => {
    if (statusPollIntervalRef.current || cancelStatusPollRef.current) {
      reject(new Error('A meeting status poll is already active.'));
      return;
    }
    if (!isMountedRef.current) {
      const error = new Error('Status polling was cancelled.');
      error.name = 'AbortError';
      reject(error);
      return;
    }
    const controller = new AbortController();
    let intervalId;
    let requestInFlight = false;
    let settled = false;

    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      if (intervalId) window.clearInterval(intervalId);
      if (statusPollIntervalRef.current === intervalId) statusPollIntervalRef.current = null;
      if (statusPollAbortRef.current === controller) statusPollAbortRef.current = null;
      if (cancelStatusPollRef.current === cancel) cancelStatusPollRef.current = null;
      if (error) reject(error);
      else resolve(value);
    };

    const cancel = () => {
      controller.abort();
      const error = new Error('Status polling was cancelled.');
      error.name = 'AbortError';
      finish(error);
    };

    statusPollAbortRef.current = controller;
    cancelStatusPollRef.current = cancel;
    intervalId = window.setInterval(async () => {
      if (requestInFlight || !isMountedRef.current) return;
      requestInFlight = true;
      try {
        const { data: response } = await api.get(`/meeting-records/${meetingId}/status`, {
          signal: controller.signal,
        });
        const taskStatus = response?.data?.data || response?.data?.result || response?.data || response;
        const returnedStatus = taskStatus?.status;

        if (returnedStatus === 'completed') {
          finish(null, taskStatus);
        } else if (returnedStatus === 'failed') {
          finish(new Error('Translation failed. Please try again.'));
        } else if (returnedStatus !== 'processing') {
          finish(new Error('The server returned an unknown audio processing status.'));
        }
      } catch (error) {
        finish(error);
      } finally {
        requestInFlight = false;
      }
    }, 5000);
    statusPollIntervalRef.current = intervalId;
  });

  const handleGenerateTranslation = async () => {
    if (translationInFlightRef.current) return;
    translationInFlightRef.current = true;
    setIsGeneratingTranslation(true);
    if (!uploadedAudioUrl) {
      const message = 'Upload the recording before generating its summary.';
      setStatus('error');
      setErrorMessage(message);
      window.alert(message);
      translationInFlightRef.current = false;
      setIsGeneratingTranslation(false);
      return;
    }
    setStatus('processing_ai');
    setErrorMessage('');
    try {
      const payload = {
        meeting_id: getMeetingId(rawMeeting),
        audio_url: uploadedAudioUrl,
      };
      const headers = { 'Content-Type': 'application/json' };
      console.log('[translate] request payload:', payload);
      console.log('[translate] request headers:', headers);
      const meetingId = getMeetingId(rawMeeting);
      const { data: acceptedResult } = await api.post('/translate', payload, { headers });
      if (!isMountedRef.current) return;
      const accepted = acceptedResult?.data?.data || acceptedResult?.data?.result || acceptedResult?.data || acceptedResult;
      if (!accepted?.task_id) throw new Error('The processing task was not created. Please retry.');

      await waitForProcessingStatus(meetingId);

      const { data: recordResult } = await api.get(`/meeting-records/${meetingId}`);
      if (!isMountedRef.current) return;
      const content = recordResult?.data?.data || recordResult?.data?.result || recordResult?.data || recordResult;
      const transcript = content.transcript || '';
      const summary = content.summary || '';
      const decisions = content.decisions || [];
      const actionItems = content.action_items || [];
      handleTranscript(transcript);
      setGeneratedContent({
        englishSummary: summary,
        myanmarSummary: summary,
        keyDecisions: Array.isArray(decisions) ? decisions : [],
        actionItems: Array.isArray(actionItems) ? actionItems : [],
      });
      const savedMeeting = (() => {
        try { return JSON.parse(localStorage.getItem('active_live_meeting') || 'null'); }
        catch { return null; }
      })();
      const completedMeeting = {
        ...(savedMeeting || rawMeeting),
        status: 'stopped',
        recording_completed: true,
        recording_uploaded: true,
        audio_url: uploadedAudioUrl,
        transcript,
        summary,
        decisions,
        key_decisions: decisions,
        action_items: actionItems,
      };
      localStorage.setItem('active_live_meeting', JSON.stringify(completedMeeting));
      setSelectedMeetingData(completedMeeting);
      setTranslationComplete(true);
      setStatus('ready');
    } catch (error) {
      console.error('Unable to generate or fetch AI meeting content:', error);
      if (!isMountedRef.current) return;
      errorSourceRef.current = 'ai';
      const message = error.response?.data?.detail || error.response?.data?.message || error.message || 'AI processing failed. Please retry.';
      setStatus('error');
      setErrorMessage(message);
      window.alert(message);
    } finally {
      translationInFlightRef.current = false;
      if (isMountedRef.current) setIsGeneratingTranslation(false);
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

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
        await api.post(`/meeting-sessions/${meetingId}/status`, sessionPayload);
      }

      if (!onSaveSession && refreshSessions) await refreshSessions();
    } catch (err) {
      console.error("Failed to save running session status:", err);
    }
  };

  const onStartRecording = async (type) => {
    if (uploadedAudioUrl || hasSavedRecording(selectedMeetingData)) {
      setStatus('ready');
      setActionChosen(true);
      return;
    }
    setRecordingSeconds(0);
    retryActionRef.current = type;
    retryFileRef.current = null;
    if (type === 'quick_voice_note' || type === 'live_transcription') {
      let startupStage = 'microphone';
      audioChunksRef.current = [];
      recordedAudioBlobRef.current = null;
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
        setStatus('requesting_mic');
        setErrorMessage('');
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
          const error = new Error('Microphone access is not supported in this browser or requires a secure context (HTTPS/localhost).');
          console.error('3. mediaDevices API unavailable:', error);
          console.error('Microphone Access Error: ', error);
          shouldRestartSpeechRef.current = false;
          isRecordingRef.current = false;
          speechRecognitionRef.current?.stop();
          setStatus('error');
          errorSourceRef.current = 'mic';
          setErrorMessage(error.message);
          return;
        }
        if (window.isSecureContext === false && window.location.hostname !== 'localhost') {
          throw new Error('Microphone access requires HTTPS (or localhost).');
        }

        let stream;
        try {
          stream = await getUserMediaWithTimeout({ audio: true });
        } catch (error) {
          console.error('4. Catch block hit: ', error);
          console.error('Microphone Access Error: ', error);
          shouldRestartSpeechRef.current = false;
          isRecordingRef.current = false;
          speechRecognitionRef.current?.stop();
          setStatus('error');
          errorSourceRef.current = 'mic';
          setErrorMessage(error.message || error.name || 'Microphone access denied or unavailable.');
          return;
        }
        mediaStreamRef.current = stream;
        // Permission is resolved now; later recorder/upload setup must not look like a pending mic prompt.
        setStatus('initializing_recorder');
        startupStage = 'media_recorder';
        if (!window.MediaRecorder) throw new Error('Audio recording is not supported by this browser.');
        const formats = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
        const mimeType = formats.find((format) => MediaRecorder.isTypeSupported?.(format));
        let recorder;
        try {
          recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        } catch {
          // Some mobile browsers report MIME support but reject that type on construction.
          recorder = new MediaRecorder(stream);
        }

        mediaRecorderRef.current = recorder;
        recordedDurationMsRef.current = 0;
        recordingSegmentStartRef.current = null;
        setAudioDuration(0);
        setPlaybackTime(0);
        setAudioUrl(null);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        recorder.addEventListener('stop', () => {
          if (recordingSegmentStartRef.current !== null) {
            recordedDurationMsRef.current += Date.now() - recordingSegmentStartRef.current;
            recordingSegmentStartRef.current = null;
          }
          setAudioDuration(Math.ceil(recordedDurationMsRef.current / 1000));
          setIsRecording(false);
          setIsPaused(false);
          const contentType = recorder.mimeType || audioChunksRef.current[0]?.type || 'audio/webm';
          const finalBlob = new Blob(audioChunksRef.current, { type: contentType });
          recordedAudioBlobRef.current = finalBlob;
          setAudioPreview(finalBlob);
          stream.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
          mediaRecorderRef.current = null;
          setStatus('uploading');
          setIsUploading(true);
          uploadCompletionRef.current = (async () => {
            if (!finalBlob.size) throw new Error('The recording produced an empty audio file.');
            const extension = getAudioExtension(contentType);
            const uploader = await createMultipartUpload({
              meetingId: getMeetingId(rawMeeting),
              fileName: `meeting-${getMeetingId(rawMeeting)}.${extension}`,
              contentType,
              size: finalBlob.size,
            });
            uploader.append(finalBlob, setUploadProgress);
            const uploaded = await uploader.complete(setUploadProgress);
            audioChunksRef.current = [];
            setUploadedAudioUrl(uploaded.fileUrl);
            persistUploadedAudio(rawMeeting, uploaded.fileUrl);
            return uploaded;
          })().catch((error) => {
            console.error('Recording multipart upload failed:', error);
            errorSourceRef.current = 'recording_upload';
            setStatus('error');
            setErrorMessage(error.response?.data?.message || error.message || 'Audio upload failed. Retry the upload.');
            throw error;
          }).finally(() => {
            setIsUploading(false);
          });
          uploadCompletionRef.current.catch(() => {});
        }, { once: true });

        startupStage = 'recorder_start';
        recorder.start(1000);
        setIsRecording(true);
        setIsPaused(false);
        recordingSegmentStartRef.current = Date.now();
      } catch (err) {
        console.error('Microphone/recording initialization failed at stage:', startupStage, err);
        if (startupStage === 'microphone') console.error('Microphone Access Error: ', err);
        else console.error(`Audio startup failed during ${startupStage}:`, err);
        isRecordingRef.current = false;
        setIsRecording(false);
        setIsPaused(false);
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        shouldRestartSpeechRef.current = false;
        speechRecognitionRef.current?.stop();
        const message = startupStage === 'microphone'
          ? err?.name === 'TimeoutError'
            ? 'Microphone access timed out. Check the browser permission prompt and secure connection, then retry.'
            : err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
            ? 'Microphone permission was denied. Allow microphone access in your browser settings and try again.'
            : /HTTPS|secure/i.test(err?.message || '')
              ? 'Microphone access requires a secure HTTPS connection.'
              : err?.name === 'NotFoundError'
                ? 'No microphone was found. Connect a microphone and try again.'
                : `Unable to access the microphone${err?.message ? `: ${err.message}` : '. Check browser permissions and try again.'}`
          : startupStage === 'media_recorder'
            ? `The microphone opened, but audio recording could not be initialized${err?.message ? `: ${err.message}` : '.'}`
            : startupStage === 's3_upload'
              ? `The microphone is available, but an S3 upload session could not be created${err?.response?.data?.message ? `: ${err.response.data.message}` : err?.message ? `: ${err.message}` : '.'}`
              : `Audio recording could not start${err?.message ? `: ${err.message}` : '.'}`;
        setStatus('error');
        errorSourceRef.current = startupStage === 'microphone' ? 'mic' : startupStage === 's3_upload' ? 'upload_init' : 'recorder_start';
        setErrorMessage(message);
        return;
      }
    }

    setActionChosen(true);
    handleStart(type);
    saveRunningSession(rawMeeting); 
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadedAudioUrl || hasSavedRecording(selectedMeetingData)) {
      e.target.value = '';
      return;
    }
    if (!file.size || !file.type.startsWith('audio/')) {
      setStatus('error');
      errorSourceRef.current = 'file_upload';
      setErrorMessage('Choose a non-empty audio file to upload.');
      e.target.value = '';
      return;
    }
    retryFileRef.current = file;
    recordedAudioBlobRef.current = file;
    setActionChosen(true);
    setFileName(file.name);
    setStatus('uploading');
    setErrorMessage('');
    setTranslationComplete(false);
    setActionType('upload_file');
    try {
      const uploaded = await uploadFileToS3(file, { meetingId: getMeetingId(rawMeeting), onProgress: setUploadProgress });
      setUploadedAudioUrl(uploaded.fileUrl);
      persistUploadedAudio(rawMeeting, uploaded.fileUrl);
      await loadMeetingUpload(getMeetingId(rawMeeting));
      setStatus('ready');
      await saveRunningSession(rawMeeting);
    } catch (error) {
      console.error('Audio upload failed:', error);
      errorSourceRef.current = 'file_upload';
      setStatus('error');
      setErrorMessage(error.response?.data?.message || error.message || 'Upload failed. Retry the upload.');
    } finally {
      e.target.value = '';
    }
  };

  const onRetry = async () => {
    setErrorMessage('');
    if (errorSourceRef.current === 'ai') {
      await handleGenerateTranslation();
      return;
    }
    if (errorSourceRef.current === 'recording_upload') {
      setErrorMessage('The recording upload could not be resumed. Please record a new session and retry.');
      return;
    }
    if (uploadedAudioUrl || hasSavedRecording(selectedMeetingData)) {
      setStatus('ready');
      return;
    }
    if (retryFileRef.current) {
      setStatus('uploading');
      try {
        const uploaded = await uploadFileToS3(retryFileRef.current, { meetingId: getMeetingId(rawMeeting), onProgress: setUploadProgress });
        setUploadedAudioUrl(uploaded.fileUrl);
        persistUploadedAudio(rawMeeting, uploaded.fileUrl);
        await loadMeetingUpload(getMeetingId(rawMeeting));
        setStatus('ready');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || error.message || 'Upload failed. Retry the upload.');
      }
      return;
    }
    await onStartRecording(retryActionRef.current);
  };

  const onStopRecording = async () => {
    let uploadError = null;
    let completedUpload = null;
    setIsProcessing(true);
    try {
      setIsRecording(false);
      handleStop();
      shouldRestartSpeechRef.current = false;
      isRecordingRef.current = false;
      clearTimeout(speechRestartTimerRef.current);
      speechRecognitionRef.current?.stop();
      speechRecognitionRef.current = null;
      if (recordingSegmentStartRef.current !== null) {
        recordedDurationMsRef.current += Date.now() - recordingSegmentStartRef.current;
        recordingSegmentStartRef.current = null;
      }
      const elapsedSeconds = Math.floor(recordedDurationMsRef.current / 1000);
      setRecordingSeconds(elapsedSeconds);
      setAudioDuration(Math.ceil(recordedDurationMsRef.current / 1000));
      if (mediaRecorderRef.current?.state === 'recording' || mediaRecorderRef.current?.state === 'paused') {
        const recorderStopped = new Promise((resolve) => mediaRecorderRef.current.addEventListener('stop', resolve, { once: true }));
        mediaRecorderRef.current.stop();
        setStatus('uploading');
        await recorderStopped;
        try { completedUpload = await uploadCompletionRef.current; }
        catch (error) { uploadError = error; }
      }

      const target = meeting || rawMeeting;
      const currentMeetingId = Number.parseInt(getMeetingId(target), 10);
      if (!Number.isInteger(currentMeetingId)) {
        throw new Error(`Cannot save meeting record with invalid meeting ID: ${getMeetingId(target)}`);
      }

      await api.patch(`/meetings/${currentMeetingId}`, { status: 'stopped' });
      setIsPaused(false);
      const savedInParent = await saveStoppedSession(target, elapsedSeconds);
      setGeneratedContent({
        englishSummary: '',
        myanmarSummary: '',
        keyDecisions: [],
        actionItems: [],
      });
      const loadedUpload = await loadMeetingUpload(currentMeetingId);
      const upload = applyProcessingResult({ ...(completedUpload || {}), ...(loadedUpload || {}) });

      setStatus(uploadError ? 'error' : 'ready');
      setErrorMessage(uploadError ? uploadError.response?.data?.message || uploadError.message || 'Audio upload failed.' : '');
      if (!savedInParent) {
        window.dispatchEvent(new CustomEvent('sync-meeting-sessions', {
          detail: { meeting_id: currentMeetingId, id: currentMeetingId, status: 'stopped' },
        }));
      }
      const completedMeeting = {
        ...target,
        status: 'stopped',
        recording_completed: true,
        recording_uploaded: Boolean(upload?.audio_url || uploadedAudioUrl),
        audio_url: upload?.audio_url || uploadedAudioUrl || '',
        transcript: upload?.transcript || liveTranscript || '',
        summary: upload?.summary || '',
        ai_summary_en: upload?.summary || upload?.ai_summary_en || '',
        ai_summary_my: upload?.ai_summary_my || '',
        decisions: upload?.decisions || [],
        action_items: upload?.action_items || [],
        duration_seconds: elapsedSeconds,
      };
      localStorage.setItem('active_live_meeting', JSON.stringify(completedMeeting));
      setSelectedMeetingData(completedMeeting);

      if (!savedInParent && refreshSessions) await refreshSessions();
    } catch (err) {
      console.error('Failed to save recording or stop meeting:', err);
      errorSourceRef.current = 'recording_upload';
      setStatus('error');
      setErrorMessage(err.response?.data?.message || err.message || 'Audio was uploaded, but the meeting record could not be saved.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onPauseRecording = async () => {
    shouldRestartSpeechRef.current = false;
    isRecordingRef.current = false;
    speechRecognitionRef.current?.stop();
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === 'recording' && isRecording && !isPaused) {
      if (recordingSegmentStartRef.current !== null) {
        recordedDurationMsRef.current += Date.now() - recordingSegmentStartRef.current;
        recordingSegmentStartRef.current = null;
      }
      setAudioDuration(Math.ceil(recordedDurationMsRef.current / 1000));
      const dataFlushed = new Promise((resolve) => {
        recorder.addEventListener('dataavailable', resolve, { once: true });
      });
      recorder.requestData();
      recorder.pause();
      setIsRecording(false);
      setIsPaused(true);
      await dataFlushed;
      const contentType = recorder.mimeType || audioChunksRef.current[0]?.type || 'audio/webm';
      setAudioPreview(new Blob(audioChunksRef.current, { type: contentType }));
    }
    handlePause();
  };

  const onResumeRecording = () => {
    isRecordingRef.current = true;
    if (mediaRecorderRef.current?.state === 'paused' && isPaused) {
      mediaRecorderRef.current.resume();
      setIsRecording(true);
      setIsPaused(false);
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

  const isMeetingStopped = hasSavedRecording(selectedMeetingData) || isStoppedSession(meeting);
  const displayStatus = isMeetingStopped && status === 'idle' ? 'ready' : status;
  const displayTimer = recordingSeconds;

  return (
    <div className="relative flex w-full min-w-0 min-h-screen flex-col gap-6 max-md:gap-4 mx-auto py-4 px-2 sm:px-4 max-md:w-auto max-md:-mx-8 max-md:-mt-8 max-md:px-3 max-md:pt-4 max-md:pb-24">

      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        hidden
        onError={(event) => console.error('[audio] player source error:', event.currentTarget.error, event.currentTarget.currentSrc)}
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
        formatTime={formatRecordingTime}
        handleStop={onStopRecording}
        handlePause={onPauseRecording}
        handleResume={onResumeRecording}
        uploadProgress={uploadProgress}
        errorMessage={errorMessage}
        onRetry={onRetry}
        activityMessage={speechActivity}
        isUploading={isUploading}
      />

      <div className="grid w-full min-w-0 grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 max-md:gap-4 mt-2 items-start">
        <LeftPanel 
          status={displayStatus}
          timer={displayTimer} 
          formatTime={formatRecordingTime}
          handlePause={onPauseRecording} 
          handleResume={onResumeRecording} 
          audioUrl={audioUrl}
          onDownloadAudio={onDownloadAudio}
          isAudioPlaying={isAudioPlaying}
          playbackTime={playbackTime}
          audioDuration={audioDuration}
          onPlaybackToggle={onPlaybackToggle}
          onGenerateTranslation={handleGenerateTranslation}
          isGeneratingTranslation={isGeneratingTranslation}
          summary={meeting.summary}
          translationComplete={translationComplete}
        />
        <RightPanel 
          status={displayStatus} 
          actionType={actionType}
          liveTranscript={liveTranscript}
          speechActivity={speechActivity}
          isProcessing={isProcessing}
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

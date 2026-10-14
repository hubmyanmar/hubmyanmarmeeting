import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const RecordingContext = createContext(null);

export const RecordingProvider = ({ children }) => {
  const [status, setStatus] = useState('idle');
  const [actionType, setActionType] = useState('');
  const [timer, setTimer] = useState(0);
  const [fileName, setFileName] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const statusRef = useRef(status);
  statusRef.current = status;
  const startedAtRef = useRef(0);
  const elapsedBeforeStartRef = useRef(0);
  const tickRef = useRef(null);

  useEffect(() => {
    if (status !== 'recording') return undefined;
    const tick = () => setTimer(elapsedBeforeStartRef.current + (Date.now() - startedAtRef.current) / 1000);
    tick();
    tickRef.current = window.setInterval(tick, 250);
    return () => window.clearInterval(tickRef.current);
  }, [status]);

  const start = (type) => {
    setActionType(type);
    setStatus('recording');
    setTimer(0);
    elapsedBeforeStartRef.current = 0;
    startedAtRef.current = Date.now();
    setLiveTranscript('');
    setUploadProgress(0);
  };
  const pause = () => {
    if (statusRef.current !== 'recording') return;
    elapsedBeforeStartRef.current += Date.now() - startedAtRef.current;
    startedAtRef.current = 0;
    setTimer(elapsedBeforeStartRef.current / 1000);
    setStatus('paused');
  };
  const resume = () => {
    if (statusRef.current !== 'paused') return;
    startedAtRef.current = Date.now();
    setStatus('recording');
  };
  const stop = () => {
    if (startedAtRef.current) elapsedBeforeStartRef.current += Date.now() - startedAtRef.current;
    startedAtRef.current = 0;
    setTimer(elapsedBeforeStartRef.current / 1000);
    setStatus('ready');
  };
  const reset = () => {
    setStatus('idle'); setActionType(''); setTimer(0); setFileName(''); setLiveTranscript(''); setUploadProgress(0); setAudioUrl('');
    elapsedBeforeStartRef.current = 0;
  };
  const formatTime = (seconds) => {
    const safe = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
  };

  const value = useMemo(() => ({
    status, actionType, timer, fileName, liveTranscript, uploadProgress, audioUrl,
    setStatus, setActionType, setFileName, setUploadProgress, setAudioUrl,
    handleStart: start, handlePause: pause, handleResume: resume, handleStop: stop, resetRecording: reset,
    handleTranscript: (text) => setLiveTranscript(text || ''), formatTime,
  }), [status, actionType, timer, fileName, liveTranscript, uploadProgress, audioUrl]);
  return <RecordingContext.Provider value={value}>{children}</RecordingContext.Provider>;
};

export const useRecording = () => {
  const context = useContext(RecordingContext);
  if (!context) throw new Error('useRecording must be used within RecordingProvider');
  return context;
};

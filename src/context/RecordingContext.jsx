import React, { createContext, useState, useEffect, useContext } from 'react';

const isTerminalStatus = (value) => ['stopped', 'done', 'completed', 'finished', 'ended', 'closed'].includes(String(value || '').trim().toLowerCase());

const RecordingContext = createContext();

export const RecordingProvider = ({ children }) => {
  const [actionType, setActionType] = useState(""); 
  const [status, setStatus] = useState("idle");
  const [timer, setTimer] = useState(0);
  const [fileName, setFileName] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");

  const resetRecording = () => {
    setStatus("idle");
    setActionType("");
    setTimer(0);
    setFileName("");
    setLiveTranscript("");
  };

  const handleStart = (type) => {
    setActionType(type);
    setStatus("active"); 
    setTimer(0);
    setLiveTranscript("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setActionType("upload_file");
      setStatus("processing");
      setTimeout(() => setStatus("done"), 4000); 
    }
  };

  const handlePause = () => {
    if (status === "active") setStatus("paused");
  };

  const handleResume = () => {
    if (status === "paused") setStatus("active");
  };

  const handleStop = () => {
    setStatus("stopped");
  };

  const handleTranscript = (text) => {
    setLiveTranscript((previous) => {
      const nextText = text || "";
      return previous === nextText ? previous : nextText;
    });
  };
  
  useEffect(() => {
    let interval;
    if (status === "active") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 700); 
    }
    return () => clearInterval(interval);
  }, [status, actionType]);

  useEffect(() => {
    if (status === 'stopped') {
      setTimer((prev) => prev);
    }
  }, [status]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <RecordingContext.Provider value={{
      status: isTerminalStatus(status) ? 'stopped' : status,
      actionType,
      timer,
      fileName,
      liveTranscript,
      handleStart,
      handleFileUpload,
      handlePause,
      handleResume,
      handleStop,
      handleTranscript,
      formatTime,
      resetRecording
    }}>
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => useContext(RecordingContext);

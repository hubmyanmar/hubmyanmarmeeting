import React, { createContext, useState, useEffect, useContext } from 'react';

const LIVE_TEXT = "Welcome everyone to the BD Strategy Discussion. Today we need to align on the partnership with ABC Company. We are proposing a Q2 sales target of MMK 2.5 Billion. Also, we need to schedule the new marketing campaign for 1 June 2025, and prepare the product demo by 15 June. Let's get started.";
const WORDS = LIVE_TEXT.split(" ");

const RecordingContext = createContext();

export const RecordingProvider = ({ children }) => {
  const [actionType, setActionType] = useState(""); 
  const [status, setStatus] = useState("idle"); // idle, active, paused, processing, done
  const [timer, setTimer] = useState(0);
  const [fileName, setFileName] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");

  // 🔥 အသစ်ထည့်ထားသော Function (Meeting အသစ် Join တိုင်း Data အဟောင်းတွေ ရှင်းထုတ်ရန်)
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
    setStatus("processing");
    setTimeout(() => setStatus("done"), 3000); 
  };
  
  useEffect(() => {
    let interval;
    if (status === "active") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
        
        if (actionType === "live_transcription") {
          setLiveTranscript((prev) => {
            const currentWords = prev.split(" ").filter(w => w !== "");
            if (currentWords.length < WORDS.length) {
              return prev + (prev ? " " : "") + WORDS[currentWords.length];
            }
            return prev;
          });
        }
      }, 700); 
    }
    return () => clearInterval(interval);
  }, [status, actionType]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <RecordingContext.Provider value={{
      status,
      actionType,
      timer,
      fileName,
      liveTranscript,
      handleStart,
      handleFileUpload,
      handlePause,
      handleResume,
      handleStop,
      formatTime,
      resetRecording // 🔥 အောက်ကို လှမ်းပို့ပေးလိုက်ပါပြီ
    }}>
      {children}
    </RecordingContext.Provider>
  );
};

// အလွယ်တကူလှမ်းခေါ်သုံးရန် Hook
export const useRecording = () => useContext(RecordingContext);
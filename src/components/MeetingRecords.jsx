import React, { useState, useEffect, useRef } from 'react';
import ActionModal from './Records/ActionModal';
import LeftPanel from './Records/LeftPanel';
import MeetingHeader from './Records/MeetingHeader';
import RightPanel from './Records/RightPanel';
import StatusBanner from './Records/StatusBanner';

const LIVE_TEXT = "Welcome everyone to the BD Strategy Discussion. Today we need to align on the partnership with ABC Company. We are proposing a Q2 sales target of MMK 2.5 Billion. Also, we need to schedule the new marketing campaign for 1 June 2025, and prepare the product demo by 15 June. Let's get started.";
const WORDS = LIVE_TEXT.split(" ");

export default function MeetingRecords() {
  const [showModal, setShowModal] = useState(true);
  const [actionType, setActionType] = useState(""); 
  const [status, setStatus] = useState("idle"); 
  const [timer, setTimer] = useState(0);
  const [fileName, setFileName] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  
  const fileInputRef = useRef(null);

  const handleStart = (type) => {
    setActionType(type);
    setShowModal(false);
    setStatus("active");
    setTimer(0);
    setLiveTranscript("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setActionType("upload_file");
      setShowModal(false);
      setStatus("processing");
      setTimeout(() => setStatus("done"), 4000); 
    }
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
    <div className="relative flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10">
      <ActionModal 
        showModal={showModal} 
        handleStart={handleStart} 
        fileInputRef={fileInputRef} 
        handleFileUpload={handleFileUpload} 
      />

      <MeetingHeader />

      <StatusBanner 
        status={status} 
        actionType={actionType} 
        timer={timer} 
        fileName={fileName} 
        formatTime={formatTime} 
        handleStop={handleStop} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 mt-2 items-start">
        <LeftPanel 
          status={status} 
          timer={timer} 
          formatTime={formatTime} 
        />
        
        <RightPanel 
          status={status} 
          actionType={actionType} 
          liveTranscript={liveTranscript} 
        />
      </div>
    </div>
  );
}
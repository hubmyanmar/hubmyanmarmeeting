import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ActionModal from './Records/ActionModal';
import LeftPanel from './Records/LeftPanel';
import MeetingHeader from './Records/MeetingHeader';
import RightPanel from './Records/RightPanel';
import StatusBanner from './Records/StatusBanner';
import ActionItem from './ActionItem';

const LIVE_TEXT = "Welcome everyone to the BD Strategy Discussion. Today we need to align on the partnership with ABC Company. We are proposing a Q2 sales target of MMK 2.5 Billion. Also, we need to schedule the new marketing campaign for 1 June 2025, and prepare the product demo by 15 June. Let's get started.";
const WORDS = LIVE_TEXT.split(" ");

export default function MeetingRecords({ selectedMeetingData }) {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(true);
  const [actionType, setActionType] = useState(""); 
  // status states: "idle", "active", "paused", "processing", "done"
  const [status, setStatus] = useState("idle"); 
  const [timer, setTimer] = useState(0);
  const [fileName, setFileName] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentView, setCurrentView] = useState("record");

  const fileInputRef = useRef(null);
  
  const handleGoHome = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    if (selectedMeetingData) {
      if (selectedMeetingData.mode === 'join') {
        setCurrentView("record");
        setShowModal(true);
        setStatus("idle"); 
        setTimer(0);
        setLiveTranscript("");
      } else if (selectedMeetingData.mode === 'view') {
        setCurrentView("action_item");
        setShowModal(false);
      }
    }
  }, [selectedMeetingData]);

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

  const handlePause = () => {
    if (status === "active") {
      setStatus("paused");
    }
  };

  const handleResume = () => {
    if (status === "paused") {
      setStatus("active");
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

  if (currentView === "action_item") {
    return (
      <div className="max-w-[1400px] mx-auto w-full pb-10 relative">
        <MeetingHeader title={selectedMeetingData?.meeting?.title} />
        <div className="mt-4">
          <ActionItem meetingData={selectedMeetingData?.meeting} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10">
      {/* Top Right Cancel Button */}
      {showModal && (
        <button 
          onClick={handleGoHome}
          className="absolute top-0 right-0 z-50 p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
          title="Cancel and Go to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Modal with Cancel Action */}
      <ActionModal 
        showModal={showModal} 
        handleStart={handleStart} 
        fileInputRef={fileInputRef} 
        handleFileUpload={handleFileUpload}
        onClose={handleGoHome} 
      />

      <MeetingHeader title={selectedMeetingData?.meeting?.title} />

      <StatusBanner 
        status={status} 
        actionType={actionType} 
        timer={timer} 
        fileName={fileName} 
        formatTime={formatTime} 
        handleStop={handleStop}
        handlePause={handlePause}
        handleResume={handleResume}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 mt-2 items-start">
        <LeftPanel 
          status={status} 
          timer={timer} 
          formatTime={formatTime} 
          handlePause={handlePause}
          handleResume={handleResume}
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
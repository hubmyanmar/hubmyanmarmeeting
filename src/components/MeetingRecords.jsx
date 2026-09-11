import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ActionModal from './Records/ActionModal';
import LeftPanel from './Records/LeftPanel';
import MeetingHeader from './Records/MeetingHeader';
import RightPanel from './Records/RightPanel';
import StatusBanner from './Records/StatusBanner';
import ActionItem from './ActionItem';
import { useRecording } from '../context/RecordingContext'; 

export default function MeetingRecords({ selectedMeetingData: propMeetingData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [selectedMeetingData, setSelectedMeetingData] = useState(() => {
    const passedData = propMeetingData || location.state;
    if (passedData) {
      sessionStorage.setItem('activeMeetingData', JSON.stringify(passedData));
      return passedData;
    }
    const savedData = sessionStorage.getItem('activeMeetingData');
    return savedData ? JSON.parse(savedData) : null;
  });

  const [currentView, setCurrentView] = useState("record");

  useEffect(() => {
    const passedData = propMeetingData || location.state;
    if (passedData) {
      setSelectedMeetingData(passedData);
      sessionStorage.setItem('activeMeetingData', JSON.stringify(passedData));
      setCurrentView("record");
    }
  }, [propMeetingData, location.state]);

  const rawMeeting = selectedMeetingData?.meeting || selectedMeetingData || {};
  const savedSessions = JSON.parse(localStorage.getItem('meetingSessions') || '{}');
  const storedSession = savedSessions[rawMeeting.id] || {};

  // Testing အတွက် Summary အတု ထည့်ထားခြင်း (ပေါ် မပေါ် စစ်ရန်)
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
      },
      {
        task: "Update budget",
        owner: "Su Su",
        dueDate: "2026-09-13",
        status: "In Progress",
        priority: "Low"
      }
    ],
  };

  const meeting = { ...rawMeeting, ...mockSummary, ...storedSession };

  const { 
    status, actionType, timer, fileName, liveTranscript, 
    handleStart, handleFileUpload, handlePause, handleResume, handleStop, formatTime 
  } = useRecording();

  const [showModal, setShowModal] = useState(status === "idle"); 

  const handleGoHome = () => navigate('/dashboard');

  useEffect(() => {
    if (status !== "idle") {
      setShowModal(false);
    } else {
      setShowModal(true);
    }
    
    if (selectedMeetingData) {
      if (selectedMeetingData.mode === 'join') {
        const meetingStartTime = new Date(meeting?.startTime || meeting?.time);
        const currentTime = new Date();
        const diffInMinutes = (currentTime - meetingStartTime) / (1000 * 60);

        if (diffInMinutes > 15) {
          setCurrentView("action_item");
          setShowModal(false);
        } else {
          if (currentView !== "action_item") {
            setCurrentView("record");
          }
        }

      } else if (selectedMeetingData.mode === 'view') {
        setCurrentView("action_item");
        setShowModal(false);
      }
    }
  }, [selectedMeetingData?.mode, meeting?.startTime, meeting?.time]);

  const onStartRecording = (type) => {
    setShowModal(false);
    handleStart(type);
  };

  const onUpload = (e) => {
    setShowModal(false);
    handleFileUpload(e);
  };

  const onStopRecording = () => {
    const savedSessions = JSON.parse(localStorage.getItem('meetingSessions') || '{}');
    const meetingId = meeting.id || `meeting-${Date.now()}`;
    
    // 💡 Stop လုပ်လိုက်ချိန်တွင် Action Items များနှင့်တကွ Session အား localStorage သို့ သိမ်းဆည်းခြင်း
    const completedSession = {
      ...meeting,
      id: meetingId,
      title: meeting.title || "Untitled Meeting",
      date: meeting.date || new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
      status: 'stopped',
      stoppedAt: new Date().toISOString(),
      actionItems: meeting.actionItems || [],
      keyDecisions: meeting.keyDecisions || []
    };

    if (Array.isArray(savedSessions)) {
      const existingIndex = savedSessions.findIndex(s => s.id === meetingId);
      if (existingIndex >= 0) {
        savedSessions[existingIndex] = completedSession;
      } else {
        savedSessions.push(completedSession);
      }
      localStorage.setItem('meetingSessions', JSON.stringify(savedSessions));
    } else {
      savedSessions[meetingId] = completedSession;
      localStorage.setItem('meetingSessions', JSON.stringify(savedSessions));
    }

    window.dispatchEvent(new Event('sync-meeting-sessions'));
    
    if (handleStop) {
      handleStop();
    }
  };

  if (currentView === "action_item") {
    return (
      <div className="max-w-[1400px] mx-auto w-full pb-10 relative">
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
        />
        <div className="mt-4">
          <ActionItem meetingData={meeting} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10">
      {showModal && (
        <button 
          onClick={handleGoHome}
          className="absolute top-0 right-0 z-50 p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <ActionModal 
        showModal={showModal} 
        handleStart={onStartRecording} 
        fileInputRef={fileInputRef} 
        handleFileUpload={onUpload}
        onClose={handleGoHome} 
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
        status={status} 
        actionType={actionType} 
        timer={timer} 
        fileName={fileName} 
        formatTime={formatTime} 
        handleStop={onStopRecording}
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
          englishSummary={meeting.englishSummary}
          myanmarSummary={meeting.myanmarSummary}
        />
        <RightPanel 
          status={status} 
          actionType={actionType}
          liveTranscript={liveTranscript}
          keyDecisions={meeting.keyDecisions}
          actionItems={meeting.actionItems}
        />
      </div>
    </div>
  );
}
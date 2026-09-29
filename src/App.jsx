import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthCard from './Auth/AuthCard'; 
import Dashboard from './Dashboard'; 
import DashboardHome from './components/DashboardHome';
import MyMeetings from './components/MyMeetings';
import BookMeeting from './components/BookMeeting';
import MeetingRooms from './components/MeetingRooms';
import MeetingRecords from './components/MeetingRecords';
import ActionItem from './components/ActionItem';
import Calendar from './components/Calendar';
import Reports from './components/Reports';
import Settings from './components/Settings';
import LiveMeeting from './pages/LiveMeeting';
import { RecordingProvider } from './context/RecordingContext';
import { normalizeMeetingStatus } from './utils/meetingSessionState';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://192.168.57.191:8000/api/v1';

export default function App() {
  const [bookedMeetings, setBookedMeetings] = useState([]);
  const [meetingRooms, setMeetingRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [meetingSessions, setMeetingSessions] = useState({});
  
  // 1. Meetings Fetch
  useEffect(() => {
    const fetchMeetingsFromDB = async () => {
      try {
        const meetingsRes = await fetch(`${API_BASE_URL}/meetings`); 
        if (meetingsRes.ok) {
          const dbData = await meetingsRes.json();
          setBookedMeetings(Array.isArray(dbData) ? dbData : []);
        }
      } catch (error) {
        console.error("Error fetching meetings from Database:", error);
      }
    };

    fetchMeetingsFromDB();
  }, []);

  const fetchSessionsFromDB = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/meeting-sessions`);
      if (res.ok) {
        const sessionsData = await res.json();
        const normalizedMap = {};

        if (Array.isArray(sessionsData)) {
          sessionsData.forEach((session, index) => {
            const key = String(session?.meeting_id || session?.id || session?.meetingId || index);
            normalizedMap[key] = {
              ...session,
              meeting_id: session?.meeting_id || key,
              id: session?.id || key,
              meetingId: session?.meetingId || key,
            };
          });
        } else if (sessionsData && typeof sessionsData === 'object') {
          Object.entries(sessionsData).forEach(([key, session]) => {
            const safeSession = session && typeof session === 'object' ? session : { status: session };
            normalizedMap[String(key)] = {
              ...safeSession,
              meeting_id: safeSession.meeting_id || key,
              id: safeSession.id || key,
              meetingId: safeSession.meetingId || key,
            };
          });
        }

        setMeetingSessions(normalizedMap);
      }
    } catch (error) {
      console.error("Error fetching meeting sessions from Database:", error);
    }
  };

  useEffect(() => {
    fetchSessionsFromDB();

    const handleSessionSync = () => {
      fetchSessionsFromDB();
    };

    window.addEventListener('sync-meeting-sessions', handleSessionSync);

    return () => {
      window.removeEventListener('sync-meeting-sessions', handleSessionSync);
    };
  }, []);
  const saveMeetingSession = async (meetingId, sessionData) => {
    try {
      const targetId = sessionData?.meeting_id || sessionData?.id || meetingId;
      const normalizedStatus = normalizeMeetingStatus(
        sessionData?.status || (sessionData?.stopped_at || sessionData?.ended_at || sessionData?.actual_ended_at ? 'stopped' : null),
        sessionData
      );

      const finalStoppedAt = sessionData?.stopped_at || sessionData?.actual_ended_at || sessionData?.ended_at || new Date().toISOString();
      const normalizedSession = {
        ...sessionData,
        meeting_id: targetId,
        id: targetId,
        status: normalizedStatus || 'running',
        updated_at: sessionData?.updated_at || finalStoppedAt,
        ...(normalizedStatus === 'stopped' ? {
          stopped_at: finalStoppedAt,
          actual_ended_at: sessionData?.actual_ended_at || finalStoppedAt,
          actual_duration: sessionData?.actual_duration ?? 0,
        } : {
          actual_ended_at: null,
        })
      };

      setMeetingSessions((prev) => ({
        ...prev,
        [targetId]: {
          ...(prev[targetId] || {}),
          ...normalizedSession,
          status: normalizedStatus || 'running',
          meeting_id: targetId,
          id: targetId,
        }
      }));
      
      const res = await fetch(`${API_BASE_URL}/meeting-sessions/${targetId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedSession)
      });

      if (res.ok) {
        await fetchSessionsFromDB();
      } else {
        console.error("Failed to update meeting session status, status code:", res.status);
      }
    } catch (error) {
      console.error("Error saving meeting session to Database:", error);
    }
  };
  // 4. Meeting Rooms Fetch
  useEffect(() => {
    const fetchRoomsFromDB = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/meeting-rooms`);
        if (res.ok) {
          const roomsData = await res.json();
          setMeetingRooms(Array.isArray(roomsData) ? roomsData : []);
        }
      } catch (error) {
        console.error("Error fetching meeting rooms from Database:", error);
      }
    };

    fetchRoomsFromDB();
  }, []);

  // 5. User Fetch
  useEffect(() => {
    const fetchUserFromDB = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users`);
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user from Database:', error);
      }
    };
    if (!currentUser) {
      fetchUserFromDB();
    }
  }, [currentUser]);
  
  const handleBookMeeting = async (newMeeting) => {
    setBookedMeetings((prev) => [...prev, newMeeting]);
  };

  return (
    <RecordingProvider>
      <Routes>
        <Route path="/" element={<AuthCard setCurrentUser={setCurrentUser} />} />
        <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />}>
          <Route 
            index 
            element={
              <DashboardHome 
                bookedMeetings={bookedMeetings}
                meetingRooms={meetingRooms} 
                currentUser={currentUser} 
                meetingSessions={meetingSessions} 
                refetchSessions={fetchSessionsFromDB}
                onSaveSession={saveMeetingSession}
              />
            } 
          />
          <Route path="my-meetings" element={<MyMeetings bookedMeetings={bookedMeetings} />} />
          <Route 
            path="book-meeting" 
            element={<BookMeeting onBook={handleBookMeeting} bookedMeetings={bookedMeetings} currentUser={currentUser} />} 
          />
          <Route path="book" element={<Navigate to="/dashboard/book-meeting" replace />} />
          <Route 
            path="meeting-rooms" 
            element={<MeetingRooms bookedMeetings={bookedMeetings} meetingRooms={meetingRooms} currentUser={currentUser} />} 
          />
          
          <Route path="meeting-records" element={<MeetingRecords />} />
          <Route path="action-items" element={<ActionItem />} />
          <Route path="calendar" element={<Calendar bookedMeetings={bookedMeetings} />} />
          
          <Route path="reports" element={<Reports bookedMeetings={bookedMeetings} meetingSessions={meetingSessions} />} />
          
          <Route path="settings" element={<Settings />} />
          <Route 
            path="live-meeting" 
            element={
              <LiveMeeting 
                currentUser={currentUser}
                refreshSessions={fetchSessionsFromDB} 
                onSaveSession={saveMeetingSession}
              />
            } 
          />
        </Route>
      </Routes>
    </RecordingProvider>
  );
}
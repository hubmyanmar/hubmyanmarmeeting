import React, { useState, useEffect, useRef } from 'react';
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
import OverdueActionsPage from './pages/OverdueActionsPage';
import { RecordingProvider } from './context/RecordingContext';
import { normalizeMeetingStatus } from './utils/meetingSessionState';
import api from './api';

const decodeTokenPayload = (token) => {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payloadJson = decodeURIComponent(
      Array.from(atob(padded), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
    );
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
};

export default function App() {
  const [bookedMeetings, setBookedMeetings] = useState([]);
  const [meetingRooms, setMeetingRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userResolved, setUserResolved] = useState(false);
  const [meetingSessions, setMeetingSessions] = useState({});
  const staleUserCleanupDone = useRef(false);

  const resolveCurrentUser = async () => {
    setUserResolved(false);
    const token = localStorage.getItem('access_token');
    const tokenPayload = decodeTokenPayload(token);
    const tokenUserId = tokenPayload?.sub;

    if (tokenUserId === undefined || tokenUserId === null || tokenUserId === '') {
      console.error('Unable to resolve current user: access token has no sub claim.');
      setCurrentUser(null);
      setUserResolved(true);
      return;
    }

    const profileClaims = ['name', 'fullName', 'email', 'position', 'role', 'image'];
    const hasProfileClaims = profileClaims.some((claim) => tokenPayload[claim] !== undefined && tokenPayload[claim] !== null);
    const tokenUser = {
      id: tokenUserId,
      ...Object.fromEntries(profileClaims
        .filter((claim) => tokenPayload[claim] !== undefined && tokenPayload[claim] !== null)
        .map((claim) => [claim, tokenPayload[claim]])),
    };
    setCurrentUser(tokenUser);

    if (hasProfileClaims) {
      setUserResolved(true);
      return;
    }

    try {
      const { data: users } = await api.get('/users');
      const userList = Array.isArray(users) ? users : [users];
      const matchedUser = userList.find((candidate) => candidate?.id !== undefined && String(candidate.id) === String(tokenUserId));

      if (!matchedUser) {
        console.error('Unable to resolve current user: no /users entry matches the token sub claim.');
        setCurrentUser(null);
        setUserResolved(true);
        return;
      }

      setCurrentUser(matchedUser);
    } catch (error) {
      console.error('Error resolving current user from /users:', error);
      setCurrentUser(null);
    }
    setUserResolved(true);
  };

  useEffect(() => {
    if (staleUserCleanupDone.current) return;
    staleUserCleanupDone.current = true;
    if (localStorage.getItem('currentUser')) localStorage.removeItem('currentUser');
    if (localStorage.getItem('authUser')) localStorage.removeItem('authUser');
    if (localStorage.getItem('access_token')) resolveCurrentUser();
    else setUserResolved(true);
  }, []);
  
  // 1. Meetings Fetch
  useEffect(() => {
    const fetchMeetingsFromDB = async () => {
      try {
        const { data: dbData } = await api.get('/meetings');
        setBookedMeetings(Array.isArray(dbData) ? dbData : []);
      } catch (error) {
        console.error("Error fetching meetings from Database:", error);
      }
    };

    fetchMeetingsFromDB();
  }, []);

  const fetchSessionsFromDB = async () => {
    try {
      const { data: sessionsData } = await api.get('/meeting-sessions');
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
      
      await api.post(`/meeting-sessions/${targetId}/status`, normalizedSession);
      await fetchSessionsFromDB();
    } catch (error) {
      console.error("Error saving meeting session to Database:", error);
    }
  };

  // 4. Meeting Rooms Fetch
  useEffect(() => {
    const fetchRoomsFromDB = async () => {
      try {
        const { data: roomsData } = await api.get('/meeting-rooms');
        setMeetingRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch (error) {
        console.error("Error fetching meeting rooms from Database:", error);
      }
    };

    fetchRoomsFromDB();
  }, []);

  const handleLoginResolved = () => {
    resolveCurrentUser();
  };

  const handleBookMeeting = async (newMeeting) => {
    setBookedMeetings((prev) => [...prev, newMeeting]);
  };

  return (
    <RecordingProvider>
      <Routes>
        <Route path="/" element={<AuthCard setCurrentUser={handleLoginResolved} />} />
        <Route path="/dashboard" element={<Dashboard currentUser={currentUser} userResolved={userResolved} />}>
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
          <Route 
            path="my-meetings" 
            element={<MyMeetings bookedMeetings={bookedMeetings} currentUser={currentUser} />} 
          />
          <Route 
            path="book-meeting" 
            element={<BookMeeting onBook={handleBookMeeting} bookedMeetings={bookedMeetings} currentUser={currentUser} />} 
          />
          <Route path="book" element={<Navigate to="/dashboard/book-meeting" replace />} />
          <Route 
            path="meeting-rooms" 
            element={<MeetingRooms bookedMeetings={bookedMeetings} meetingRooms={meetingRooms} currentUser={currentUser} />} 
          />
          
          <Route 
            path="meeting-records" 
            element={<MeetingRecords currentUser={currentUser} />} 
          />
          <Route 
            path="action-items" 
            element={<ActionItem currentUser={currentUser} />} 
          />
          <Route 
            path="calendar" 
            element={<Calendar bookedMeetings={bookedMeetings} currentUser={currentUser} />} 
          />
          
          <Route 
            path="reports" 
            element={<Reports bookedMeetings={bookedMeetings} meetingSessions={meetingSessions} currentUser={currentUser} />} 
          />
          <Route
            path="overdue-actions"
            element={<OverdueActionsPage bookedMeetings={bookedMeetings} meetingSessions={meetingSessions} />}
          />
          
          <Route 
            path="settings" 
            element={<Settings currentUser={currentUser} />} 
          />
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

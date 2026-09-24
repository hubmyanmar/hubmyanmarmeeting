import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; 
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

import { RecordingProvider } from './context/RecordingContext';

export default function App() {

  const [bookedMeetings, setBookedMeetings] = useState([]);
  const [meetingRooms, setMeetingRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [meetingSessions, setMeetingSessions] = useState({});
  
  // 1. Meetings
  useEffect(() => {
    const fetchMeetingsFromDB = async () => {
      try {
        const meetingsRes = await fetch('http://127.0.0.1:8000/api/v1/meetings'); 
        
        if (meetingsRes.ok) {
          const dbData = await meetingsRes.json();
          setBookedMeetings(Array.isArray(dbData) ? dbData : []);
        } else {
          console.error("Failed to fetch meetings. Status:", meetingsRes.status);
        }
      } catch (error) {
        console.error("Error fetching meetings from Database:", error);
      }
    };

    fetchMeetingsFromDB();
  }, []);
  useEffect(() => {
    const fetchSessionsFromDB = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/meeting-sessions');
        if (res.ok) {
          const sessionsData = await res.json();
          setMeetingSessions(sessionsData || {});
        } else {
          console.error("Failed to fetch meeting sessions. Status:", res.status);
        }
      } catch (error) {
        console.error("Error fetching meeting sessions from Database:", error);
      }
    };

    fetchSessionsFromDB();
  }, []);

  // 3. Meeting Rooms
  useEffect(() => {
    const fetchRoomsFromDB = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/meeting-rooms');
        if (res.ok) {
          const roomsData = await res.json();
          setMeetingRooms(Array.isArray(roomsData) ? roomsData : []);
        } else {
          console.error("Failed to fetch meeting rooms. Status:", res.status);
        }
      } catch (error) {
        console.error("Error fetching meeting rooms from Database:", error);
      }
    };

    fetchRoomsFromDB();
  }, []);

  // 4. User
  useEffect(() => {
    const fetchUserFromDB = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/users');
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        } else {
          console.error("Failed to fetch user. Status:", res.status);
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
                currentUser={currentUser} 
                meetingSessions={meetingSessions} 
              />
            } 
          />
          <Route path="my-meetings" element={<MyMeetings bookedMeetings={bookedMeetings} />} />
          <Route 
            path="book-meeting" 
            element={<BookMeeting onBook={handleBookMeeting} bookedMeetings={bookedMeetings} currentUser={currentUser} />} 
          />
          <Route 
            path="meeting-rooms" 
            element={<MeetingRooms bookedMeetings={bookedMeetings} meetingRooms={meetingRooms} currentUser={currentUser} />} 
          />
          
          <Route path="meeting-records" element={<MeetingRecords />} />
          <Route path="action-items" element={<ActionItem />} />
          <Route path="calendar" element={<Calendar bookedMeetings={bookedMeetings} />} />
          
          <Route path="reports" element={<Reports bookedMeetings={bookedMeetings} meetingSessions={meetingSessions} />} />
          
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </RecordingProvider>
  );
}
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

  const [bookedMeetings, setBookedMeetings] = useState(() => {
    try {
      const saved = localStorage.getItem('bookedMeetings');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading booked meetings from storage:", e);
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bookedMeetings', JSON.stringify(bookedMeetings));
    } catch (e) {
      console.error("Error saving booked meetings to storage:", e);
    }
  }, [bookedMeetings]);

  const handleBookMeeting = (newMeeting) => {
    setBookedMeetings((prev) => [...prev, newMeeting]);
  };

  return (
    <RecordingProvider>
      <Routes>
        
        <Route path="/" element={<AuthCard setCurrentUser={setCurrentUser} />} />
        <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />}>
          <Route index element={<DashboardHome bookedMeetings={bookedMeetings} currentUser={currentUser} />} />
          <Route path="my-meetings" element={<MyMeetings bookedMeetings={bookedMeetings} />} />
          <Route 
            path="book-meeting" 
            element={<BookMeeting onBook={handleBookMeeting} bookedMeetings={bookedMeetings} currentUser={currentUser} />} 
          />
          <Route 
            path="meeting-rooms" 
            element={<MeetingRooms bookedMeetings={bookedMeetings} currentUser={currentUser} />} 
          />
          
          <Route path="meeting-records" element={<MeetingRecords />} />
          <Route path="action-items" element={<ActionItem />} />
          <Route path="calendar" element={<Calendar bookedMeetings={bookedMeetings} />} />
          <Route path="reports" element={<Reports bookedMeetings={bookedMeetings} />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </RecordingProvider>
  );
}
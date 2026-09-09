import React, { useState } from 'react';
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

  const handleBookMeeting = (newMeeting) => {
    setBookedMeetings((prev) => [...prev, newMeeting]);
  };

  return (
    <RecordingProvider>
      <Routes>
        <Route path="/" element={<AuthCard />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome bookedMeetings={bookedMeetings} />} />
          <Route path="my-meetings" element={<MyMeetings bookedMeetings={bookedMeetings} />} />
          <Route 
            path="book-meeting" 
            element={<BookMeeting onBook={handleBookMeeting} bookedMeetings={bookedMeetings} />} 
          />
          <Route path="meeting-rooms" element={<MeetingRooms />} />
          <Route path="meeting-records" element={<MeetingRecords />} />
          <Route path="action-items" element={<ActionItem />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </RecordingProvider>
  );
}
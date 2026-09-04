import React, { useState } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function Dashboard() {
  const location = useLocation();
  const [user] = useState(() => {
    if (location.state?.user) {
      localStorage.setItem('authUser', JSON.stringify(location.state.user));
      return location.state.user;
    }
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('savedProfileImage') || null;
  });

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar user={user} profileImage={profileImage} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header user={user} profileImage={profileImage} setProfileImage={setProfileImage} />

        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
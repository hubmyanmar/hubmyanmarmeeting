import React, { useState, useEffect } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function Dashboard({ currentUser }) {
  const location = useLocation();
  const [user, setUser] = useState(() => {
    let rawUser = currentUser || location.state?.user || JSON.parse(localStorage.getItem('currentUser')) || null;
    if (Array.isArray(rawUser)) {
      rawUser = rawUser[0] || null;
    }
    return rawUser;
  });

  useEffect(() => {
    if (currentUser) {
      let normalizedUser = currentUser;
      if (Array.isArray(normalizedUser)) {
        normalizedUser = normalizedUser[0] || null;
      }
      setUser(normalizedUser);
      if (normalizedUser) {
        localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
      }
    }
  }, [currentUser]);

  const [profileImage, setProfileImage] = useState(() => {
    if (user?.image) return user.image;
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
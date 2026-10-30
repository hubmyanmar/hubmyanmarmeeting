import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { clearAuthSession, isAccessTokenValid } from './utils/auth';

export default function Dashboard({ currentUser }) {
  const [user, setUser] = useState(currentUser);
  const hasValidToken = isAccessTokenValid(localStorage.getItem('access_token'));

  useEffect(() => {
    if (!hasValidToken) clearAuthSession();
  }, [hasValidToken]);

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  const [profileImage, setProfileImage] = useState(() => {
    if (user?.image) return user.image;
    return localStorage.getItem('savedProfileImage') || null;
  });

  if (!hasValidToken || !user) return <Navigate to="/" replace state={{ from: location }} />;

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

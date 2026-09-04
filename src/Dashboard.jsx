import React, { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TopStats from './components/TopStats';
import TodaySchedule from './components/TodaySchedule';
import AiSummaryBanner from './components/AiSummaryBanner';
import RightSidebar from './components/RightSidebar';
import BottomMetrics from './components/BottomMetrics';

export default function Dashboard() {
  const location = useLocation();
  const user = location.state?.user;
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('savedProfileImage') || null;
  });
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar user={user} profileImage={profileImage} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          user={user} 
          profileImage={profileImage} 
          setProfileImage={setProfileImage} 
        />

        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
            <TopStats />
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 flex flex-col gap-6">
                <TodaySchedule />
                <AiSummaryBanner />
              </div>
              <div className="col-span-1">
                <RightSidebar />
              </div>
            </div>

            <BottomMetrics />
          </div>
        </div>
      </main>
    </div>
  );
}
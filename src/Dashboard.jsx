import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TopStats from './components/TopStats';
import TodaySchedule from './components/TodaySchedule';
import AiSummaryBanner from './components/AiSummaryBanner';
import RightSidebar from './components/RightSidebar';
import BottomMetrics from './components/BottomMetrics';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

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
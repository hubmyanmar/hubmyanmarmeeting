// src/components/DashboardHome.jsx
import React from 'react';
import TopStats from './TopStats';
import TodaySchedule from './TodaySchedule';
import AiSummaryBanner from './AiSummaryBanner';
import RightSidebar from './RightSidebar';
import BottomMetrics from './BottomMetrics';

export default function DashboardHome() {
  return (
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
  );
}
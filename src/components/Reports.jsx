import React from 'react';
import Header from './Reports/Header';
import MetricCards from './Reports/MetricCards';
import DepartmentChart from './Reports/DepartmentChart';
import ActionsChart from './Reports/ActionsChart';
import TopRooms from './Reports/TopRooms';
import OverdueActions from './Reports/OverdueActions';

export default function Reports() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <Header />
      <MetricCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DepartmentChart />
        <ActionsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopRooms />
        <OverdueActions />
      </div>
    </div>
  );
}
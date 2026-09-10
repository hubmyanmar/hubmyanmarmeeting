import React, { useState } from 'react';
import { statsData, initialColumns } from '../data/actionItemData';
import ActionNavbar from './ActionItem/ActionNavbar';
import ActionStats from './ActionItem/ActionStats';
import KanbanColumn from './ActionItem/KanbanColumn';

export default function ActionItem() {
  const [columns] = useState(initialColumns);
  const [searchQuery, setSearchQuery] = useState('');

  // Search Filter Logic: Title, Meeting, Assignee, Priority တို့ဖြင့် ရှာဖွေနိုင်ခြင်း
  const filteredColumns = columns.map((col) => {
    const filteredTasks = col.tasks.filter((task) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      return (
        task.title?.toLowerCase().includes(query) ||
        task.meeting?.toLowerCase().includes(query) ||
        task.assignee?.toLowerCase().includes(query) ||
        task.priority?.toLowerCase().includes(query)
      );
    });

    return {
      ...col,
      count: filteredTasks.length, // Filter ဖြစ်သွားသော Task အရေအတွက်ကို Dynamic ပြောင်းပေးခြင်း
      tasks: filteredTasks,
    };
  });

  return (
    <div className="min-h-screen bg-[#f8faef]/40 text-gray-800 font-sans pb-12">
      {/* 1. Top Navbar Component (Search state ကို Prop ဖြင့် လှမ်းပို့ထားသည်) */}
      <ActionNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 pt-8">
        {/* Title Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Action Items</h1>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm font-normal">
              Track and manage tasks from your meetings. Turn discussions into outcomes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200/80 text-xs font-medium text-gray-700 shadow-2xs">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>View</span>
              <span className="font-bold text-gray-900">Kanban</span>
              <svg className="w-3.5 h-3.5 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <button type="button" className="flex items-center gap-2 px-4 py-2 bg-[#5538ee] hover:bg-[#482ee0] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Action Item</span>
            </button>
          </div>
        </div>

        {/* 2. Stats Section */}
        <ActionStats stats={statsData} />

        {/* 3. Kanban Columns (Filter ထားသော filteredColumns ကို သုံးထားသည်) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {filteredColumns.map((col) => (
            <KanbanColumn key={col.id} column={col} />
          ))}
        </div>
      </div>
    </div>
  );
}
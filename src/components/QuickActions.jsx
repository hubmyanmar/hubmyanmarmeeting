import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, DoorOpen, Clock, CheckSquare, BarChart3 } from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();

  const quickActions = [
    { title: "Book a Meeting", subtitle: "Schedule a new meeting", icon: Calendar, path: "/dashboard/book-meeting" },
    { title: "Reserve a Room", subtitle: "Find and book available rooms", icon: DoorOpen, path: "/dashboard/meeting-rooms" },
    { title: "View Records", subtitle: "Access meeting history", icon: Clock, path: "/dashboard/meeting-records" },
    { title: "Manage Tasks", subtitle: "View and update your tasks", icon: CheckSquare, path: "/dashboard/action-items" },
    { title: "View Reports", subtitle: "See meeting analytics", icon: BarChart3, path: "/dashboard/reports" }
  ];

  return (

    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full mb-5 md:mb-0">
      <h2 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-1">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{action.title}</h4>
                  <p className="text-[10px] text-gray-400 truncate">{action.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
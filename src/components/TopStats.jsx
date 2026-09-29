import React from 'react';
import { Calendar, Clock, ClipboardCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopStats({ todayCount = 0, upcomingCount = 0, pendingCount = 0, overdueCount = 0 }) {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Today's Meetings",
      value: todayCount,
      icon: Calendar,
      iconBg: "bg-indigo-50 text-indigo-600",
      route: "/dashboard/my-meetings",
    },
    {
      title: "Upcoming Meetings",
      value: upcomingCount,
      icon: Clock,
      iconBg: "bg-blue-50 text-blue-600",
      route: "/dashboard/calendar",
    },
    {
      title: "Pending Actions",
      value: pendingCount,
      icon: Clock,
      iconBg: "bg-emerald-50 text-emerald-600",
      route: "/dashboard/my-meetings",
    },
    {
      title: "Overdue Actions",
      value: overdueCount,
      icon: AlertCircle,
      iconBg: overdueCount > 0 ? "bg-rose-50 text-rose-600" : "bg-orange-50 text-orange-500",
      valueColor: overdueCount > 0 ? "text-rose-600" : "text-gray-900",
      route: "/dashboard/action-items",
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx} 
            onClick={() => navigate(stat.route)}
            className="bg-white p-2.5 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-start gap-2 sm:gap-4">
              <div className={`p-1.5 sm:p-3 rounded-xl shrink-0 ${stat.iconBg}`}>
                <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] sm:text-sm font-medium sm:font-semibold text-gray-500 leading-tight block">
                  {stat.title}
                </span>
                <span className={`text-xl sm:text-3xl font-bold mt-1 ${stat.valueColor || 'text-gray-900'}`}>
                  {stat.value}
                </span>
              </div>
            </div>

            {/* Bottom Navigate Link */}
            <div className="mt-2.5 sm:mt-4 pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
              <span>View details</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
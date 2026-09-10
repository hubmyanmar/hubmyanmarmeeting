import React from 'react';

export default function ActionStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((stat) => (
        <div key={stat.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                {stat.type === 'list' && (
                  <svg className={`w-4 h-4 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
                {stat.type === 'progress' && (
                  <svg className={`w-4 h-4 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {stat.type === 'overdue' && (
                  <svg className={`w-4 h-4 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {stat.type === 'completed' && (
                  <svg className={`w-4 h-4 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-semibold text-gray-500">{stat.title}</span>
            </div>

            <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.count}</div>
            <div className={`flex items-center gap-1 text-[11px] font-medium ${stat.trendColor}`}>
              <span>{stat.change}</span>
            </div>
          </div>

          <div className="w-16 h-10 flex items-end">
            <svg className="w-full h-full" viewBox="0 0 120 30" fill="none">
              <path d={stat.sparklinePath} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={stat.iconColor} />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
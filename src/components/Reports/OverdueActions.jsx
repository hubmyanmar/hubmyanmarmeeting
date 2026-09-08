import React from 'react';
import { SquareCheck, ArrowRight } from 'lucide-react';

const overdueItems = [
  { id: 1, title: 'Prepare Q1 Financial Report', dept: 'Finance', overdue: '3 days overdue' },
  { id: 2, title: 'Submit HR Policy Update', dept: 'HR', overdue: '2 days overdue' },
  { id: 3, title: 'Marketing Campaign Plan', dept: 'BD', overdue: '1 day overdue' },
];

export default function OverdueActions() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">Recent Overdue Actions</h2>
        
        <div className="space-y-3">
          {overdueItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <SquareCheck className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-semibold text-gray-800">{item.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{item.dept}</span>
                <span className="text-xs font-medium text-rose-500">{item.overdue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          <span>View all overdue actions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
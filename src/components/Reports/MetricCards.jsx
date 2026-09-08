import React from 'react';
import { TrendingUp, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

export default function MetricCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Meetings */}
      <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/40 border border-indigo-100/60 p-5 rounded-2xl">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Meetings</p>
        <h3 className="text-3xl font-extrabold text-gray-900 mb-3">42</h3>
        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>15% vs last month</span>
        </div>
      </div>

      {/* Total Meeting Hours */}
      <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/40 border border-purple-100/60 p-5 rounded-2xl">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Meeting Hours</p>
        <h3 className="text-3xl font-extrabold text-gray-900 mb-3">68.5</h3>
        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>18% vs last month</span>
        </div>
      </div>

      {/* Completed Actions */}
      <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100/60 p-5 rounded-2xl relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Completed Actions</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-3">85%</h3>
          </div>
          <div className="p-2 bg-emerald-100/60 rounded-xl text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>12% vs last month</span>
        </div>
      </div>

      {/* Overdue Actions */}
      <div className="bg-gradient-to-br from-rose-50/70 to-red-50/40 border border-rose-100/60 p-5 rounded-2xl relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Overdue Actions</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-3">7</h3>
          </div>
          <div className="p-2 bg-rose-100/60 rounded-xl text-rose-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-rose-600">
          <ArrowDown className="w-3.5 h-3.5" />
          <span>5 vs last month</span>
        </div>
      </div>
    </div>
  );
}
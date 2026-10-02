import React, { useMemo } from 'react';
import { TrendingUp, AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { getReportSummary } from './reportData';

export default function MetricCards({ filter, bookedMeetings = [], meetingSessions = {}, summary: summaryProp }) {
  const computedMetrics = useMemo(
    () => getReportSummary(bookedMeetings, meetingSessions, filter),
    [bookedMeetings, meetingSessions, filter]
  );
  const metrics = summaryProp ?? computedMetrics;
  const compareLabel = metrics.compareLabel;

  const TrendBadge = ({ change, reverseColor = false }) => {
    if (change.isSame) {
      return (
        <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
          <Minus className="w-3.5 h-3.5" />
          <span>0% vs {compareLabel}</span>
        </div>
      );
    }
    const isGood = reverseColor ? !change.isIncrease : change.isIncrease;
    const colorClass = isGood ? 'text-emerald-600' : 'text-rose-600';
    const Icon = change.isIncrease ? ArrowUp : ArrowDown;
    const sign = change.isIncrease ? '+' : '-';

    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{sign}{change.pct}% vs {compareLabel}</span>
      </div>
    );
  };

  return (
    <div data-report-pdf-section="summary" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/40 border border-indigo-100/60 p-3 sm:p-5 rounded-2xl">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Meetings</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">{metrics.meetings.current}</h3>
        <TrendBadge change={metrics.meetings.change} />
      </div>

      <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/40 border border-purple-100/60 p-3 sm:p-5 rounded-2xl">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Completed Meeting Hours</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">{metrics.hours.current} hrs</h3>
        <TrendBadge change={metrics.hours.change} />
      </div>

      <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100/60 p-3 sm:p-5 rounded-2xl relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Completed Actions</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">{metrics.completedPct.current}%</h3>
          </div>
          <div className="p-2 bg-emerald-100/60 rounded-xl text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <TrendBadge change={metrics.completedPct.change} />
      </div>

      <div className="bg-gradient-to-br from-rose-50/70 to-red-50/40 border border-rose-100/60 p-3 sm:p-5 rounded-2xl relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Overdue Actions</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">{metrics.overdue.current}</h3>
          </div>
          <div className="p-2 bg-rose-100/60 rounded-xl text-rose-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <TrendBadge change={metrics.overdue.change} reverseColor={true} />
      </div>
    </div>
  );
}

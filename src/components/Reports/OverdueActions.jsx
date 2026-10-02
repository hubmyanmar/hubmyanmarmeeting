import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SquareCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { getOverdueActions } from './reportData';

export default function OverdueActions({ bookedMeetings = [], meetingSessions = {}, fullPage = false, overdueItems: overdueItemsProp }) {
  const navigate = useNavigate();

  const overdueItems = useMemo(
    () => overdueItemsProp ?? getOverdueActions(bookedMeetings, meetingSessions),
    [overdueItemsProp, bookedMeetings, meetingSessions]
  );

  const displayedItems = fullPage ? overdueItems : overdueItems.slice(0, 3);

  return (
    <div className={`flex h-full w-full min-w-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-sm ${fullPage ? 'p-4 sm:p-5 max-md:gap-3 max-md:p-3' : 'p-2.5 max-md:p-4'}`}>
      <div>
        {fullPage && <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-800">Overdue actions</span>
          </div>
          <span className="shrink-0 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-rose-700">
            {overdueItems.length} total
          </span>
        </div>}
        {!fullPage && <div className="mb-1.5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">Overdue Actions</h2>
              <p className="mt-0.5 text-xs text-slate-500">Needs follow-up</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-rose-700">
            {overdueItems.length} total
          </span>
        </div>}
        
        <div className={fullPage ? 'space-y-2 max-md:space-y-2.5' : 'space-y-1'}>
          {overdueItems.length === 0 ? (
            <div className={`rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 text-center ${fullPage ? 'py-8 max-md:py-7' : 'py-4'}`}>
              <SquareCheck className="mx-auto mb-2 h-5 w-5 text-emerald-500" />
              <p className="text-xs font-medium text-slate-600">No overdue actions</p>
              <p className="mt-1 text-[11px] text-slate-400">You’re all caught up for now</p>
            </div>
          ) : (
            displayedItems.map((item) => (
              <div key={item.id} className={`rounded-xl border border-slate-100 bg-white transition-colors hover:border-rose-100 hover:bg-rose-50/30 ${fullPage ? 'p-3 max-md:p-3.5' : 'p-1.5'}`}>
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className={`mt-0.5 flex shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 ${fullPage ? 'h-7 w-7' : 'h-5 w-5'}`}>
                    <SquareCheck className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={`flex flex-wrap items-start justify-between gap-x-2 gap-y-1 ${fullPage ? 'max-md:flex-col' : ''}`}>
                      <span className={`min-w-0 flex-1 break-words text-xs font-semibold text-slate-800 [overflow-wrap:anywhere] ${fullPage ? 'leading-5 max-md:w-full max-md:flex-auto max-md:text-sm' : 'leading-[0.875rem]'}`}>{item.title}</span>
                      <span className={`shrink-0 rounded-md bg-rose-50 px-2 text-[10px] font-semibold leading-4 text-rose-700 ${fullPage ? 'py-1 max-md:mt-1' : 'py-0.5'}`}>{item.overdue}</span>
                    </div>
                    <div className={`flex min-w-0 items-center justify-between gap-2 ${fullPage ? 'mt-1.5 max-md:flex-col max-md:items-start max-md:justify-start max-md:gap-1.5' : 'mt-0.5'}`}>
                      <span className="min-w-0 truncate text-[11px] text-slate-500 max-md:overflow-visible max-md:text-clip max-md:whitespace-normal max-md:break-words max-md:[overflow-wrap:anywhere]">{item.company}</span>
                      <span className="max-w-[45%] shrink-0 truncate rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 max-md:max-w-full max-md:overflow-visible max-md:text-clip max-md:whitespace-normal max-md:break-words max-md:[overflow-wrap:anywhere]">{item.dept}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {!fullPage && (
        <div className="mt-1.5 border-t border-slate-100 pt-1">
          <button 
            onClick={() => navigate('/dashboard/overdue-actions')}
            className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
          >
            <span>View All Overdue Actions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

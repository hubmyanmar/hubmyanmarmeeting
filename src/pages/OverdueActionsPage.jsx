import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import OverdueActions from '../components/Reports/OverdueActions';

export default function OverdueActionsPage({ bookedMeetings = [], meetingSessions = {} }) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 max-md:-mx-8 max-md:w-[calc(100%+4rem)] max-md:px-4 max-md:pb-20 max-md:space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-md:gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-md:text-xl">Overdue Actions</h1>
            <p className="mt-1 text-sm text-slate-500 max-md:text-xs">Review and follow up on overdue action items.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-indigo-600 max-md:px-3 max-md:py-2 max-md:text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      <OverdueActions
        bookedMeetings={bookedMeetings}
        meetingSessions={meetingSessions}
        fullPage
      />
    </div>
  );
}

import React from 'react';
import { FileText, HardDrive, CalendarClock, Music2 } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsField from './SettingsField';

function SettingsRow({ icon: Icon, label, description, children }) {
  return (
    <div className="grid gap-2 border-b border-slate-100 py-4 sm:gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center">
      <div className="flex min-w-0 items-start gap-2.5">
        <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-5 text-slate-800">{label}</h3>
          {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="min-w-0 text-sm font-medium leading-5 text-slate-700">{children}</div>
    </div>
  );
}

export default function MeetingRecordsPanel({ currentUser }) {
  const disabled = currentUser?.role !== 'admin';
  return (
    <>
      <SettingsPanelHeader
        title="Meeting records"
        description="Storage and retention of meeting recordings."
        icon={FileText}
        badge="Admin only"
      />

      <div className="divide-y divide-slate-100">
        <SettingsRow icon={HardDrive} label="Storage used">
          <span>1.2 GB of recordings</span>
        </SettingsRow>

        <SettingsRow
          icon={CalendarClock}
          label="Auto-delete recordings after"
          description="Older recordings are deleted automatically."
        >
          <SettingsField
            label="Retention period"
            value="90 days"
            options={['30 days', '90 days', '180 days', 'Never']}
            disabled={disabled}
          />
        </SettingsRow>

        <SettingsRow
          icon={Music2}
          label="Apply to"
          description="Summaries and action items are kept."
        >
          <span>Recordings only (audio files)</span>
        </SettingsRow>
      </div>

      <button
        type="button"
        disabled={disabled}
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#564BFF] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#4539ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 active:bg-[#392fce] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save changes
      </button>
    </>
  );
}

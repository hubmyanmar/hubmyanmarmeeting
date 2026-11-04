import React from 'react';
import { Link2, CalendarDays } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsBadge from './SettingsBadge';

export default function CalendarIntegrationsPanel() {
  return <>
    <SettingsPanelHeader title="Calendar integrations" description="Connect your calendar to keep meetings in sync." icon={Link2} badge="Admin only" />
    <article className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><CalendarDays className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">Google Calendar</h3><p className="mt-1 text-sm text-slate-500">Sync workspace bookings with your calendar.</p></div><SettingsBadge tone="orange">Not connected</SettingsBadge><button type="button" className="min-h-11 w-full rounded-lg bg-[#564BFF] px-4 text-sm font-semibold text-white sm:w-auto">Connect</button></article>
    <p className="mt-4 text-sm leading-5 text-slate-500">Calendar integration status: Needs attention</p>
  </>;
}

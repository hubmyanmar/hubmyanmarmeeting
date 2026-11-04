import React from 'react';
import { Settings as SettingsIcon, Clock, UserRound, MessageSquare, Link2, ChevronRight } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsSwitch from './SettingsSwitch';

function RuleRow({ icon: Icon, title, value, status }) {
  return <div className="flex min-h-[60px] items-center gap-3 py-3"><Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500" /><div className="min-w-0 flex-1"><p className="text-sm leading-5 text-slate-500">{title}</p>{value && <p className="break-words text-[15px] font-semibold leading-6 text-slate-800">{value}</p>}</div>{status && <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold leading-4 text-orange-700">{status}</span>}<ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-300" /></div>;
}

export default function BookingRulesPanel() {
  return <>
    <SettingsPanelHeader title="Booking rules" description="Configure meeting bookings and calendar blocking." icon={SettingsIcon} badge="Admin only" />
    <SettingsSwitch label="Admin approval required before calendar blocking" description="Meetings must be approved by an admin before they block the calendar." defaultChecked />
    <div className="mt-4 divide-y divide-slate-100">
      <RuleRow icon={Clock} title="Working hours" value="09:00 AM – 06:00 PM" />
      <RuleRow icon={UserRound} title="Required approver role" value="Department Head" />
      <RuleRow icon={MessageSquare} title="Notification channel" value="Email + In-app" />
      <RuleRow icon={Link2} title="Calendar integration status" status="Needs attention" />
    </div>
    <button type="button" className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#564BFF] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#4539ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 active:bg-[#392fce]">Save changes</button>
  </>;
}

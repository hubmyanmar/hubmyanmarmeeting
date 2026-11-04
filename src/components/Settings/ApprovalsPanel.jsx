import React from 'react';
import { ShieldCheck, Clock3, Check, X } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsBadge from './SettingsBadge';

const requests = [
  { title: 'Quarterly Planning Session', requester: 'May Thu', room: 'Boardroom', time: 'Today · 2:00 PM', status: 'Pending' },
  { title: 'Product Review', requester: 'Aung Kyaw', room: 'Meeting Room A', time: 'Tomorrow · 10:30 AM', status: 'Pending' },
];

export default function ApprovalsPanel() {
  return <>
    <SettingsPanelHeader title="Approvals" description="Review meeting requests that need your approval." icon={ShieldCheck} badge="Admin only" />
    <div className="space-y-3">{requests.map((request) => <article key={request.title} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-slate-900">{request.title}</h3><p className="mt-1 text-sm text-slate-500">Requested by {request.requester}</p></div><SettingsBadge>{request.status}</SettingsBadge></div><p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><Clock3 className="h-4 w-4" />{request.time} · {request.room}</p><div className="mt-4 flex gap-2"><button type="button" className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#564BFF] px-3 text-sm font-semibold text-white"><Check className="h-4 w-4" /> Approve</button><button type="button" className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700"><X className="h-4 w-4" /> Decline</button></div></article>)}</div>
  </>;
}

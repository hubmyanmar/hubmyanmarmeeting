import React from 'react';
import { FileText, Search, Download } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsBadge from './SettingsBadge';

const records = [
  { title: 'Weekly Team Sync', date: 'Nov 3, 2026', organizer: 'Naing Lin Oo', status: 'Ready' },
  { title: 'Product Roadmap Review', date: 'Oct 30, 2026', organizer: 'May Thu', status: 'Ready' },
  { title: 'Client Partnership Discussion', date: 'Oct 28, 2026', organizer: 'Aung Kyaw', status: 'Processing' },
];

export default function MeetingRecordsPanel() {
  return <>
    <SettingsPanelHeader title="Meeting records" description="Browse meeting recordings, transcripts, and summaries." icon={FileText} badge="Admin only" />
    <label className="relative mb-4 block"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" aria-label="Search meeting records" placeholder="Search meeting records" className="min-h-11 w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#564BFF]" /></label>
    <div className="overflow-hidden rounded-xl border border-slate-200"><div className="divide-y divide-slate-100">{records.map((record) => <article key={record.title} className="flex flex-wrap items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F0EFFF] text-[#564BFF]"><FileText className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{record.title}</h3><p className="mt-1 text-sm text-slate-500">{record.date} · {record.organizer}</p></div><SettingsBadge>{record.status}</SettingsBadge><button type="button" aria-label={`Download ${record.title}`} className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><Download className="h-4 w-4" /></button></article>)}</div></div>
  </>;
}

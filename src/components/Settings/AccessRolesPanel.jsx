import React from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsBadge from './SettingsBadge';

const members = [
  { name: 'Naing Lin Oo', email: 'naing.lin.oo@hubmyanmar.com', role: 'Admin' },
  { name: 'May Thu', email: 'may.thu@hubmyanmar.com', role: 'Member' },
  { name: 'Aung Kyaw', email: 'aung.kyaw@hubmyanmar.com', role: 'Department Head' },
];

export default function AccessRolesPanel() {
  return <>
    <SettingsPanelHeader title="Access & roles" description="Manage workspace members and their access levels." icon={Users} badge="Admin only" />
    <div className="overflow-hidden rounded-xl border border-slate-200"><div className="divide-y divide-slate-100">{members.map((member) => <div key={member.email} className="flex flex-wrap items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#F0EFFF] text-[#564BFF]"><Users className="h-4 w-4" /></span><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{member.name}</h3><p className="break-all text-sm text-slate-500">{member.email}</p></div><span className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><ShieldCheck className="h-4 w-4 text-slate-400" />{member.role === 'Admin' ? <SettingsBadge>{member.role}</SettingsBadge> : member.role}</span></div>)}</div></div>
    <button type="button" className="mt-5 min-h-12 w-full rounded-xl border border-[#564BFF] px-4 py-3 text-sm font-semibold text-[#564BFF] sm:w-auto">Invite member</button>
  </>;
}

import React from 'react';
import { UserRound, Settings as SettingsIcon, DoorClosed, ShieldCheck, Link2, Users, Bell, FileText, ChevronRight } from 'lucide-react';
import SettingsBadge from './SettingsBadge';

export const settingsPanels = [
  { id: 'profile', label: 'Profile', group: 'Account', icon: UserRound },
  { id: 'booking-rules', label: 'Booking rules', group: 'Workspace', icon: SettingsIcon, admin: true },
  { id: 'rooms', label: 'Rooms', group: 'Workspace', icon: DoorClosed, admin: true },
  { id: 'approvals', label: 'Approvals', group: 'Workspace', icon: ShieldCheck, admin: true },
  { id: 'calendar-integrations', label: 'Calendar integrations', group: 'Workspace', icon: Link2, admin: true },
  { id: 'access-roles', label: 'Access & roles', group: 'Workspace', icon: Users, admin: true },
  { id: 'notifications', label: 'Notifications', group: 'Preferences', icon: Bell },
  { id: 'meeting-records', label: 'Meeting records', group: 'Preferences', icon: FileText, admin: true },
];

const groups = ['Account', 'Workspace', 'Preferences'];

export default function SettingsMenu({ activePanel, onSelect, isAdmin, isApprover }) {
  return (
    <nav aria-label="Settings sections" className="space-y-4">
      {groups.map((group) => (
        <section key={group} aria-labelledby={`settings-${group.toLowerCase()}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h2 id={`settings-${group.toLowerCase()}`} className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">{group}</h2>
          <div className="divide-y divide-slate-100">
            {settingsPanels.filter((panel) => panel.group === group).map(({ id, label, icon: Icon, admin }) => {
              const disabled = admin && (id === 'approvals' ? !(isAdmin || isApprover) : !isAdmin);
              return (
              <button key={id} type="button" aria-current={activePanel === id ? 'page' : undefined} onClick={() => onSelect(id)} disabled={disabled} className={`flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors ${activePanel === id ? 'bg-[#F8F7FF]' : 'hover:bg-slate-50'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0EFFF] text-[#564BFF]"><Icon aria-hidden="true" className="h-[18px] w-[18px]" /></span>
                <span className={`min-w-0 flex-1 text-sm font-semibold leading-5 ${activePanel === id ? 'text-[#564BFF]' : 'text-slate-700'}`}>{label}</span>
                {admin && <SettingsBadge>{id === 'approvals' ? 'Admin / Approver' : 'Admin only'}</SettingsBadge>}
                <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

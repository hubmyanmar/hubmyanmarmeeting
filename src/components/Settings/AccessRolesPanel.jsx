import React, { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';

const initialMembers = [
  { id: 1, name: 'Ei Ei San', email: 'lilylucy2004@gmail.com', role: 'Admin', active: true, you: true },
  { id: 2, name: 'Ko Kyaw Myint', email: 'ko.kyaw.myint.20261102@example.com', role: 'Member', active: true },
  { id: 3, name: 'Department Head (sample)', email: 'head@example.com', role: 'Approver', active: true },
  { id: 4, name: 'Old Staff (sample)', email: 'old@example.com', role: 'Member', active: false },
];

const roles = ['Admin', 'Approver', 'Member'];

function initials(name) {
  return name
    .replace('(sample)', '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function AccessRolesPanel() {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState('');
  const activeAdminCount = members.filter((member) => member.active && member.role === 'Admin').length;
  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(query));
  }, [members, search]);

  const updateMember = (memberId, update) => {
    setMembers((current) => current.map((member) => member.id === memberId ? { ...member, ...update } : member));
  };

  return (
    <>
      <SettingsPanelHeader
        title="Access & roles"
        description="Choose who can manage settings and approve meetings."
        icon={Users}
        badge="Admin only"
      />

      <label className="relative mb-4 block">
        <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email…"
          aria-label="Search by name or email"
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-[#564BFF] focus:ring-1 focus:ring-[#564BFF]"
        />
      </label>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        {filteredMembers.length ? (
          <div className="divide-y divide-slate-100">
            {filteredMembers.map((member) => {
              const isLastActiveAdmin = member.active && member.role === 'Admin' && activeAdminCount === 1;
              return (
                <article key={member.id} className="flex flex-col gap-3 p-4 sm:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F0EFFF] text-sm font-bold text-[#564BFF]">
                      {initials(member.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold text-slate-900">{member.name}{member.you && <span className="ml-1 font-medium text-slate-500">(You)</span>}</h3>
                      <p className="break-all text-sm text-slate-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <label className="block text-xs font-semibold text-slate-500">
                      Role
                      <select
                        value={member.role}
                        disabled={isLastActiveAdmin}
                        onChange={(event) => updateMember(member.id, { role: event.target.value })}
                        aria-label={`Role for ${member.name}`}
                        className="mt-1 block min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-[#564BFF] focus:ring-1 focus:ring-[#564BFF] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                      {isLastActiveAdmin && <span className="mt-1 block text-xs font-normal leading-4 text-slate-500">The last admin cannot be changed.</span>}
                    </label>

                    <div className="flex min-h-11 items-center justify-between gap-3 sm:justify-end">
                      {member.active
                        ? <span className="inline-flex min-h-7 items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold leading-4 text-emerald-700">Active</span>
                        : <span className="inline-flex min-h-7 items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold leading-4 text-slate-600">Inactive</span>}
                      <button
                        type="button"
                        disabled={isLastActiveAdmin}
                        onClick={() => updateMember(member.id, { active: !member.active })}
                        className="min-h-11 rounded-lg px-3 text-sm font-semibold text-[#564BFF] hover:bg-[#F8F7FF] disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        {member.active ? 'Make inactive' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-slate-500">No users match your search.</p>
        )}
      </div>
    </>
  );
}

import React from 'react';
import { Mail, BriefcaseBusiness } from 'lucide-react';
import SettingsBadge from './SettingsBadge';

export default function SettingsProfileCard({ currentUser }) {
  const user = Array.isArray(currentUser) ? currentUser[0] : currentUser;
  const name = user?.name || user?.fullName || 'Naing Lin Oo';
  const position = user?.position || user?.role || 'Group Sr. Business Development Manager';
  const email = user?.email || 'naing.lin.oo@hubmyanmar.com';

  return (
    <section aria-label="Account profile" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#564BFF] text-lg font-semibold text-white">{name.trim().charAt(0).toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h2 className="max-w-full break-words text-base font-bold leading-5 text-slate-900">{name}</h2><SettingsBadge>Admin</SettingsBadge></div>
          <p className="mt-1 flex items-center gap-1.5 break-words text-sm leading-5 text-slate-600"><BriefcaseBusiness aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />{position}</p>
          <p className="flex items-center gap-1.5 break-all text-sm leading-5 text-slate-500"><Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />{email}</p>
        </div>
      </div>
    </section>
  );
}

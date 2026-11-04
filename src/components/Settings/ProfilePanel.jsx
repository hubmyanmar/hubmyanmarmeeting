import React from 'react';
import { UserRound } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsField from './SettingsField';
import SettingsBadge from './SettingsBadge';

export default function ProfilePanel({ currentUser }) {
  const user = Array.isArray(currentUser) ? currentUser[0] : currentUser;
  const name = user?.name || user?.fullName || '';
  const position = user?.position || '';
  const email = user?.email || '';
  const role = user?.role || 'Member';

  return (
    <>
      <SettingsPanelHeader
        title="Profile"
        description="Your account information."
        icon={UserRound}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="Name" value={name} placeholder="Name" />
        <SettingsField label="Position" value={position} placeholder="Position" />

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-700">Email</h3>
          <p className="mt-1.5 min-h-11 break-all rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">{email}</p>
          <p className="mt-1 text-xs leading-4 text-slate-500">Email cannot be changed here.</p>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-700">Role</h3>
          <div className="mt-1.5 min-h-11"><SettingsBadge>{role}</SettingsBadge></div>
          <p className="mt-1 text-xs leading-4 text-slate-500">Roles are managed in Access &amp; roles.</p>
        </div>
      </div>

      <button
        type="button"
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#564BFF] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4539ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2"
      >
        Save changes
      </button>
    </>
  );
}

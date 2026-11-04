import React from 'react';
import { UserRound } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsField from './SettingsField';

export default function ProfilePanel({ currentUser }) {
  const user = Array.isArray(currentUser) ? currentUser[0] : currentUser;
  return <>
    <SettingsPanelHeader title="Profile" description="Manage your account details and personal information." icon={UserRound} />
    <div className="grid gap-4 sm:grid-cols-2">
      <SettingsField label="Full name" value={user?.name || user?.fullName || 'Naing Lin Oo'} />
      <SettingsField label="Email address" type="email" value={user?.email || 'naing.lin.oo@hubmyanmar.com'} />
      <SettingsField label="Position" value={user?.position || user?.role || 'Group Sr. Business Development Manager'} />
      <SettingsField label="Role" value="Admin" />
    </div>
    <button type="button" className="mt-5 min-h-12 w-full rounded-xl bg-[#564BFF] px-4 py-3 text-sm font-semibold text-white sm:w-auto">Save changes</button>
  </>;
}

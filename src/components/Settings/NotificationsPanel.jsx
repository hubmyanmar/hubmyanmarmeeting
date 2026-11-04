import React from 'react';
import { Bell } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsSwitch from './SettingsSwitch';

export default function NotificationsPanel() {
  return <>
    <SettingsPanelHeader title="Notifications" description="Choose which updates you receive." icon={Bell} />
    <div className="space-y-3">
      <SettingsSwitch label="Meeting updates" description="Get notified when a meeting is booked, changed, or cancelled." defaultChecked />
      <SettingsSwitch label="Approval requests" description="Receive updates when a meeting request needs your attention." defaultChecked />
      <SettingsSwitch label="Meeting summaries" description="Get notified when a meeting summary is ready." />
      <SettingsSwitch label="Email notifications" description="Receive workspace updates by email." defaultChecked />
    </div>
    <button type="button" className="mt-5 min-h-12 w-full rounded-xl bg-[#564BFF] px-4 py-3 text-sm font-semibold text-white sm:w-auto">Save changes</button>
  </>;
}

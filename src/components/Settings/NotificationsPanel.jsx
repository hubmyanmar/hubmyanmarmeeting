import React from 'react';
import { Bell } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsSwitch from './SettingsSwitch';

export default function NotificationsPanel() {
  return (
    <>
      <SettingsPanelHeader
        title="Notifications"
        description="How you personally get notified."
        icon={Bell}
      />

      <div className="space-y-3">
        <SettingsSwitch
          label="Email notifications"
          description="Get meeting updates by email."
          defaultChecked
        />
        <SettingsSwitch
          label="In-app notifications"
          description="Show alerts inside the app."
          defaultChecked
        />
        <SettingsSwitch
          label="Zoho Cliq notifications"
          description="Send alerts to Zoho Cliq."
        />
      </div>

      <p className="mt-4 text-sm leading-5 text-slate-500">
        These are your personal settings — they do not change other people's notifications.
      </p>
    </>
  );
}

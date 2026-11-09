import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsSwitch from './SettingsSwitch';
import api from '../../api';

export default function NotificationsPanel() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inappEnabled, setInappEnabled] = useState(true);
  const [cliqEnabled, setCliqEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: preferences } = await api.get('/settings/notification-preferences');
        setEmailEnabled(preferences.email_enabled);
        setInappEnabled(preferences.inapp_enabled);
        setCliqEnabled(preferences.cliq_enabled);
      } catch (loadError) {
        setError(loadError.response?.data?.detail || loadError.message || 'Unable to load notification preferences.');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const savePreferences = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.put('/settings/notification-preferences', {
        email_enabled: emailEnabled,
        inapp_enabled: inappEnabled,
        cliq_enabled: cliqEnabled,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      setError(saveError.response?.data?.detail || saveError.message || 'Unable to save notification preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SettingsPanelHeader
        title="Notifications"
        description="How you personally get notified."
        icon={Bell}
      />

      {error && <p role="alert" className="mb-4 text-sm text-rose-600">{error}</p>}
      {saved && <p role="status" className="mb-4 text-sm text-emerald-700">Saved</p>}

      <div className="space-y-3">
        <SettingsSwitch
          label="Email notifications"
          description="Get meeting updates by email."
          checked={emailEnabled}
          onChange={(value) => { setEmailEnabled(value); setSaved(false); }}
        />
        <SettingsSwitch
          label="In-app notifications"
          description="Show alerts inside the app."
          checked={inappEnabled}
          onChange={(value) => { setInappEnabled(value); setSaved(false); }}
        />
        <SettingsSwitch
          label="Zoho Cliq notifications"
          description="Send alerts to Zoho Cliq."
          checked={cliqEnabled}
          onChange={(value) => { setCliqEnabled(value); setSaved(false); }}
        />
      </div>

      <p className="mt-4 text-sm leading-5 text-slate-500">
        These are your personal settings — they do not change other people's notifications.
      </p>

      <button
        type="button"
        disabled={loading || saving}
        onClick={savePreferences}
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#564BFF] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#4539ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 active:bg-[#392fce] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save changes
      </button>
    </>
  );
}

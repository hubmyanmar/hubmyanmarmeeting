import React, { useState } from 'react';
import { Link2, CalendarDays } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsBadge from './SettingsBadge';

function IntegrationCard({ name, connected, needsAttention = false, onConnect, onDisconnect, disabled = false }) {
  const status = connected
    ? <span className="inline-flex min-h-7 items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold leading-4 text-emerald-700">Connected</span>
    : needsAttention
      ? <SettingsBadge tone="orange">Needs attention</SettingsBadge>
      : <span className="inline-flex min-h-7 items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold leading-4 text-slate-600">Not connected</span>;

  return (
    <article className="flex w-full flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <CalendarDays aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{name}</h3>
            {status}
          </div>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {connected ? 'Connected and syncing.' : needsAttention ? 'Not connected properly — events may not sync.' : 'Not connected yet.'}
          </p>
        </div>
      </div>
      {connected ? (
        <button type="button" onClick={onDisconnect} disabled={disabled} className={`min-h-11 w-full rounded-lg px-3 text-left text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 sm:w-fit ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
          Disconnect
        </button>
      ) : (
        <button type="button" onClick={onConnect} disabled={disabled} className={`min-h-11 w-full rounded-lg bg-[#564BFF] px-4 text-sm font-semibold text-white hover:bg-[#4539ed] sm:w-fit ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
          {needsAttention ? 'Reconnect' : 'Connect'}
        </button>
      )}
    </article>
  );
}

export default function CalendarIntegrationsPanel({ currentUser }) {
  const disabled = currentUser?.role !== 'admin';
  const [zohoConnected, setZohoConnected] = useState(false);
  const [zohoNeedsAttention, setZohoNeedsAttention] = useState(true);

  return (
    <>
      <SettingsPanelHeader
        title="Calendar integrations"
        description="External calendars connected to meeting rooms."
        icon={Link2}
        badge="Admin only"
      />
      <div className="space-y-3">
        <IntegrationCard
          name="Zoho Calendar"
          connected={zohoConnected}
          needsAttention={zohoNeedsAttention}
          onConnect={() => { setZohoConnected(true); setZohoNeedsAttention(false); }}
          onDisconnect={() => setZohoConnected(false)}
          disabled={disabled}
        />
      </div>
    </>
  );
}

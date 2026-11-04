import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsSwitch from './SettingsSwitch';
import SettingsField from './SettingsField';
import SettingsBadge from './SettingsBadge';

function ChoicePill({ children }) {
  return (
    <span className="inline-flex min-h-10 items-center rounded-full border border-[#D8D4FF] bg-[#F0EFFF] px-3 py-2 text-sm font-semibold text-[#564BFF]">
      {children}
    </span>
  );
}

function RuleRow({ label, description, children }) {
  return (
    <div className="grid gap-2 border-b border-slate-100 py-4 sm:gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold leading-5 text-slate-800">{label}</h3>
        {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function BookingRulesPanel() {
  return (
    <>
      <SettingsPanelHeader
        title="Booking rules"
        description="Configure meeting bookings and calendar blocking."
        icon={SettingsIcon}
        badge="Admin only"
      />

      <div className="divide-y divide-slate-100">
        <div className="border-b border-slate-100 py-4">
          <SettingsSwitch
            label="Admin approval required before calendar blocking"
            defaultChecked
            description="Meetings must be approved by an admin before they block the calendar."
          />
        </div>

        <RuleRow label="Working hours">
          <div className="grid grid-cols-2 gap-3">
            <SettingsField label="Start time" type="time" value="09:00" />
            <SettingsField label="End time" type="time" value="18:00" />
          </div>
        </RuleRow>

        <RuleRow label="Who can approve meetings" description="Fixed — no choice needed here.">
          <div className="flex flex-wrap gap-2">
            <ChoicePill>Admin ✓</ChoicePill>
            <ChoicePill>Approver ✓</ChoicePill>
          </div>
        </RuleRow>

        <RuleRow label="Notification channel">
          <div className="flex flex-wrap gap-2">
            <ChoicePill>Email ✓</ChoicePill>
            <ChoicePill>In-app ✓</ChoicePill>
            <ChoicePill>Zoho Cliq ✓</ChoicePill>
          </div>
        </RuleRow>

        <RuleRow label="Calendar integration status">
          <SettingsBadge tone="orange">Needs attention</SettingsBadge>
        </RuleRow>
      </div>

      <button
        type="button"
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#564BFF] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#4539ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 active:bg-[#392fce]"
      >
        Save changes
      </button>
    </>
  );
}

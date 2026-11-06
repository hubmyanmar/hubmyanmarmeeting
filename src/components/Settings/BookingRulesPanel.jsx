import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsSwitch from './SettingsSwitch';
import SettingsField from './SettingsField';
import SettingsBadge from './SettingsBadge';
import api from '../../api';

function ChoicePill({ label, selected, onClick, disabled = false }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center rounded-full border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 ${selected ? 'border-[#D8D4FF] bg-[#F0EFFF] text-[#564BFF]' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {label}{selected ? ' ✓' : ''}
    </button>
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

export default function BookingRulesPanel({ currentUser }) {
  const disabled = currentUser?.role !== 'admin';
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [approvers, setApprovers] = useState({ admin: true, approver: true });
  const [channels, setChannels] = useState({
    email: true,
    inApp: true,
    zohoCliq: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const togglePill = (key) => {
    setChannels((current) => ({ ...current, [key]: !current[key] }));
    setSaved(false);
  };

  const toggleApprover = (key) => {
    setApprovers((current) => {
      if (current[key] && !current[key === 'admin' ? 'approver' : 'admin']) return current;
      return { ...current, [key]: !current[key] };
    });
    setSaved(false);
  };

  useEffect(() => {
    const loadRules = async () => {
      try {
        const { data: rules } = await api.get('/settings/booking-rules');
        setApprovalRequired(rules.approval_required);
        setWorkStart(rules.work_start);
        setWorkEnd(rules.work_end);
        setApprovers({
          admin: rules.approver_admin,
          approver: rules.approver_approver,
        });
        setChannels({
          email: rules.notify_email,
          inApp: rules.notify_in_app,
          zohoCliq: rules.notify_zoho_cliq,
        });
      } catch (loadError) {
        setError(loadError.response?.data?.detail || loadError.message || 'Unable to load booking rules.');
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  const saveRules = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.put('/settings/booking-rules', {
        approval_required: approvalRequired,
        work_start: workStart,
        work_end: workEnd,
        approver_admin: approvers.admin,
        approver_approver: approvers.approver,
        notify_email: channels.email,
        notify_in_app: channels.inApp,
        notify_zoho_cliq: channels.zohoCliq,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      setError(saveError.response?.data?.detail || saveError.message || 'Unable to save booking rules.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SettingsPanelHeader
        title="Booking rules"
        description="Configure meeting bookings and calendar blocking."
        icon={SettingsIcon}
        badge="Admin only"
      />

      {error && <p role="alert" className="mb-4 text-sm text-rose-600">{error}</p>}
      {saved && <p role="status" className="mb-4 text-sm text-emerald-700">Saved</p>}

      <div className="divide-y divide-slate-100">
        <div className="border-b border-slate-100 py-4">
          <SettingsSwitch
            label="Admin approval required before calendar blocking"
            checked={approvalRequired}
            onChange={(value) => { setApprovalRequired(value); setSaved(false); }}
            description="Meetings must be approved by an admin before they block the calendar."
            disabled={disabled}
          />
        </div>

        <RuleRow label="Working hours">
          <div className="grid grid-cols-2 gap-3">
            <SettingsField label="Start time" type="time" value={workStart} onChange={(event) => { setWorkStart(event.target.value); setSaved(false); }} disabled={disabled} />
            <SettingsField label="End time" type="time" value={workEnd} onChange={(event) => { setWorkEnd(event.target.value); setSaved(false); }} disabled={disabled} />
          </div>
        </RuleRow>

        <RuleRow label="Who can approve meetings">
          <div className="flex flex-wrap gap-2">
            <ChoicePill label="Admin" selected={approvers.admin} onClick={() => toggleApprover('admin')} disabled={disabled} />
            <ChoicePill label="Approver" selected={approvers.approver} onClick={() => toggleApprover('approver')} disabled={disabled} />
          </div>
        </RuleRow>

        <RuleRow label="Notification channel">
          <div className="flex flex-wrap gap-2">
            <ChoicePill label="Email" selected={channels.email} onClick={() => togglePill('email')} disabled={disabled} />
            <ChoicePill label="In-app" selected={channels.inApp} onClick={() => togglePill('inApp')} disabled={disabled} />
            <ChoicePill label="Zoho Cliq" selected={channels.zohoCliq} onClick={() => togglePill('zohoCliq')} disabled={disabled} />
          </div>
        </RuleRow>

        <RuleRow label="Calendar integration status">
          <SettingsBadge tone="orange">Needs attention</SettingsBadge>
        </RuleRow>
      </div>

      <button
        type="button"
        disabled={disabled || loading || saving}
        onClick={saveRules}
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#564BFF] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#4539ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 active:bg-[#392fce] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save changes
      </button>
    </>
  );
}

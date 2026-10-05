import React, { useState } from 'react';
import {
  User,
  DoorClosed,
  Settings as SettingsIcon,
  ShieldCheck,
  Link2,
  Bell,
  FileText,
  Users,
  ChevronRight,
  Clock,
  MessageSquare,
} from 'lucide-react';

const settingLinks = [
  { label: 'Profile', icon: User, group: 'Account' },
  { label: 'Rooms', icon: DoorClosed, group: 'Workspace' },
  { label: 'Approvals', icon: ShieldCheck, group: 'Workspace', admin: true },
  { label: 'Calendar integrations', icon: Link2, group: 'Workspace', admin: true },
  { label: 'Notifications', icon: Bell, group: 'Preferences' },
  { label: 'Meeting records', icon: FileText, group: 'Preferences', admin: true },
  { label: 'Access & roles', icon: Users, group: 'Workspace', admin: true },
];

function SettingLink({ icon: Icon, label, admin, active = false }) {
  return (
    <div
      className={`flex min-h-14 items-center gap-3 px-4 py-3 ${active ? 'bg-[#F8F7FF]' : ''}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0EFFF] text-[#564BFF]">
        <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
      </span>
      <span className={`min-w-0 flex-1 text-sm font-semibold leading-5 ${active ? 'text-[#564BFF]' : 'text-slate-700'}`}>
        {label}
      </span>
      {admin && (
        <span className="max-w-[92px] rounded-full bg-[#F0EFFF] px-2 py-1 text-center text-[10px] font-bold leading-3 text-[#564BFF] sm:max-w-none">
          Admin only
        </span>
      )}
      <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-300" />
    </div>
  );
}

function RuleRow({ icon: Icon, title, value, status }) {
  return (
    <div className="flex min-h-[60px] items-center gap-3 py-3">
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 text-slate-500">{title}</p>
        {value && <p className="break-words text-[15px] font-semibold leading-6 text-slate-800">{value}</p>}
      </div>
      {status && (
        <span className="max-w-[125px] rounded-md bg-orange-50 px-2 py-1 text-center text-xs font-semibold leading-4 text-orange-700 sm:max-w-none">
          {status}
        </span>
      )}
      <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-300" />
    </div>
  );
}

export default function Settings({ currentUser }) {
  const [adminApproval, setAdminApproval] = useState(true);
  const user = Array.isArray(currentUser) ? currentUser[0] : currentUser;
  const name = user?.name || user?.fullName || 'Naing Lin Oo';
  const role = user?.position || user?.role || 'Group Sr. Business Development Manager';
  const email = user?.email || 'naing.lin.oo@hubmyanmar.com';

  return (
    <div className="-m-8 min-h-full bg-[#F8FAFC] px-8 py-7 max-md:px-4 max-md:py-5">
      <div className="mx-auto w-full max-w-5xl pb-24 md:pb-8">
        <header className="mb-6">
          <p className="mb-1 text-sm font-semibold text-[#564BFF]">Workspace</p>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[30px]">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Manage your account and meeting workspace preferences.
          </p>
        </header>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)] lg:items-start">
          <div className="min-w-0 space-y-5">
            <section aria-label="Account profile" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#564BFF] text-lg font-semibold text-white">
                  {name.trim().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h2 className="max-w-full break-words text-base font-bold leading-5 text-slate-900">{name}</h2>
                    <span className="rounded-full bg-[#F0EFFF] px-2 py-1 text-[11px] font-bold leading-4 text-[#564BFF]">Admin</span>
                  </div>
                  <p className="mt-1 break-words text-sm leading-5 text-slate-600">{role}</p>
                  <p className="break-all text-sm leading-5 text-slate-500">{email}</p>
                </div>
              </div>
            </section>

            {['Account', 'Workspace', 'Preferences'].map((group) => (
              <section key={group} aria-labelledby={`settings-${group.toLowerCase()}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h2 id={`settings-${group.toLowerCase()}`} className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {group}
                </h2>
                <div className="divide-y divide-slate-100">
                  {settingLinks.filter((item) => item.group === group).map((item) => (
                    <SettingLink key={item.label} {...item} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section aria-labelledby="booking-rules-title" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-1 flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EFFF] text-[#564BFF]">
                <SettingsIcon aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="booking-rules-title" className="text-lg font-bold leading-6 text-slate-900">Booking rules</h2>
                  <span className="rounded-full bg-[#F0EFFF] px-2 py-1 text-[11px] font-bold leading-4 text-[#564BFF]">Admin only</span>
                </div>
                <p className="mt-1 text-sm leading-5 text-slate-600">Configure meeting bookings and calendar blocking.</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={adminApproval}
                  aria-label="Admin approval required before calendar blocking"
                  onClick={() => setAdminApproval((value) => !value)}
                  className={`relative mt-0.5 inline-flex h-11 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 ${adminApproval ? 'bg-[#564BFF]' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${adminApproval ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-sm font-semibold leading-5 text-slate-900">Admin approval required before calendar blocking</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">Meetings must be approved by an admin before they block the calendar.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              <RuleRow icon={Clock} title="Working hours" value="09:00 AM – 06:00 PM" />
              <RuleRow icon={User} title="Required approver role" value="Department Head" />
              <RuleRow icon={MessageSquare} title="Notification channel" value="Email + In-app" />
              <RuleRow icon={Link2} title="Calendar integration status" status="Needs attention" />
            </div>

            <button type="button" className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#564BFF] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#4539ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 active:bg-[#392fce]">
              Save changes
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

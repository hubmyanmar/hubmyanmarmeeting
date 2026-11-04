import React from 'react';
import SettingsBadge from './SettingsBadge';

export default function SettingsPanelHeader({ title, description, icon: Icon, badge, titleAction }) {
  return (
    <div className="mb-5 flex min-w-0 items-start gap-3">
      {titleAction || (Icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EFFF] text-[#564BFF]"><Icon aria-hidden="true" className="h-5 w-5" /></span>)}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold leading-6 text-slate-900">{title}</h2>
          {badge && <SettingsBadge>{badge}</SettingsBadge>}
        </div>
        {description && <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>}
      </div>
    </div>
  );
}

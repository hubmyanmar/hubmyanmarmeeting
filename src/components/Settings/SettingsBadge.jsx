import React from 'react';

export default function SettingsBadge({ children, tone = 'purple' }) {
  const toneClass = tone === 'orange'
    ? 'bg-orange-50 text-orange-700'
    : 'bg-[#F0EFFF] text-[#564BFF]';

  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold leading-4 ${toneClass}`}>{children}</span>;
}

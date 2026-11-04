import React, { useState } from 'react';

export default function SettingsSwitch({ label, description, defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => setChecked((value) => !value)}
        className={`relative mt-0.5 inline-flex h-11 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 ${checked ? 'bg-[#564BFF]' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
      <div className="min-w-0 pt-0.5">
        <h3 className="text-sm font-semibold leading-5 text-slate-900">{label}</h3>
        {description && <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>}
      </div>
    </div>
  );
}

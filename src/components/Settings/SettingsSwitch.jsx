import React, { useState } from 'react';

export default function SettingsSwitch({ label, description, defaultChecked = false, checked: controlledChecked, onChange, disabled = false }) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const checked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleClick = () => {
    if (controlledChecked !== undefined) {
      onChange?.(!controlledChecked);
    } else {
      setInternalChecked((value) => !value);
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleClick}
        className={`relative mt-0.5 inline-flex h-7 w-[52px] shrink-0 items-center rounded-full px-[3px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 ${checked ? 'bg-[#564BFF]' : 'bg-[#CBD5E1]'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <span className={`inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
      <div className="min-w-0 pt-0.5">
        <h3 className="text-sm font-semibold leading-5 text-slate-900">{label}</h3>
        {description && <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>}
      </div>
    </div>
  );
}

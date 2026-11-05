import React from 'react';

export default function SettingsField({ label, value, type = 'text', options, placeholder, disabled = false }) {
  const className = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-[#564BFF] focus:ring-1 focus:ring-[#564BFF] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-50';
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {options ? (
        <select className={className} defaultValue={value} disabled={disabled}>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : (
        <input type={type} className={className} defaultValue={value} placeholder={placeholder} disabled={disabled} />
      )}
    </label>
  );
}

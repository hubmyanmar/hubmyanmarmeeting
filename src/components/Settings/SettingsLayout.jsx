import React from 'react';
import { ArrowLeft } from 'lucide-react';
import SettingsMenu from './SettingsMenu';
import SettingsProfileCard from './SettingsProfileCard';

export default function SettingsLayout({ currentUser, activePanel, mobilePanelOpen, onSelect, children }) {
  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)] lg:items-start">
      <aside className={`${mobilePanelOpen ? 'hidden lg:block' : 'block'} min-w-0 space-y-5`}>
        <SettingsProfileCard currentUser={currentUser} />
        <SettingsMenu activePanel={activePanel} onSelect={onSelect} />
      </aside>
      <section className={`${mobilePanelOpen ? 'block' : 'hidden lg:block'} min-h-[60vh] min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5`}>
        <button type="button" onClick={() => onSelect(null)} className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#564BFF] hover:bg-[#F8F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] lg:hidden">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to menu
        </button>
        {children}
      </section>
    </div>
  );
}

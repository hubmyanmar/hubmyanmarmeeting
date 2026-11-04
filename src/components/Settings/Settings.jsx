import React, { useEffect, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import SettingsLayout from './SettingsLayout';
import { settingsPanels } from './SettingsMenu';
import ProfilePanel from './ProfilePanel';
import BookingRulesPanel from './BookingRulesPanel';
import RoomsPanel from './RoomsPanel';
import ApprovalsPanel from './ApprovalsPanel';
import CalendarIntegrationsPanel from './CalendarIntegrationsPanel';
import AccessRolesPanel from './AccessRolesPanel';
import NotificationsPanel from './NotificationsPanel';
import MeetingRecordsPanel from './MeetingRecordsPanel';

const panelComponents = {
  profile: ProfilePanel,
  'booking-rules': BookingRulesPanel,
  rooms: RoomsPanel,
  approvals: ApprovalsPanel,
  'calendar-integrations': CalendarIntegrationsPanel,
  'access-roles': AccessRolesPanel,
  notifications: NotificationsPanel,
  'meeting-records': MeetingRecordsPanel,
};

export default function Settings({ currentUser }) {
  const location = useLocation();
  const { profileImage, setProfileImage } = useOutletContext();
  const openProfileFromNavigation = location.state?.settingsPanel === 'profile';
  const [activePanel, setActivePanel] = useState(() => openProfileFromNavigation ? 'profile' : 'booking-rules');
  const [mobilePanelOpen, setMobilePanelOpen] = useState(openProfileFromNavigation);
  const selected = settingsPanels.find((panel) => panel.id === activePanel);
  const Panel = panelComponents[activePanel];

  useEffect(() => {
    if (location.state?.settingsPanel === 'profile') {
      setActivePanel('profile');
      setMobilePanelOpen(true);
    }
  }, [location.key, location.state]);

  const selectPanel = (panelId) => {
    if (panelId) setActivePanel(panelId);
    setMobilePanelOpen(Boolean(panelId));
  };

  return (
    <div className="-m-8 min-h-full bg-[#F8FAFC] px-8 py-7 max-md:px-4 max-md:py-5">
      <div className="mx-auto w-full max-w-5xl pb-24 md:pb-8">
        <header className={`${mobilePanelOpen ? 'hidden lg:block' : 'block'} mb-6`}>
          <p className="mb-1 text-sm font-semibold text-[#564BFF]">Workspace</p>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[30px]">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Manage your account and meeting workspace preferences.</p>
        </header>
        <SettingsLayout currentUser={currentUser} activePanel={activePanel} mobilePanelOpen={mobilePanelOpen} onSelect={selectPanel}>
          {Panel && selected && (Panel === ProfilePanel
            ? <Panel currentUser={currentUser} profileImage={profileImage} setProfileImage={setProfileImage} />
            : <Panel currentUser={currentUser} />)}
        </SettingsLayout>
      </div>
    </div>
  );
}

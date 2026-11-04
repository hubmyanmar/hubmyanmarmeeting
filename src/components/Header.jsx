import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

export default function Header({ user, profileImage, setProfileImage }) {
  const displayName = user?.name || user?.fullName || "User";
  const navigate = useNavigate();
  
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
      <div className="flex sm:hidden items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-orange-100/80 flex items-center justify-center shrink-0">
          <img 
            src="/hubmyanmar.jpg" 
            alt="HUB Myanmar Logo" 
            className="w-8 h-8 object-contain rounded" 
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-900 leading-tight">Hub Myanmar</span>
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase leading-tight">MEETING HUB</span>
        </div>
      </div>
      <div className="hidden sm:block"></div>
      <div className="flex items-center gap-3 sm:gap-6">
        <span className="hidden sm:inline-block px-3 py-1 border border-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-600 bg-white shadow-sm">
          {today}
        </span>

        <button className="relative p-1 text-gray-400 hover:text-gray-600">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => navigate('/dashboard/settings', { state: { settingsPanel: 'profile' } })}
            aria-label="Open profile settings"
            title="Open profile settings"
            className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2"
          >
            <img
              src={profileImage || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%234f46e5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="16" font-family="sans-serif">${displayName.charAt(0).toUpperCase()}</text></svg>`}
              alt="Profile"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 shadow-sm cursor-pointer object-cover hover:opacity-80 transition-opacity"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

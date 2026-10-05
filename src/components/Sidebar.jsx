import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, BookOpen, Lightbulb, DoorOpen, Mic, 
  CheckSquare, Calendar, BarChart3, Settings, LogOut, 
  MoreHorizontal, X, Radio
} from 'lucide-react';

const MenuItem = ({ path, icon: Icon, label, currentPath, onClick }) => {
  const navigate = useNavigate();
  const isActive = currentPath === path; 

  const handleClick = () => {
    navigate(path);
    if (onClick) onClick();
  };

  return (
    <button 
      onClick={handleClick} 
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        isActive 
          ? 'bg-indigo-50 text-indigo-600' 
          : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon strokeWidth={2} className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span>{label}</span>
      </div>
      {path === '/dashboard/live-meeting' && isActive && (
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
    </button>
  );
};

export default function Sidebar({ user, profileImage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [cachedUser] = useState(() => {
    try {
      const savedCurrentUser = localStorage.getItem('currentUser');
      if (savedCurrentUser) return JSON.parse(savedCurrentUser);
      
      const savedAuthUser = localStorage.getItem('authUser');
      if (savedAuthUser) return JSON.parse(savedAuthUser);
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
    return null;
  });

  const activeUser = user || cachedUser;
  
  const displayName = activeUser?.name || activeUser?.fullName || "User";
  const position = activeUser?.position || activeUser?.role || "Member";

  const [showMore, setShowMore] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authUser'); 
    localStorage.removeItem('savedProfileImage'); 
    navigate('/'); 
  };

  const handleMobileNav = (path) => {
    navigate(path);
    setShowMore(false);
  };

  const primaryMobileNavs = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/dashboard/my-meetings', label: 'My Meetings', icon: BookOpen },
    { path: '/dashboard/book-meeting', label: 'Book', icon: Lightbulb },
    { path: '/dashboard/meeting-rooms', label: 'Rooms', icon: DoorOpen },
  ];
  const secondaryMobileNavs = [
    { path: '/dashboard/live-meeting', label: 'Live Meeting', icon: Radio },
    { path: '/dashboard/meeting-records', label: 'Meeting Records', icon: Mic },
    { path: '/dashboard/action-items', label: 'Action Items', icon: CheckSquare },
    { path: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
    { path: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const isSecondaryActive = secondaryMobileNavs.some(nav => nav.path === currentPath);

  return (
    <>
      <aside className="hidden md:flex w-[220px] bg-white border-r border-gray-200 flex-col shrink-0 h-screen">
        <div className="p-5 flex items-center gap-3">
          <img 
            src="/hubmyanmar.jpg" 
            alt="HUB Myanmar Logo" 
            className="w-8 h-8 object-contain rounded" 
          />
          <div>
            <h1 className="font-bold text-sm text-gray-900 leading-tight">Hub Myanmar</h1>
            <p className="text-[10px] font-bold text-gray-500 tracking-wider">MEETING HUB</p>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <MenuItem path="/dashboard" icon={Home} label="Home" currentPath={currentPath} />
          <MenuItem path="/dashboard/my-meetings" icon={BookOpen} label="My Meetings" currentPath={currentPath} />
          <MenuItem path="/dashboard/book-meeting" icon={Lightbulb} label="Book Meeting" currentPath={currentPath} />
          <MenuItem path="/dashboard/meeting-rooms" icon={DoorOpen} label="Meeting Rooms" currentPath={currentPath} />
          <MenuItem path="/dashboard/live-meeting" icon={Radio} label="Live Meeting" currentPath={currentPath} />
          
          <MenuItem path="/dashboard/meeting-records" icon={Mic} label="Meeting Records" currentPath={currentPath} />
          <MenuItem path="/dashboard/action-items" icon={CheckSquare} label="Action Items" currentPath={currentPath} />
          <MenuItem path="/dashboard/calendar" icon={Calendar} label="Calendar" currentPath={currentPath} />
          <MenuItem path="/dashboard/reports" icon={BarChart3} label="Reports" currentPath={currentPath} />
          <MenuItem path="/dashboard/settings" icon={Settings} label="Settings" currentPath={currentPath} />
        </nav>

        <div className="p-3.5 border-t border-gray-200 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <img 
              src={profileImage || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%236366f1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="16" font-family="sans-serif">${displayName.charAt(0).toUpperCase()}</text></svg>`} 
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-gray-300"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 truncate">{displayName}</h4>
              <p className="text-[11px] text-gray-500 truncate">{position}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden">
        {showMore && (
          <div 
            className="fixed inset-0 bg-black/40 z-50 transition-opacity" 
            onClick={() => setShowMore(false)} 
          />
        )}
        <div 
          className={`fixed top-0 right-0 h-full w-[250px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
            showMore ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">More Menu</span>
            <button 
              onClick={() => setShowMore(false)} 
              className="flex h-11 w-11 items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            {secondaryMobileNavs.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleMobileNav(item.path)}
                  className={`w-full min-h-11 flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.path === '/dashboard/live-meeting' && isActive && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="flex min-h-11 items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around items-center h-16 px-0 shadow-lg">
          {primaryMobileNavs.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path && !showMore;
            return (
              <button
                key={item.path}
                onClick={() => handleMobileNav(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 text-[11px] font-medium transition-colors relative ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 text-[11px] font-medium transition-colors relative ${
              showMore || isSecondaryActive ? 'text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 mb-1 ${showMore || isSecondaryActive ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span>More</span>
          </button>
        </nav>
      </div>
    </>
  );
}

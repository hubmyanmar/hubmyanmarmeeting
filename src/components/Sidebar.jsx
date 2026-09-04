import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Lightbulb, DoorOpen, Mic, CheckSquare, Calendar, BarChart3, Settings, LogOut } from 'lucide-react';

const MenuItem = ({ path, icon: Icon, label, currentPath }) => {
  const navigate = useNavigate();
  const isActive = currentPath === path; 

  return (
    <button 
      onClick={() => navigate(path)} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon strokeWidth={isActive ? 2.5 : 2} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
      {label}
    </button>
  );
};

export default function Sidebar({ user, profileImage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const displayName = user?.name || user?.fullName || "User";
  const position = user?.position || user?.role || "Member";

  const handleLogout = () => {
    localStorage.removeItem('authUser'); 
    localStorage.removeItem('savedProfileImage'); 
    navigate('/'); 
  };

  return (
    <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col shrink-0 h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#3B82F6] rounded flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #3B82F6, #EF4444)' }}>M</div>
        <div>
          <h1 className="font-bold text-sm text-gray-900 leading-tight">Hub Myanmar</h1>
          <p className="text-[10px] font-bold text-gray-500 tracking-wider">MEETING HUB</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <MenuItem path="/dashboard" icon={Home} label="Home" currentPath={currentPath} />
        <MenuItem path="/dashboard/my-meetings" icon={BookOpen} label="My Meetings" currentPath={currentPath} />
        <MenuItem path="/dashboard/book-meeting" icon={Lightbulb} label="Book Meeting" currentPath={currentPath} />
        <MenuItem path="/dashboard/meeting-rooms" icon={DoorOpen} label="Meeting Rooms" currentPath={currentPath} />
        <MenuItem path="/dashboard/meeting-records" icon={Mic} label="Meeting Records" currentPath={currentPath} />
        <MenuItem path="/dashboard/action-items" icon={CheckSquare} label="Action Items" currentPath={currentPath} />
        <MenuItem path="/dashboard/calendar" icon={Calendar} label="Calendar" currentPath={currentPath} />
        <MenuItem path="/dashboard/reports" icon={BarChart3} label="Reports" currentPath={currentPath} />
        <MenuItem path="/dashboard/settings" icon={Settings} label="Settings" currentPath={currentPath} />
      </nav>

      <div className="p-4 border-t border-gray-200 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <img 
            src={profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} 
            alt="User" 
            className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 object-cover" 
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate">{displayName}</h4>
            <p className="text-xs text-gray-500 truncate">{position}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
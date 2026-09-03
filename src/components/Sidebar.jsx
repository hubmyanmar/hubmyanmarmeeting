import React, { useState } from 'react';
import { Home, BookOpen, Lightbulb, DoorOpen, Mic, CheckSquare, Calendar, BarChart3, Settings, MoreVertical } from 'lucide-react';

const MenuItem = ({ id, icon: Icon, label, active, setActive }) => {
  const isActive = active === id;
  return (
    <button onClick={() => setActive(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
      <Icon strokeWidth={isActive ? 2.5 : 2} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
      {label}
    </button>
  );
};

export default function Sidebar() {
  const [activeMenu, setActiveMenu] = useState('home');

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
        <MenuItem id="home" icon={Home} label="Home" active={activeMenu} setActive={setActiveMenu} />
        <MenuItem id="my-meetings" icon={BookOpen} label="My Meetings" active={activeMenu} setActive={setActiveMenu} />
        <MenuItem id="book-meeting" icon={Lightbulb} label="Book Meeting" active={activeMenu} setActive={setActiveMenu} />
        <MenuItem id="meeting-rooms" icon={DoorOpen} label="Meeting Rooms" active={activeMenu} setActive={setActiveMenu} />
        <MenuItem id="meeting-records" icon={Mic} label="Meeting Records" active={activeMenu} setActive={setActiveMenu} />
        <MenuItem id="action-items" icon={CheckSquare} label="Action Items" active={activeMenu} setActive={setActiveMenu} />
        <MenuItem id="calendar" icon={Calendar} label="Calendar" active={activeMenu} setActive={setActiveMenu} />
        <MenuItem id="reports" icon={BarChart3} label="Reports" active={activeMenu} setActive={setActiveMenu} />
        <MenuItem id="settings" icon={Settings} label="Settings" active={activeMenu} setActive={setActiveMenu} />
      </nav>

      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Naing" alt="User" className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100" />
          <div>
            <h4 className="text-sm font-bold text-gray-900 truncate">Naing Lin Oo</h4>
            <p className="text-xs text-gray-500">BD Head</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1"><MoreVertical className="w-5 h-5" /></button>
      </div>
    </aside>
  );
}
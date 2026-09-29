import React, { useState } from 'react';
import { 
  Search, Calendar, MapPin, User, MoreVertical, X, 
  CheckCircle2, Clock, AlertCircle, FileText, Mic, 
  Video, LayoutGrid, ListTodo, ChevronLeft, ChevronRight, Info
} from 'lucide-react';

// --- Mock Data ---
const mockRecords = [
  {
    id: 1,
    title: 'Project Kickoff Meeting',
    subtitle: 'Team sync and planning',
    date: 'Sep 23, 2026',
    time: '09:00 AM - 10:15 AM',
    room: 'Bagan Room',
    organizer: 'Aung Ko',
    status: 'Completed',
    recording: 'ready',
    transcript: 'ready',
    summary: 'review',
    participants: 12
  },
  {
    id: 2,
    title: 'Monthly Operations Review',
    subtitle: 'Q3 performance update',
    date: 'Sep 21, 2026',
    time: '02:00 PM - 03:00 PM',
    room: 'Kone Baung Room',
    organizer: 'Thinzar Aung',
    status: 'Completed',
    recording: 'processing',
    transcript: 'processing',
    summary: 'unavailable',
    participants: 8
  },
  {
    id: 3,
    title: 'Client Presentation',
    subtitle: 'Product demo & feedback',
    date: 'Sep 18, 2026',
    time: '10:00 AM - 11:30 AM',
    room: 'Bagan Room',
    organizer: 'Su Myat',
    status: 'Completed',
    recording: 'ready',
    transcript: 'ready',
    summary: 'ready',
    participants: 5
  },
  {
    id: 4,
    title: 'Team Standup',
    subtitle: 'Weekly sync',
    date: 'Sep 16, 2026',
    time: '09:30 AM - 10:00 AM',
    room: 'Kone Baung Room',
    organizer: 'Kyaw Zaw',
    status: 'Completed',
    recording: 'ready',
    transcript: 'ready',
    summary: 'ready',
    participants: 6
  }
];

// --- Enhanced Status Badge ---
const StatusBadge = ({ type }) => {
  if (type === 'ready') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-xs font-medium">
      <CheckCircle2 size={14} className="text-emerald-500" /> Ready
    </span>
  );
  if (type === 'processing') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 text-xs font-medium">
      <Clock size={14} className="text-blue-500" /> Processing
    </span>
  );
  if (type === 'review') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200/60 text-xs font-medium">
      <AlertCircle size={14} className="text-orange-500" /> Review Required
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-xs font-medium">
      <AlertCircle size={14} className="text-slate-400" /> Unavailable
    </span>
  );
};

export default function MeetingRecords() {
  // Detail box ကို default အနေနဲ့ မပြဘဲ null ထားလိုက်ပါသည်
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = [
    { id: 'Overview', icon: LayoutGrid },
    { id: 'Notes', icon: FileText },
    { id: 'Recording', icon: Video },
    { id: 'Transcript', icon: Mic },
    { id: 'AI Summary', icon: Info },
    { id: 'Action Items', icon: ListTodo }
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[85vh] w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-slate-800">
      
      {/* ---------------- LEFT SECTION (Table List) ---------------- */}
      <div className={`flex-1 flex flex-col min-w-0 ${selectedRecord ? 'hidden lg:flex lg:border-r border-slate-200' : 'flex'}`}>
        
        {/* Header & Filters */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white z-20">
          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Meeting Records</h1>
            <p className="text-sm text-slate-500 mt-1">Searchable archive of all meeting records and transcripts.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by title, organizer, or keywords..." 
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow placeholder:text-slate-400"
              />
            </div>
            
            {/* Filter Buttons */}
            <button className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="text-left leading-tight">
                <span className="block font-semibold text-slate-700">Date Range</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">Last 30 days</span>
              </div>
            </button>
            <button className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div className="text-left leading-tight">
                <span className="block font-semibold text-slate-700">Room</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">All rooms</span>
              </div>
            </button>
            <button className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
              <User className="w-4 h-4 text-slate-400" />
              <div className="text-left leading-tight">
                <span className="block font-semibold text-slate-700">Organizer</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">All organizers</span>
              </div>
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-slate-50/30">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-200 shadow-sm">
              <tr>
                <th className="px-8 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Organizer</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recording</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transcript</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Summary</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockRecords.map((record) => (
                <tr 
                  key={record.id} 
                  onClick={() => setSelectedRecord(record)}
                  className={`group cursor-pointer transition-all duration-200 ${
                    selectedRecord?.id === record.id 
                      ? 'bg-indigo-50/50 shadow-[inset_3px_0_0_0_#4f46e5]' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-8 py-4">
                    <p className={`text-sm font-semibold ${selectedRecord?.id === record.id ? 'text-indigo-700' : 'text-slate-900 group-hover:text-indigo-600 transition-colors'}`}>
                      {record.title}
                    </p>
                    <p className="text-[13px] text-slate-500 mt-1">{record.subtitle}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[13px] text-slate-700 font-medium">
                      <Calendar className="w-4 h-4 text-slate-400" /> {record.date}
                    </div>
                    <p className="text-[12px] text-slate-500 mt-1 pl-6">{record.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[13px] text-slate-700">
                      <FileText className="w-4 h-4 text-slate-400" /> {record.room}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[13px] text-slate-700">
                      <User className="w-4 h-4 text-slate-400" /> {record.organizer}
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge type={record.recording} /></td>
                  <td className="px-6 py-4"><StatusBadge type={record.transcript} /></td>
                  <td className="px-6 py-4"><StatusBadge type={record.summary} /></td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-100/50 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <p>Showing 1–8 of 32 records</p>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><ChevronLeft size={18} /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-medium shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 font-medium transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 font-medium transition-colors">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 font-medium transition-colors">4</button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT SECTION (Side Panel) ---------------- */}
      {selectedRecord && (
        <div className="w-full lg:w-[480px] xl:w-[500px] bg-[#fafafa] flex flex-col h-full shrink-0 border-l border-slate-200 relative shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          
          {/* Panel Header */}
          <div className="px-8 pt-8 pb-0 bg-white border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl text-indigo-600 border border-slate-200 shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedRecord.room}</h2>
                  <p className="text-[13px] text-slate-500 mt-1 font-medium">{selectedRecord.date} <span className="mx-1.5 text-slate-300">•</span> {selectedRecord.time}</p>
                  <p className="text-[13px] text-slate-500 mt-1">Organized by <span className="font-medium text-slate-700">{selectedRecord.organizer}</span></p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button 
                  onClick={() => setSelectedRecord(null)} 
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-bold tracking-wide uppercase">
                  <CheckCircle2 size={14} /> Completed
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar mt-8 gap-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 flex items-center gap-2 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                      isActive 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                    {tab.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel Content (Scrollable) */}
          <div className="p-8 overflow-y-auto flex-1 space-y-8">
            
            {activeTab === 'Overview' && (
              <>
                {/* Meeting Details List */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-[15px] font-bold text-slate-900 mb-5">Meeting Details</h3>
                  <div className="space-y-4 text-[14px]">
                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <span className="text-slate-500">Title</span>
                      <span className="font-semibold text-slate-800">{selectedRecord.title}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <span className="text-slate-500">Room</span>
                      <span className="font-semibold text-slate-800">{selectedRecord.room}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <span className="text-slate-500">Date & Time</span>
                      <span className="font-semibold text-slate-800">
                        {selectedRecord.date} <span className="text-slate-300 mx-1.5">•</span> {selectedRecord.time}
                      </span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <span className="text-slate-500">Organizer</span>
                      <span className="font-semibold text-slate-800">{selectedRecord.organizer}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <span className="text-slate-500">Participants</span>
                      <span className="font-semibold text-slate-800">{selectedRecord.participants} attendees</span>
                    </div>
                  </div>
                </div>

                {/* Admin Approval Info Box */}
                <div className="bg-[#f5f3ff] border border-[#ede9fe] rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
                  <Info className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-[14px] font-bold text-indigo-900">Admin Approval Required</h4>
                    <p className="text-[13px] text-indigo-800/80 mt-1.5 leading-relaxed">
                      All booking requests require Admin approval before a confirmed calendar block.
                    </p>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[15px] font-bold text-slate-900">Summary</h3>
                    <StatusBadge type={selectedRecord.summary} />
                  </div>
                  <p className="text-[14px] text-slate-600 leading-relaxed">
                    The meeting covered project kickoff, team roles, timeline and next steps. Key decisions were made on resource allocation and immediate actions.
                  </p>
                  
                  {selectedRecord.summary === 'review' && (
                    <div className="mt-5 bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-3.5 flex items-start gap-2.5 text-[13px] text-orange-800 font-medium">
                      <Info size={18} className="shrink-0 text-orange-500" />
                      Summary is not approved until reviewed.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Empty State for other tabs */}
            {activeTab !== 'Overview' && (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                <Info size={32} className="mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">Content for {activeTab} will appear here.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
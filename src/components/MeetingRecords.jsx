import React, { useEffect, useState } from 'react';
import { 
  Search, Calendar, MapPin, User, MoreVertical, X, 
  CheckCircle2, Clock, AlertCircle, FileText, Mic, 
  Video, LayoutGrid, ListTodo, Info
} from 'lucide-react';
import api from '../api';

/** @typedef {import('../types').MeetingRecord} MeetingRecord */

const displayName = (value) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value?.name || value?.full_name || value?.fullName || value?.room_name || value?.title || value?.label || value?.email || '';
};

const formatDate = (value) => {
  if (!value || value === '—') return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(date);
};

const statusFor = (value, hasData) => {
  const status = String(value || '').toLowerCase();
  if (['ready', 'completed', 'complete', 'done', 'available'].includes(status)) return 'ready';
  if (['processing', 'pending', 'running', 'in_progress'].includes(status)) return 'processing';
  if (['review', 'review_required'].includes(status)) return 'review';
  return hasData ? 'ready' : 'unavailable';
};

/** @param {MeetingRecord} record */
const normalizeRecord = (record, index) => {
  const transcript = record.transcript || record.transcript_text || '';
  const summary = record.summary_en || record.ai_summary_en || record.summary?.english || record.summary?.en || (typeof record.summary === 'string' ? record.summary : '');
  const participants = record.participants || record.attendees || [];
  const startTime = record.start_time || record.startTime || '';
  const endTime = record.end_time || record.endTime || '';

  return {
    ...record,
    id: record.id ?? record.meeting_record_id ?? record.meeting_id ?? index,
    title: String(record.title?.trim() || 'Untitled meeting'),
    subtitle: record.subtitle || record.description || record.agenda || '',
    date: record.meeting_date || record.date || record.start_time || record.started_at || record.created_at || '—',
    time: record.time || [startTime, endTime].filter(Boolean).join(' – ') || '—',
    room: displayName(record.room_name) || '-',
    organizer: displayName(record.organizer_name) || '-',
    recording: statusFor(record.recording_status || record.recording_state, record.audio_url || record.recording_url),
    transcriptStatus: statusFor(record.transcript_status, transcript || record.transcript_url),
    summaryStatus: statusFor(record.summary_status, summary),
    transcript,
    summary,
    summaryMy: record.summary_my || record.ai_summary_my || record.summary?.myanmar || record.summary?.my || '',
    notes: record.notes || record.subtitle || record.description || record.agenda || '',
    actionItems: Array.isArray(record.action_items) ? record.action_items : Array.isArray(record.actionItems) ? record.actionItems : [],
    participants: Array.isArray(participants)
      ? participants.length || Number(record.participant_count || record.attendee_count) || 0
      : Number(record.participant_count || record.attendee_count || participants) || 0,
  };
};

const extractRecords = (response) => {
  let value = response;
  while (value && !Array.isArray(value)) {
    value = value.records || value.items || value.data || value.result;
  }
  return Array.isArray(value) ? value : [];
};

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
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('All');
  const [roomFilter, setRoomFilter] = useState('All');
  const [organizerFilter, setOrganizerFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    api.get('/meeting-records/', { baseURL: '/api/v1' })
      .then(({ data }) => {
        if (isActive) setRecords(extractRecords(data).filter(Boolean).map(normalizeRecord));
      })
      .catch((error) => {
        if (isActive) {
          const detail = error.response?.data?.detail;
          setError(typeof detail === 'string' ? detail : error.message || 'Unable to load meeting records.');
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => { isActive = false; };
  }, []);

  const searchQuery = search.trim().toLowerCase();
  const roomOptions = [...new Set(records.map((record) => record.room).filter((value) => value && value !== '-' && value !== '—'))].sort();
  const organizerOptions = [...new Set(records.map((record) => record.organizer).filter((value) => value && value !== '-' && value !== '—'))].sort();
  const now = new Date();
  const rangeDays = { 'Last 7 days': 7, 'Last 30 days': 30, 'Last 90 days': 90 }[dateRange];
  const filteredRecords = records.filter((record) => {
    const matchesSearch = !searchQuery || [record.title, record.room, record.organizer]
      .some((value) => value.toLowerCase().includes(searchQuery));
    const matchesRoom = roomFilter === 'All' || record.room === roomFilter;
    const matchesOrganizer = organizerFilter === 'All' || record.organizer === organizerFilter;
    const recordDate = new Date(record.date);
    const validDate = !Number.isNaN(recordDate.getTime());
    const matchesDate = dateRange === 'All' || (validDate && (dateRange === 'This year'
      ? recordDate.getFullYear() === now.getFullYear()
      : rangeDays && recordDate >= new Date(now.getTime() - rangeDays * 86400000) && recordDate <= now));
    return matchesSearch && matchesRoom && matchesOrganizer && matchesDate;
  });
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateRange, roomFilter, organizerFilter]);

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
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search title, room, or organizer" 
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search title, room, or organizer"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow placeholder:text-slate-400"
              />
            </div>
            <label className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl bg-white">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select aria-label="Date Range" value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="bg-transparent outline-none">
                {['All', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'].map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl bg-white">
              <MapPin className="w-4 h-4 text-slate-400" />
              <select aria-label="Room" value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)} className="bg-transparent outline-none max-w-36">
                <option value="All">All rooms</option>
                {roomOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl bg-white">
              <User className="w-4 h-4 text-slate-400" />
              <select aria-label="Organizer" value={organizerFilter} onChange={(event) => setOrganizerFilter(event.target.value)} className="bg-transparent outline-none max-w-36">
                <option value="All">All organizers</option>
                {organizerOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
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
              {isLoading ? (
                <tr><td colSpan="8" className="px-8 py-10 text-center text-sm text-slate-500">Loading meeting records…</td></tr>
              ) : error ? (
                <tr><td colSpan="8" role="alert" className="px-8 py-10 text-center text-sm text-rose-600">{error}</td></tr>
              ) : filteredRecords.length ? paginatedRecords.map((record) => (
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
                      <Calendar className="w-4 h-4 text-slate-400" /> {formatDate(record.date)}
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
                  <td className="px-6 py-4"><StatusBadge type={record.transcriptStatus} /></td>
                  <td className="px-6 py-4"><StatusBadge type={record.summaryStatus} /></td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-100/50 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="px-8 py-10 text-center text-sm text-slate-500">No meeting records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <p>
            Showing {filteredRecords.length ? (currentPage - 1) * itemsPerPage + 1 : 0}
            {'–'}{Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </p>
          <nav aria-label="Meeting records pagination" className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              &lt; Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`min-w-9 px-3 py-1.5 rounded-lg border ${currentPage === page ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next &gt;
            </button>
          </nav>
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
                  <h2 className="text-xl font-bold text-slate-900">{selectedRecord.title}</h2>
                  <p className="text-[13px] text-slate-500 mt-1 font-medium">{formatDate(selectedRecord.date)} <span className="mx-1.5 text-slate-300">•</span> {selectedRecord.time}</p>
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
                <StatusBadge type={statusFor(selectedRecord.status, selectedRecord.status)} />
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
                    <StatusBadge type={selectedRecord.summaryStatus} />
                  </div>
                  <p className="text-[14px] text-slate-600 leading-relaxed">
                    {selectedRecord.summary || 'No summary is available for this meeting.'}
                  </p>
                </div>
              </>
            )}

            {activeTab !== 'Overview' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-[15px] font-bold text-slate-900">{activeTab}</h3>
                {activeTab === 'Notes' && <p className="text-sm text-slate-600">{selectedRecord.notes || 'No notes are available.'}</p>}
                {activeTab === 'Recording' && (selectedRecord.audio_url || selectedRecord.recording_url
                  ? <audio controls className="w-full" src={selectedRecord.audio_url || selectedRecord.recording_url} />
                  : <p className="text-sm text-slate-500">No recording is available.</p>)}
                {activeTab === 'Transcript' && <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedRecord.transcript || 'No transcript is available.'}</p>}
                {activeTab === 'AI Summary' && (
                  <div className="space-y-4 text-sm text-slate-600">
                    <p className="whitespace-pre-wrap">{selectedRecord.summary || 'No English summary is available.'}</p>
                    <p className="whitespace-pre-wrap">{selectedRecord.summaryMy || 'No Myanmar summary is available.'}</p>
                    {Array.isArray(selectedRecord.key_decisions) && selectedRecord.key_decisions.length > 0 && (
                      <ul className="list-disc pl-5">{selectedRecord.key_decisions.map((decision, index) => <li key={index}>{displayName(decision) || String(decision)}</li>)}</ul>
                    )}
                  </div>
                )}
                {activeTab === 'Action Items' && (selectedRecord.actionItems.length
                  ? <ul className="space-y-3">{selectedRecord.actionItems.map((item, index) => (
                    <li key={item?.id || index} className="text-sm text-slate-700">
                      <span className="font-medium">{item?.task || item?.title || item?.description || String(item ?? '')}</span>
                      {(item?.owner || item?.assignee || item?.due_date || item?.dueDate) && (
                        <span className="block text-xs text-slate-500">{[displayName(item?.owner || item?.assignee), item?.due_date || item?.dueDate].filter(Boolean).join(' · ')}</span>
                      )}
                    </li>
                  ))}</ul>
                  : <p className="text-sm text-slate-500">No action items are available.</p>)}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

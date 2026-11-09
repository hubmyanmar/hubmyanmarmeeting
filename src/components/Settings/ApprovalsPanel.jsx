import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock3, MapPin, Check, X } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import api from '../../api';

const formatDateTime = (meeting) => {
  const date = new Date(meeting.meeting_date);
  const dateText = Number.isNaN(date.getTime())
    ? meeting.meeting_date
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatTime = (value) => String(value || '').slice(0, 5);
  return `${dateText}, ${formatTime(meeting.start_time)} – ${formatTime(meeting.end_time)}`;
};

export default function ApprovalsPanel({ currentUser }) {
  const disabled = currentUser?.role !== 'admin' && currentUser?.role !== 'approver';
  const [meetings, setMeetings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadApprovals = async () => {
      try {
        const [{ data: pendingMeetings }, { data: roomData }] = await Promise.all([
          api.get('/meetings/pending-approvals'),
          api.get('/meeting-rooms/'),
        ]);
        setMeetings(Array.isArray(pendingMeetings) ? pendingMeetings : []);
        setRooms(Array.isArray(roomData) ? roomData : []);
      } catch (requestError) {
        setError(requestError.response?.data?.detail || requestError.message || 'Failed to load pending approvals.');
      }
    };
    loadApprovals();
  }, []);

  const handleDecision = async (meetingId, approved) => {
    setError('');
    try {
      await api.post(`/meetings/${meetingId}/${approved ? 'approve' : 'reject'}`);
      setMeetings((current) => current.filter((meeting) => meeting.id !== meetingId));
      setNotice(approved
        ? 'Approved — the calendar is now blocked for this meeting.'
        : 'Rejected — the organizer will be notified.');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message || 'Unable to update meeting approval.');
    }
  };

  return (
    <>
      <SettingsPanelHeader
        title="Approvals"
        description="Meetings waiting for approval before they block the calendar."
        icon={ShieldCheck}
        badge="Admin / Approver"
      />

      {notice && (
        <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-5 text-emerald-800">
          {notice}
        </p>
      )}

      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-5 text-rose-800">{error}</p>}

      {meetings.length > 0 ? (
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <article key={meeting.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:p-5">
              <div className="min-w-0">
                <h3 className="break-words text-base font-semibold text-slate-900">{meeting.title}</h3>
                <p className="mt-1 text-sm text-slate-600">Organizer: {meeting.created_by_name}</p>
                <p className="mt-3 flex items-start gap-2 text-sm leading-5 text-slate-600">
                  <Clock3 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>{formatDateTime(meeting)}</span>
                </p>
                <p className="mt-1 flex items-start gap-2 text-sm leading-5 text-slate-600">
                  <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>{meeting.room_id ? (rooms.find((room) => Number(room.id) === Number(meeting.room_id))?.name || rooms.find((room) => Number(room.id) === Number(meeting.room_id))?.room_name || `Room ${meeting.room_id}`) : 'Online'}</span>
                </p>
              </div>

              <div className="flex w-full gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDecision(meeting.id, true)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#564BFF] px-3 text-sm font-semibold text-white hover:bg-[#4539ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check aria-hidden="true" className="h-4 w-4" /> Approve
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDecision(meeting.id, false)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-300 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X aria-hidden="true" className="h-4 w-4" /> Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-600">
          No meetings waiting for approval.
        </div>
      )}
    </>
  );
}

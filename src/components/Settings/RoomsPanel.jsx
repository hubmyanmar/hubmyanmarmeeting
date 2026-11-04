import React, { useState } from 'react';
import { DoorClosed, Plus, Pencil, Trash2 } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsField from './SettingsField';
import SettingsBadge from './SettingsBadge';

const initialRooms = [
  { id: 1, name: 'MD Room', capacity: 10 },
  { id: 2, name: 'Room 1', capacity: 6 },
  { id: 3, name: 'Room 2', capacity: 4 },
];

export default function RoomsPanel() {
  const [rooms, setRooms] = useState(initialRooms);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const openAddForm = () => {
    setEditingRoomId(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEditForm = (room) => {
    setEditingRoomId(room.id);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingRoomId(null);
  };

  const saveRoom = (event) => {
    event.preventDefault();
    const [nameInput, capacityInput] = event.currentTarget.querySelectorAll('input');
    const name = String(nameInput?.value || '').trim();
    const capacity = Number(capacityInput?.value);
    if (!name || !Number.isFinite(capacity) || capacity < 1) return;

    if (editingRoomId !== null) {
      setRooms((current) => current.map((room) => room.id === editingRoomId ? { ...room, name, capacity } : room));
    } else {
      setRooms((current) => [...current, { id: Date.now(), name, capacity }]);
    }
    closeForm();
  };

  const editingRoom = rooms.find((room) => room.id === editingRoomId);

  return (
    <>
      <SettingsPanelHeader title="Rooms" description="Meeting rooms that can be booked." icon={DoorClosed} />

      <div className="space-y-3">
        {rooms.map((room) => (
          <article key={room.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center">
            <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F0EFFF] text-[#564BFF] sm:grid">
              <DoorClosed aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="flex min-w-0 items-start gap-3 sm:flex-1">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F0EFFF] text-[#564BFF] sm:hidden">
                <DoorClosed aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="break-words font-semibold text-slate-900">{room.name}</h3>
                <SettingsBadge>Capacity {room.capacity}</SettingsBadge>
              </div>
            </div>

            {confirmDeleteId === room.id ? (
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <span className="mr-auto text-sm font-semibold text-slate-700 sm:mr-1">Delete?</span>
                <button type="button" onClick={() => { setRooms((current) => current.filter((item) => item.id !== room.id)); setConfirmDeleteId(null); }} className="min-h-11 flex-1 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white sm:flex-none">Yes</button>
                <button type="button" onClick={() => setConfirmDeleteId(null)} className="min-h-11 flex-1 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 sm:flex-none">Cancel</button>
              </div>
            ) : (
              <div className="flex w-full gap-2 sm:w-auto">
                <button type="button" onClick={() => openEditForm(room)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-none">
                  <Pencil aria-hidden="true" className="h-4 w-4" /> Edit
                </button>
                <button type="button" onClick={() => setConfirmDeleteId(room.id)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-50 sm:flex-none">
                  <Trash2 aria-hidden="true" className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {!formOpen && (
        <button type="button" onClick={openAddForm} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#564BFF] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4539ed]">
          <Plus aria-hidden="true" className="h-4 w-4" /> Add room
        </button>
      )}

      {formOpen && (
        <form key={formKey} onSubmit={saveRoom} className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <h3 className="mb-4 text-base font-bold text-slate-900">{editingRoom ? 'Edit room' : 'Add room'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Room name" value={editingRoom?.name || ''} placeholder="Enter room name" />
            <SettingsField label="Capacity" type="number" value={editingRoom?.capacity ?? ''} placeholder="Enter capacity" />
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeForm} className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 sm:w-auto">Cancel</button>
            <button type="submit" className="min-h-11 w-full rounded-lg bg-[#564BFF] px-5 text-sm font-semibold text-white sm:w-auto">Save</button>
          </div>
        </form>
      )}
    </>
  );
}

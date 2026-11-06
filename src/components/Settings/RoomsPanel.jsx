import React, { useCallback, useEffect, useState } from 'react';
import { DoorClosed, Plus, Pencil, Trash2 } from 'lucide-react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsField from './SettingsField';
import SettingsBadge from './SettingsBadge';
import api from '../../api';

export default function RoomsPanel({ currentUser }) {
  const disabled = currentUser?.role !== 'admin';
  const [rooms, setRooms] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState('');

  const loadRooms = useCallback(async () => {
    try {
      const { data } = await api.get('/meeting-rooms/');
      setRooms((Array.isArray(data) ? data : []).map((room) => ({ ...room, devices: room.devices || [] })));
    } catch (loadError) {
      setError(loadError.response?.data?.detail || loadError.message || 'Unable to load rooms.');
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

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

  const saveRoom = async (event) => {
    event.preventDefault();
    const [nameInput, capacityInput, devicesInput] = event.currentTarget.querySelectorAll('input');
    const name = String(nameInput?.value || '').trim();
    const capacity = Number(capacityInput?.value);
    const devices = String(devicesInput?.value || '').split(',').map((device) => device.trim()).filter(Boolean);
    if (!name || !Number.isFinite(capacity) || capacity < 1) return;

    setError('');
    try {
      const payload = { name, capacity: Number(capacity), devices };
      if (editingRoomId !== null) {
        await api.put(`/meeting-rooms/${editingRoomId}`, payload);
      } else {
        await api.post('/meeting-rooms/', payload);
      }
      closeForm();
      await loadRooms();
    } catch (saveError) {
      setError(saveError.response?.data?.detail || saveError.message || 'Unable to save room.');
    }
  };

  const deleteRoom = async (roomId) => {
    setError('');
    try {
      await api.delete(`/meeting-rooms/${roomId}`);
      setConfirmDeleteId(null);
      await loadRooms();
    } catch (deleteError) {
      setError(deleteError.response?.data?.detail || deleteError.message || 'Unable to delete room.');
    }
  };

  const editingRoom = rooms.find((room) => room.id === editingRoomId);

  return (
    <>
      <SettingsPanelHeader title="Rooms" description="Meeting rooms that can be booked." icon={DoorClosed} />

      {error && <p role="alert" className="mb-4 text-sm text-rose-600">{error}</p>}

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
                {room.devices?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {room.devices.map((device) => <SettingsBadge key={device}>{device}</SettingsBadge>)}
                  </div>
                )}
              </div>
            </div>

            {confirmDeleteId === room.id ? (
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <span className="mr-auto text-sm font-semibold text-slate-700 sm:mr-1">Delete?</span>
                <button type="button" onClick={() => deleteRoom(room.id)} disabled={disabled} className="min-h-11 flex-1 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white disabled:opacity-50 sm:flex-none">Yes</button>
                <button type="button" onClick={() => setConfirmDeleteId(null)} className="min-h-11 flex-1 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 sm:flex-none">Cancel</button>
              </div>
            ) : (
              <div className="flex w-full gap-2 sm:w-auto">
                <button type="button" onClick={() => openEditForm(room)} disabled={disabled} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:flex-none">
                  <Pencil aria-hidden="true" className="h-4 w-4" /> Edit
                </button>
                <button type="button" onClick={() => setConfirmDeleteId(room.id)} disabled={disabled} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50 sm:flex-none">
                  <Trash2 aria-hidden="true" className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {!formOpen && (
        <button type="button" onClick={openAddForm} disabled={disabled} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#564BFF] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4539ed] disabled:opacity-50">
          <Plus aria-hidden="true" className="h-4 w-4" /> Add room
        </button>
      )}

      {formOpen && (
        <form key={formKey} onSubmit={saveRoom} className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <h3 className="mb-4 text-base font-bold text-slate-900">{editingRoom ? 'Edit room' : 'Add room'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Room name" value={editingRoom?.name || ''} placeholder="Enter room name" />
            <SettingsField label="Capacity" type="number" value={editingRoom?.capacity ?? ''} placeholder="Enter capacity" />
            <div className="sm:col-span-2">
              <SettingsField label="Devices" value={editingRoom?.devices?.join(', ') || ''} placeholder="Projector 4K, Smart TV, Whiteboard" />
            </div>
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

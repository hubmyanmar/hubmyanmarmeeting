import React, { useRef, useState } from 'react';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsField from './SettingsField';
import SettingsBadge from './SettingsBadge';
import api from '../../api';

export default function ProfilePanel({ currentUser, profileImage, setProfileImage }) {
  const user = Array.isArray(currentUser) ? currentUser[0] : currentUser;
  const name = user?.name || user?.fullName || '';
  const position = user?.position || '';
  const email = user?.email || '';
  const role = user?.role || 'Member';
  const [saving, setSaving] = useState(false);
  const [stagedPhoto, setStagedPhoto] = useState(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const displayName = user?.name || user?.fullName || 'User';

  const handlePhotoSelection = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setStagedPhoto(reader.result);
      setSaved(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const [nameInput, positionInput] = formRef.current.querySelectorAll('input[type="text"]');
    const updatedName = nameInput?.value ?? name;
    const updatedPosition = positionInput?.value ?? position;

    setSaving(true);
    setSaved(false);
    try {
      if (stagedPhoto) {
        setProfileImage(stagedPhoto);
        localStorage.setItem('savedProfileImage', stagedPhoto);
        await api.patch('/auth/update-image', { image: stagedPhoto });
        setStagedPhoto(null);
      }

      if (user?.id !== undefined && user?.id !== null) {
        await api.put(`/users/${user.id}`, { name: updatedName, position: updatedPosition });
      }

      setSaved(true);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const photoAction = (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handlePhotoSelection}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={saving}
        aria-label="Change profile photo"
        title="Change profile photo"
        className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 disabled:cursor-wait"
      >
        <img
          src={stagedPhoto || profileImage || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%234f46e5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="16" font-family="sans-serif">${displayName.charAt(0).toUpperCase()}</text></svg>`}
          alt="Profile photo"
          className="h-full w-full object-cover"
        />
      </button>
    </>
  );

  return (
    <>
      <SettingsPanelHeader
        title="Profile"
        description="Your account information."
        titleAction={photoAction}
      />

      <form ref={formRef} onSubmit={handleSave}>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Name" value={name} placeholder="Name" />
          <SettingsField label="Position" value={position} placeholder="Position" />

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-700">Email</h3>
            <p className="mt-1.5 min-h-11 break-all rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">{email}</p>
            <p className="mt-1 text-xs leading-4 text-slate-500">Email cannot be changed here.</p>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-700">Role</h3>
            <div className="mt-1.5 min-h-11"><SettingsBadge>{role}</SettingsBadge></div>
            <p className="mt-1 text-xs leading-4 text-slate-500">Roles are managed in Access &amp; roles.</p>
          </div>
        </div>

        <div className="mt-5">
          <button
            type="submit"
            disabled={saving}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#564BFF] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4539ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <p role="status" className="mt-2 text-sm font-medium text-emerald-700">Saved</p>}
        </div>
      </form>
    </>
  );
}

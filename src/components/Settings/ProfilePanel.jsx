import React, { useRef, useState } from 'react';
import { UserRound } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const displayName = user?.name || user?.fullName || 'User';

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;

      setProfileImage(base64String);
      localStorage.setItem('savedProfileImage', base64String);

      try {
        setUploading(true);
        await api.patch('/auth/update-image', { image: base64String });
      } catch (err) {
        console.error('Error uploading image:', err);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <>
      <SettingsPanelHeader
        title="Profile"
        description="Your account information."
        icon={UserRound}
      />

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile photo"
          title="Change profile photo"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2 disabled:cursor-wait"
        >
          <img
            src={profileImage || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%234f46e5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="16" font-family="sans-serif">${displayName.charAt(0).toUpperCase()}</text></svg>`}
            alt="Profile"
            className={`h-20 w-20 rounded-full border border-gray-200 object-cover shadow-sm transition-opacity ${uploading ? 'opacity-50' : 'hover:opacity-80'}`}
          />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Change photo'}
        </button>
      </div>

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

      <button
        type="button"
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#564BFF] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4539ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2"
      >
        Save changes
      </button>
    </>
  );
}

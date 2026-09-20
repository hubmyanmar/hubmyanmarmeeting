import React, { useRef, useState } from 'react';
import { Bell } from 'lucide-react';

export default function Header({ user, profileImage, setProfileImage }) {
  const displayName = user?.name || user?.fullName || "User";
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

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
        const token = localStorage.getItem('access_token');
        
        const response = await fetch('http://localhost:8000/api/v1/auth/update-image', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64String })
        });

        if (!response.ok) {
          console.error('Failed to update image on server');
        }
      } catch (err) {
        console.error('Error uploading image:', err);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <header className="h-[76px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          မင်္ဂလာပါ {displayName} <span>👋</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">Welcome back to Meeting Hub</p>
      </div>
      <div className="flex items-center gap-6">
        <span className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-gray-600 bg-white shadow-sm">
          {today}
        </span>
        <button className="relative text-gray-400 hover:text-gray-600">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden" 
          />
          <img 
            src={profileImage || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%236366f1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="16" font-family="sans-serif">${displayName.charAt(0).toUpperCase()}</text></svg>`} 
            alt="Profile" 
            onClick={() => fileInputRef.current.click()}
            className={`w-10 h-10 rounded-full border border-gray-300 shadow-sm cursor-pointer object-cover hover:opacity-80 transition-opacity ${uploading ? 'opacity-50' : ''}`} 
            title="Upload Profile Picture"
          />
        </div>
      </div>
    </header>
  );
}
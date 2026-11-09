import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from '../api';

export default function Header({ user, profileImage, setProfileImage }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const displayName = user?.name || user?.fullName || "User";
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // Keep the previous notification state if the request fails.
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markNotificationRead = async (notification) => {
    if (notification.is_read) return;
    try {
      const { data: updatedNotification } = await api.patch(`/notifications/${notification.id}/read`);
      setNotifications((current) => current.map((item) => item.id === notification.id ? updatedNotification : item));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      // Keep the previous notification state if the request fails.
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Keep the previous notification state if the request fails.
    }
  };
  
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
      <div className="flex sm:hidden items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-orange-100/80 flex items-center justify-center shrink-0">
          <img 
            src="/hubmyanmar.jpg" 
            alt="HUB Myanmar Logo" 
            className="w-8 h-8 object-contain rounded" 
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-900 leading-tight">Hub Myanmar</span>
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase leading-tight">MEETING HUB</span>
        </div>
      </div>
      <div className="hidden sm:block"></div>
      <div className="flex items-center gap-3 sm:gap-6">
        <span className="hidden sm:inline-block px-3 py-1 border border-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-600 bg-white shadow-sm">
          {today}
        </span>

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => {
              const nextOpen = !notificationsOpen;
              setNotificationsOpen(nextOpen);
              if (nextOpen) fetchNotifications();
            }}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            className="relative p-1 text-gray-400 hover:text-gray-600"
          >
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-lg z-20">
              <div className="sticky top-0 flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                  <button type="button" onClick={markAllNotificationsRead} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    Mark all as read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-center text-gray-500">No notifications</p>
              ) : (
                [...notifications]
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markNotificationRead(notification)}
                      className={`block w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${notification.is_read ? 'bg-white' : 'bg-indigo-50/60'}`}
                    >
                      <span className={`block text-sm text-gray-900 ${notification.is_read ? 'font-medium' : 'font-bold'}`}>{notification.title}</span>
                      <span className="mt-1 block text-xs text-gray-600">{notification.body}</span>
                      <span className="mt-1.5 block text-[11px] text-gray-400">
                        {new Date(notification.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </button>
                  ))
              )}
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => navigate('/dashboard/settings', { state: { settingsPanel: 'profile' } })}
            aria-label="Open profile settings"
            title="Open profile settings"
            className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#564BFF] focus-visible:ring-offset-2"
          >
            <img
              src={profileImage || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%234f46e5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="16" font-family="sans-serif">${displayName.charAt(0).toUpperCase()}</text></svg>`}
              alt="Profile"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 shadow-sm cursor-pointer object-cover hover:opacity-80 transition-opacity"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

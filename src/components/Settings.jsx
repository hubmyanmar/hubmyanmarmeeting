import React, { useState } from 'react';
import { 
  User, 
  DoorClosed, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Link as LinkIcon, 
  Bell, 
  FileText, 
  Users, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  MessageSquare, 
  CheckSquare, 
  Save,
  Mail
} from 'lucide-react';

export default function Settings() {
  const [activeView, setActiveView] = useState('main');
  const [adminApproval, setAdminApproval] = useState(true);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {activeView === 'main' ? (
        <div>
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Settings</h2>
            <p className="text-sm sm:text-base text-slate-500 mt-1">Manage your account and meeting preferences</p>
          </div>
          <div className="bg-gradient-to-r from-indigo-50/60 via-purple-50/30 to-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-100/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl sm:text-2xl font-semibold shadow-inner">
                N
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">Naing Lin Oo</h3>
                  <span className="px-2.5 py-0.5 bg-indigo-100/80 text-indigo-700 text-xs font-semibold rounded-full">Admin</span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm truncate">Group Sr. Business Development Manager</p>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs sm:text-sm mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">naing.lin.oo@hubmyanmar.com</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 hidden sm:block shrink-0 mr-2" />
          </div>

          {/* Settings Options List */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            
            {/* Profile */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Profile</h4>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">View and update your personal information</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            </div>

            {/* Rooms */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <DoorClosed className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Rooms</h4>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">Manage meeting rooms and locations</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            </div>

            {/* Booking Rules */}
            <div 
              onClick={() => setActiveView('booking-rules')}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition cursor-pointer gap-3"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Booking Rules</h4>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">Set rules for meeting bookings and calendar blocking</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            </div>

            {/* Approvals */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Approvals</h4>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">Manage approval workflows</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] sm:text-xs font-medium rounded-full">Admin Only</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
            </div>

            {/* Calendar Integrations */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Calendar Integrations</h4>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">Connect your calendar and sync meetings</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] sm:text-xs font-medium rounded-full">Admin Only</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
            </div>

            {/* Notifications */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Notifications</h4>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">Configure your notification preferences</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            </div>

            {/* Meeting Records */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Meeting Records</h4>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">Access and manage your meeting recordings</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] sm:text-xs font-medium rounded-full">Admin Only</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
            </div>

            {/* Access & Roles */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Access & Roles</h4>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">Manage team access and permissions</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] sm:text-xs font-medium rounded-full">Admin Only</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ဒုတိယပုံစံ - Booking Rules Detail View */
        <div>
          {/* Header with Back Button */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button 
                onClick={() => setActiveView('main')}
                className="w-10 h-10 shrink-0 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Booking Rules</h2>
                <p className="text-xs sm:text-sm text-slate-500 truncate">Configure rules for meeting bookings and calendar blocking.</p>
              </div>
            </div>
            <span className="self-start sm:self-center px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full shrink-0">Admin Only</span>
          </div>

          {/* Sub Content Box */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100 mb-8">
            
            {/* Toggle Item */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/40 transition gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl flex items-center justify-center ${adminApproval ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Admin approval required before calendar blocking</h4>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">Meetings must be approved by an admin before they block the calendar.</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={adminApproval} 
                onChange={() => setAdminApproval(!adminApproval)}
                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
              />
            </div>

            {/* Working hours */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/40 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Working hours</h4>
                  <p className="text-xs sm:text-sm text-slate-500">09:00 AM – 06:00 PM</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            </div>

            {/* Required approver role */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/40 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Required approver role</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Department Head</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            </div>

            {/* Notification channel */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/40 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Notification channel</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Email + In-app</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            </div>

            {/* Calendar integration status */}
            <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/40 transition cursor-pointer gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900">Calendar integration status</h4>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] sm:text-xs font-semibold rounded-full border border-amber-200">
                  Needs Attention
                </span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
            </div>

          </div>

          {/* Save Changes Button Footer */}
          <div className="flex justify-center">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition">
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
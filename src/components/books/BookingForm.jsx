import React, { useState, useRef, useEffect, useCallback } from 'react';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return "";
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatTo12Hour = (time24) => { 
  if (!time24) return "";
  const [h, m] = time24.split(":");
  let hours = parseInt(h, 10);
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  return `${formattedHours}:${m} ${suffix}`;
};

const formatTo24Hour = (time12) => { 
  if (!time12) return "";
  const parts = time12.trim().split(" ");
  if (parts.length < 2) return time12;
  let [h, m] = parts[0].split(":");
  let hours = parseInt(h, 10);
  const modifier = parts[1].toUpperCase();
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${hours < 10 ? "0" + hours : hours}:${m}`;
};

const parseTime = (timeStr) => { 
  if (!timeStr) return 0;
  const upper = timeStr.trim().toUpperCase();
  let hours = 0, minutes = 0;
  if (upper.includes('AM') || upper.includes('PM')) {
    const isPM = upper.includes('PM');
    const isAM = upper.includes('AM');
    const [h, m] = upper.replace('AM', '').replace('PM', '').trim().split(':');
    hours = parseInt(h, 10) || 0;
    minutes = parseInt(m, 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
  } else {
    const [h, m] = upper.split(':');
    hours = parseInt(h, 10) || 0;
    minutes = parseInt(m, 10) || 0;
  }
  return hours * 60 + minutes;
};

export default function BookingForm({ data, setData, onBook, onClear, isLoading, bookedMeetings = [] }) {
  const [rooms, setRooms] = useState([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [roomError, setRoomError] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(true);
  const [companyError, setCompanyError] = useState(null);

  const [availableUsers, setAvailableUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  const [inviteeInput, setInviteeInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const dropdownRef = useRef(null);

  const [companyInput, setCompanyInput] = useState("");
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const companyDropdownRef = useRef(null);

  const userStart = parseTime(data?.startTime || "09:00 AM");
  const userEnd = parseTime(data?.endTime || "10:00 AM");

  const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://192.168.57.191:8000';
  
  const fetchRooms = useCallback(async (abortSignal) => {
    setIsRoomsLoading(true);
    setRoomError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/meeting-rooms/`, { signal: abortSignal });
      if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
      const roomData = await res.json();
      setRooms(Array.isArray(roomData) ? roomData : []);
    } catch (error) {
      if (error.name === 'AbortError') return;
      setRoomError("Meeting Room များကို ယူ၍မရပါ။ Server ချိတ်ဆက်မှုကို စစ်ဆေးပါ။");
    } finally {
      setIsRoomsLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchCompanies = useCallback(async (abortSignal) => {
    setIsCompaniesLoading(true);
    setCompanyError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/companies/`, { signal: abortSignal });
      if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
      const companyData = await res.json();
      setCompanies(Array.isArray(companyData) ? companyData : []);
    } catch (error) {
      if (error.name === 'AbortError') return;
      setCompanyError("Company စာရင်းကို ယူ၍မရပါ။");
    } finally {
      setIsCompaniesLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchUsers = useCallback(async (abortSignal) => {
    setIsUsersLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/users`, { signal: abortSignal });
      if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
      const userData = await res.json();
      setAvailableUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      if (error.name === 'AbortError') return;
    } finally {
      setIsUsersLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const controller = new AbortController();
    fetchRooms(controller.signal);
    fetchCompanies(controller.signal);
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, [fetchRooms, fetchCompanies, fetchUsers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowSuggestions(false);
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) setShowCompanySuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isRoomBlocked = (roomIdentifier, roomName) => {
    const validBookings = bookedMeetings || [];
    const roomBookings = validBookings.filter(b => {
      const isSameRoom = b.room === roomName || b.room_id === Number(roomIdentifier);
      const bookingDate = b.meeting_date || b.date;
      const isSameDate = !data?.date || !bookingDate || bookingDate === data?.date;
      return isSameRoom && isSameDate;
    });

    return roomBookings.some(b => {
      const bStart = parseTime(b.start_time || b.startTime);
      const bEnd = parseTime(b.end_time || b.endTime);
      return userStart < bEnd && userEnd > bStart;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'meetingType' && (value === 'face to face' || value === 'Face to Face') ? { platform: "" } : {})
    }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const formatted12Hour = formatTo12Hour(value);
    setData(prev => ({ ...prev, [name]: formatted12Hour }));
  };

  const handleSelectParticipant = (user) => {
    const isAlreadyAdded = data?.participants?.some(p => p.email === user.email);
    if (!isAlreadyAdded) {
      const participantPayload = {
        zoho_user_id: String(user.zuid || user.zoho_user_id || user.id || ""),
        name: user.name || "",
        email: user.email || ""
      };
      setData(prev => ({
        ...prev,
        participants: [...(prev?.participants || []), participantPayload]
      }));
    }
    setInviteeInput("");
    setShowSuggestions(false);
  };
  
  const handleAddParticipantEnter = (e) => {
    if (e.key === 'Enter' && inviteeInput.trim()) {
      e.preventDefault();
      const matchedUser = availableUsers.find(
        u => u.name?.toLowerCase() === inviteeInput.trim().toLowerCase() || 
             u.email?.toLowerCase() === inviteeInput.trim().toLowerCase()
      );
      if (matchedUser) {
        handleSelectParticipant(matchedUser);
      } else {
        handleSelectParticipant({ name: inviteeInput.trim(), email: inviteeInput.trim() });
      }
    }
  };

  const handleRemoveParticipant = (indexToRemove) => {
    setData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, index) => index !== indexToRemove)
    }));
  };

  const displayCount = 5;
  const visibleParticipants = data?.participants?.slice(0, displayCount) || [];
  const remainingCount = (data?.participants?.length || 0) - displayCount;

  const availableSuggestions = availableUsers.filter(user => {
    const userName = user.name || "";
    const userEmail = user.email || "";
    const isMatch = userName.toLowerCase().includes(inviteeInput.toLowerCase()) || 
                    userEmail.toLowerCase().includes(inviteeInput.toLowerCase());
    const isAlreadyAdded = (data?.participants || []).some(p => p.email === userEmail);
    return isMatch && !isAlreadyAdded;
  });

  const availableCompanySuggestions = companies.filter(companyName =>
    companyName.toLowerCase().includes(companyInput.toLowerCase())
  );

  const isOnlineMeeting = data?.meetingType?.toLowerCase() === "online";

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-5 flex flex-col gap-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
          Meeting Title <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" name="title" value={data?.title || ""} onChange={handleChange}
          placeholder="e.g. BD Strategy Discussion"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/40 text-gray-800 placeholder-gray-400 transition-all"
        />
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">Purpose / Agenda</label>
        <input 
          type="text" name="purpose" value={data?.purpose || ""} onChange={handleChange}
          placeholder="e.g. Discuss about new partnership and Q2 plan"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/40 text-gray-800 placeholder-gray-400 transition-all"
        />
      </div>

      {/* Date & Time Section */}
      <div className="flex flex-col gap-3">
        {/* Date Row */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <input 
              type="date" name="date" value={data?.date || getTodayDate()} 
              min={getTodayDate()} 
              onChange={handleChange}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              style={{ colorScheme: "light" }} 
              className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/40 cursor-pointer text-gray-800 font-medium transition-all"
            />
          </div>
        </div>

        {/* Time Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Start Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">Start Time</label>
            <input 
              type="time" name="startTime" value={formatTo24Hour(data?.startTime) || "09:00"} 
              onChange={handleTimeChange}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/40 text-gray-800 font-medium cursor-pointer transition-all"
            />
          </div>
          
          {/* End Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">End Time</label>
            <input 
              type="time" name="endTime" value={formatTo24Hour(data?.endTime) || "10:00"} 
              onChange={handleTimeChange}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/40 text-gray-800 font-medium cursor-pointer transition-all"
            />
          </div>
        </div>
      </div>

      {/* Meeting Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
            Meeting Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select 
              name="meetingType" 
              value={data?.meetingType ? data.meetingType.toLowerCase() : "face to face"} 
              onChange={handleChange} 
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/40 cursor-pointer appearance-none text-gray-800 transition-all pr-8"
            >
              <option value="face to face">Face to Face</option>
              <option value="online">Online</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {isOnlineMeeting && (
          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
              Platform <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                name="platform" value={data?.platform || ""} onChange={handleChange} 
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/40 cursor-pointer appearance-none text-gray-800 transition-all pr-8"
              >
                <option value="" disabled>Select Platform</option>
                <option value="Zoom">Zoom</option>
                <option value="Zoho Cliq">Zoho Cliq</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Room Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
          Meeting Room {isOnlineMeeting ? (
            <span className="text-gray-400 font-normal lowercase">(optional)</span>
          ) : (
            <span className="text-red-500">*</span>
          )}
        </label>

        <div className="relative">
          <select 
            name="room" value={data?.room || ""} onChange={handleChange} 
            disabled={isRoomsLoading || !!roomError}
            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50/40 cursor-pointer appearance-none pr-8 transition-all disabled:bg-gray-100 ${
              roomError ? 'border-red-300 focus:ring-red-500/20 text-red-600' : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800'
            }`}
          >
            {isRoomsLoading && <option value="">Loading rooms...</option>}
            {roomError && <option value="" disabled>{roomError}</option>}
            {!isRoomsLoading && !roomError && rooms.length === 0 && <option value="" disabled>No rooms available</option>}
            {!isRoomsLoading && !roomError && rooms.length > 0 && <option value="">Select a Room</option>}

            {!isRoomsLoading && !roomError && rooms.map((room) => {
              const roomName = room.name || room.room_name || `Room ${room.id}`;
              const blocked = isRoomBlocked(room.id, roomName);
              return (
                <option key={room.id} value={room.id} disabled={blocked}>
                  {roomName} {blocked ? "(Unavailable at this time)" : ""}
                </option>
              );
            })}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
      
      {/* Company Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
          Company Name <span className="text-red-500">*</span>
        </label>
        {data?.company && (
          <div className="flex items-center mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 shadow-2xs">
              {data.company}
              <button 
                type="button" onClick={() => setData(prev => ({ ...prev, company: "" }))}
                className="w-4 h-4 rounded-full hover:bg-indigo-200 text-indigo-500 flex items-center justify-center text-xs transition-colors"
              >&times;</button>
            </span>
          </div>
        )}

        <div className="relative" ref={companyDropdownRef}>
          <input 
            type="text" 
            placeholder={isCompaniesLoading ? "Loading companies..." : "Search or select company..."}
            value={companyInput}
            disabled={isCompaniesLoading || !!companyError}
            onChange={(e) => {
              setCompanyInput(e.target.value);
              setShowCompanySuggestions(true);
            }}
            onFocus={() => setShowCompanySuggestions(true)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/40 text-gray-800 placeholder-gray-400 transition-all"
          />
          {showCompanySuggestions && availableCompanySuggestions.length > 0 && (
            <ul className="absolute z-30 w-full bg-white border border-gray-100 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto divide-y divide-gray-50">
              {availableCompanySuggestions.map((companyName, idx) => (
                <li 
                  key={idx} 
                  onClick={() => {
                    setData(prev => ({ ...prev, company: companyName }));
                    setCompanyInput("");
                    setShowCompanySuggestions(false);
                  }}
                  className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors"
                >
                  {companyName}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Participants */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">Participants</label>
        
        {data?.participants?.length > 0 && (
          <div className="flex items-center mb-2.5 -space-x-2">
            {visibleParticipants.map((p, i) => (
              <div key={i} className="relative group cursor-pointer z-10 hover:z-20 transition-transform hover:-translate-y-0.5" title={p.name}>
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold border-2 border-white shadow-2xs">
                  {getInitials(p.name)}
                </div>
                <button 
                  onClick={() => handleRemoveParticipant(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 transition-opacity"
                >&times;</button>
              </div>
            ))}
            
            {remainingCount > 0 && (
              <div className="relative z-10 hover:z-20">
                <div 
                  onClick={() => setShowOverflow(!showOverflow)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium border-2 border-white shadow-2xs cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  +{remainingCount}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          <input 
            type="text" 
            placeholder={isUsersLoading ? "Loading users..." : "Add Invitees (Type or press Enter)..."}
            value={inviteeInput} disabled={isUsersLoading}
            onChange={(e) => { setInviteeInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleAddParticipantEnter}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/40 text-gray-800 placeholder-gray-400 transition-all"
          />
          
          {showSuggestions && availableSuggestions.length > 0 && (
            <ul className="absolute z-30 w-full bg-white border border-gray-100 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto divide-y divide-gray-50">
              {availableSuggestions.map((user, idx) => (
                <li 
                  key={idx} 
                  onClick={() => handleSelectParticipant(user)}
                  className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors"
                >
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Checkbox */}
      <div className="flex items-center gap-2.5 pt-1">
        <input 
          type="checkbox" id="invite-cliq" name="inviteCliq" checked={data?.inviteCliq || false} onChange={handleChange} 
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500/20 cursor-pointer accent-[#4F39F6]" 
        />
        <label htmlFor="invite-cliq" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Send invitation via Zoho Cliq</label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button 
          type="button" onClick={onClear} disabled={isLoading}
          className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          Clear
        </button>
        <button 
          type="button" onClick={onBook} disabled={isLoading}
          className="flex-1 py-3 bg-[#4F39F6] text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? 'Booking...' : 'Book Meeting'}
        </button>
      </div>
    </div>
  );
}

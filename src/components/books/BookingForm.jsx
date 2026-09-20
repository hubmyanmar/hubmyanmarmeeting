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

  const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';
  
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
    <div className="flex-1 flex flex-col gap-5 bg-white p-2">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Title <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" name="title" value={data?.title || ""} onChange={handleChange}
          placeholder="e.g. BD Strategy Discussion"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / Agenda</label>
        <input 
          type="text" name="purpose" value={data?.purpose || ""} onChange={handleChange}
          placeholder="e.g. Discuss about new partnership and Q2 plan"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Date & Time Row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            type="date" name="date" value={data?.date || getTodayDate()} 
            min={getTodayDate()} 
            onChange={handleChange}
            style={{ colorScheme: "light" }} 
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
          />
        </div>

        <div className="flex-[2]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <div className="flex items-center gap-2">
            <input 
              type="time" name="startTime" value={formatTo24Hour(data?.startTime) || "09:00"} onChange={handleTimeChange} 
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-medium cursor-pointer"
            />
            <span className="text-gray-500 text-sm">to</span>
            <input 
              type="time" name="endTime" value={formatTo24Hour(data?.endTime) || "10:00"} onChange={handleTimeChange} 
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-medium cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Meeting Type */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Type <span className="text-red-500">*</span>
          </label>
          <select 
            name="meetingType" 
            value={data?.meetingType ? data.meetingType.toLowerCase() : "face to face"} 
            onChange={handleChange} 
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
          >
            <option value="face to face">Face to Face</option>
            <option value="online">Online</option>
          </select>
        </div>

        {isOnlineMeeting && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform <span className="text-red-500">*</span>
            </label>
            <select 
              name="platform" value={data?.platform || ""} onChange={handleChange} 
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
            >
              <option value="" disabled>Select Platform</option>
              <option value="Zoom">Zoom</option>
              <option value="Zoho Cliq">Zoho Cliq</option>
              <option value="Other">Other</option>
            </select>
          </div>
        )}
      </div>

      {/* Meeting Room Dropdown */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Meeting Room {isOnlineMeeting ? (
              <span className="text-gray-400 font-normal">(Optional for Online)</span>
            ) : (
              <span className="text-red-500">*</span>
            )}
          </label>
        </div>

        <select 
          name="room" value={data?.room || ""} onChange={handleChange} 
          disabled={isRoomsLoading || !!roomError}
          className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white cursor-pointer disabled:bg-gray-100 ${
            roomError ? 'border-red-300 focus:ring-red-500 text-red-600' : 'border-gray-200 focus:ring-indigo-500'
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
      </div>
      
      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name <span className="text-red-500">*</span>
        </label>
        {data?.company && (
          <div className="flex items-center mb-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 shadow-sm">
              {data.company}
              <button 
                type="button" onClick={() => setData(prev => ({ ...prev, company: "" }))}
                className="w-4 h-4 rounded-full hover:bg-indigo-200 text-indigo-500 flex items-center justify-center text-xs"
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
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
          />
          {showCompanySuggestions && availableCompanySuggestions.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
              {availableCompanySuggestions.map((companyName, idx) => (
                <li 
                  key={idx} 
                  onClick={() => {
                    setData(prev => ({ ...prev, company: companyName }));
                    setCompanyInput("");
                    setShowCompanySuggestions(false);
                  }}
                  className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
        
        {data?.participants?.length > 0 && (
          <div className="flex items-center mb-3 -space-x-2">
            {visibleParticipants.map((p, i) => (
              <div key={i} className="relative group cursor-pointer z-10 hover:z-20" title={p.name}>
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                  {getInitials(p.name)}
                </div>
                <button 
                  onClick={() => handleRemoveParticipant(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center z-10"
                >&times;</button>
              </div>
            ))}
            
            {remainingCount > 0 && (
              <div className="relative z-10 hover:z-20">
                <div 
                  onClick={() => setShowOverflow(!showOverflow)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium border-2 border-white shadow-sm cursor-pointer hover:bg-gray-200"
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
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
          />
          
          {showSuggestions && availableSuggestions.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
              {availableSuggestions.map((user, idx) => (
                <li 
                  key={idx} 
                  onClick={() => handleSelectParticipant(user)}
                  className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Checkbox */}
      <div className="flex items-center gap-2 mt-1">
        <input 
          type="checkbox" id="invite-cliq" name="inviteCliq" checked={data?.inviteCliq || false} onChange={handleChange} 
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer" 
        />
        <label htmlFor="invite-cliq" className="text-sm text-gray-700 cursor-pointer select-none">Send invitation via Zoho Cliq</label>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-2">
        <button 
          type="button" onClick={onClear} disabled={isLoading}
          className="flex-1 py-2.5 border border-indigo-200 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition disabled:opacity-50"
        >
          Clear
        </button>
        <button 
          type="button" onClick={onBook} disabled={isLoading}
          className="flex-1 py-2.5 bg-[#4F39F6] text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
        >
          {isLoading ? 'Booking...' : 'Book Meeting'}
        </button>
      </div>
    </div>
  );
}
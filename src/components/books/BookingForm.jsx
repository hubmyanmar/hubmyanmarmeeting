import React, { useState, useRef, useEffect } from 'react';

const AVAILABLE_USERS = [
  { name: "Aung Aung", email: "aungaung@example.com" },
  { name: "Kyaw Kyaw", email: "kyawkyaw@example.com" },
  { name: "Su Su", email: "susu@example.com" },
  { name: "Mya Mya", email: "myamya@example.com" },
  { name: "Zayar Min", email: "zayarmin@example.com" },
  { name: "Thiri Tun", email: "thiritun@example.com" },
  { name: "Wai Yan", email: "waiyan@example.com" },
  { name: "Nilar Win", email: "nilarwin@example.com" },
  { name: "Kaung Myat", email: "kaungmyat@example.com" },
  { name: "Htet Htet", email: "htethtet@example.com" }
];

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

const INITIAL_FORM_STATE = {
  title: "",
  purpose: "",
  date: getTodayDate(), 
  startTime: "09:00 AM",
  endTime: "10:00 AM",
  room: "",
  participants: [],
  inviteCliq: false
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

export default function BookingForm({ data, setData, onBook, onClear, bookedMeetings = [] }) {
  const rooms = ["MD Room", "Bagan Room", "Konbaung Room", "BOD Home"];
  const sampleBookings = bookedMeetings.length > 0 ? bookedMeetings : [
    { room: "Bagan Room", startTime: "09:00 AM", endTime: "10:30 AM" },
    { room: "Bagan Room", startTime: "01:00 PM", endTime: "02:30 PM" },
    { room: "Meeting Room D", startTime: "10:00 AM", endTime: "11:30 AM" },
  ];

  const [inviteeInput, setInviteeInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const dropdownRef = useRef(null);

  const userStart = parseTime(data?.startTime || "09:00 AM");
  const userEnd = parseTime(data?.endTime || "10:00 AM");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isRoomBlocked = (roomName) => {
    const roomBookings = sampleBookings.filter(b => {
      const isSameRoom = b.room === roomName;
      const isSameDate = !data?.date || !b.date || b.date === data?.date;
      return isSameRoom && isSameDate;
    });
    return roomBookings.some(b => {
      const bStart = parseTime(b.startTime);
      const bEnd = parseTime(b.endTime);
      return userStart < bEnd && userEnd > bStart;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const formatted12Hour = formatTo12Hour(value);
    setData(prev => ({ ...prev, [name]: formatted12Hour }));
  };

  const handleSelectParticipant = (user) => {
    const isAlreadyAdded = data?.participants?.some(p => p.email === user.email);
    if (!isAlreadyAdded) {
      setData(prev => ({
        ...prev,
        participants: [...(prev?.participants || []), user]
      }));
    }
    setInviteeInput("");
    setShowSuggestions(false);
  };

  const handleAddParticipantEnter = (e) => {
    if (e.key === 'Enter' && inviteeInput.trim()) {
      e.preventDefault();
      const matchedUser = AVAILABLE_USERS.find(
        u => u.name.toLowerCase() === inviteeInput.trim().toLowerCase() || 
             u.email.toLowerCase() === inviteeInput.trim().toLowerCase()
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

  const handleClear = () => {
    setData(INITIAL_FORM_STATE);
    setInviteeInput("");
    setShowOverflow(false);
    if (onClear && typeof onClear === 'function') onClear();
  };

  const handleBookClick = () => {
    if (data?.date < getTodayDate()) {
      alert("Past dates cannot be selected for a meeting.");
      return;
    }

    if (onBook && typeof onBook === 'function') {
      onBook(data); 
      
      handleClear(); 
    }
  };

  const displayCount = 5;
  const visibleParticipants = data?.participants?.slice(0, displayCount) || [];
  const remainingCount = (data?.participants?.length || 0) - displayCount;

  // Search Filter
  const availableSuggestions = AVAILABLE_USERS.filter(user => {
    const isMatch = user.name.toLowerCase().includes(inviteeInput.toLowerCase()) || 
                    user.email.toLowerCase().includes(inviteeInput.toLowerCase());
    const isAlreadyAdded = (data?.participants || []).some(p => p.email === user.email);
    return isMatch && !isAlreadyAdded;
  });

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

      {/* Date & Time Row (Responsive) */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Date */}
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

        {/* Time */}
        <div className="flex-[2]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <div className="flex items-center gap-2">
            <input 
              type="time" name="startTime" value={formatTo24Hour(data?.startTime) || "10:00"} onChange={handleTimeChange} 
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-medium cursor-pointer"
            />
            <span className="text-gray-500 text-sm">to</span>
            <input 
              type="time" name="endTime" value={formatTo24Hour(data?.endTime) || "11:30"} onChange={handleTimeChange} 
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-medium cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Meeting Room */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Meeting Room <span className="text-red-500">*</span>
          </label>
          <button type="button" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Check Availability</button>
        </div>
        <select name="room" value={data?.room || ""} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer">
          <option value="">Select a Room</option>
          {rooms.map((roomName) => {
            const blocked = isRoomBlocked(roomName);
            return (
              <option key={roomName} value={roomName} disabled={blocked}>
                {roomName} {blocked ? "(Unavailable)" : ""}
              </option>
            );
          })}
        </select>
      </div>

      {/* Participants */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
        
        {/* Avatars Stack & Overflow Dropdown */}
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
                >
                  &times;
                </button>
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

                {showOverflow && (
                  <div className="absolute top-10 left-0 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 border-b border-gray-100 mb-1">
                      More Participants
                    </div>
                    <ul className="max-h-40 overflow-y-auto">
                      {data.participants.slice(displayCount).map((p, idx) => {
                        const actualIndex = displayCount + idx; 
                        return (
                          <li key={actualIndex} className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 group">
                            <div className="overflow-hidden flex-1">
                              <div className="text-sm font-medium text-gray-700 truncate">{p.name}</div>
                              <div className="text-xs text-gray-400 truncate">{p.email}</div>
                            </div>
                            <button 
                              onClick={() => {
                                handleRemoveParticipant(actualIndex);
                                if (remainingCount === 1) setShowOverflow(false);
                              }}
                              className="w-5 h-5 ml-2 flex items-center justify-center rounded-full text-red-500 hover:text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 shrink-0 transition-colors"
                            >
                              &times;
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Custom Dropdown Input */}
        <div className="relative" ref={dropdownRef}>
          <input 
            type="text" 
            placeholder="Add Invitees (Type or press Enter)..."
            value={inviteeInput}
            onChange={(e) => {
              setInviteeInput(e.target.value);
              setShowSuggestions(true);
            }}
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
                  className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors"
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
          type="button"
          onClick={handleClear} 
          className="flex-1 py-2.5 border border-indigo-200 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition"
        >
          Clear
        </button>
        <button 
          type="button"
          onClick={handleBookClick} 
          className="flex-1 py-2.5 bg-[#4F39F6] text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          Book Meeting
        </button>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import BookingForm from './books/BookingForm';
import RoomAvailability from './books/RoomAvailability';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialData = {
  title: "",
  purpose: "",
  company: "",
  date: getTodayDate(),
  startTime: "09:00 AM",
  endTime: "10:00 AM",
  meetingType: "Face to Face",
  platform: "",
  room: "",
  participants: [],
  inviteCliq: true
};

export default function BookMeeting({ setBookedMeetings, bookedMeetings = [], currentUser }) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedMeetings, setFetchedMeetings] = useState([]);
  const [rooms, setRooms] = useState([]);

  const API_BASE_URL = import.meta.env?.VITE_API_URL || 
    (typeof process !== 'undefined' ? process.env?.REACT_APP_API_URL : '') || 
    'http://localhost:8000';

  const showAlert = (icon, title, text) => {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: '#4F39F6',
      customClass: { popup: 'rounded-2xl' }
    });
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/meeting-rooms/`);
        if (res.ok) {
          const roomData = await res.json();
          setRooms(Array.isArray(roomData) ? roomData : []);
        }
      } catch (error) {
        console.error("Failed to fetch meeting rooms:", error);
      }
    };
    fetchRooms();
  }, [API_BASE_URL]);

  const fetchBookedMeetings = useCallback(async (selectedDate, abortSignal) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/meetings/?date=${selectedDate}`, { signal: abortSignal });
      if (res.ok) {
        const meetings = await res.json();
        const validMeetings = Array.isArray(meetings) ? meetings : [];
        setFetchedMeetings(validMeetings);
        if (typeof setBookedMeetings === 'function') {
          setBookedMeetings(validMeetings);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Failed to fetch booked meetings:", error);
      }
    }
  }, [API_BASE_URL, setBookedMeetings]);

  useEffect(() => {
    const controller = new AbortController();
    fetchBookedMeetings(data.date || getTodayDate(), controller.signal);
    return () => controller.abort();
  }, [data.date, fetchBookedMeetings]);

  const convertTo24Hour = (time12h) => {
    if (!time12h) return null;
    const [time, modifier] = time12h.split(' ');
    if (!time || !modifier) return time12h;
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = modifier === 'AM' ? '00' : '12';
    } else if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const handleBook = async () => {
    if (!data.title?.trim()) {
      showAlert('warning', 'လိုအပ်ချက်ရှိနေပါသည်', 'Meeting Title ဖြည့်ပေးပါ။');
      return;
    }
    if (!data.date) {
      showAlert('warning', 'လိုအပ်ချက်ရှိနေပါသည်', 'Meeting ပြုလုပ်မည့် Date ရွေးချယ်ပေးပါ။');
      return;
    }
    if (!data.company) {
      showAlert('warning', 'လိုအပ်ချက်ရှိနေပါသည်', 'Company Name ရွေးချယ်ပေးပါ။');
      return;
    }
    if (data.meetingType === "Face to Face" && !data.room) {
      showAlert('warning', 'လိုအပ်ချက်ရှိနေပါသည်', 'Meeting Room ရွေးချယ်ပေးပါ။');
      return;
    }
    if (data.meetingType === "Online" && !data.platform) {
      showAlert('warning', 'လိုအပ်ချက်ရှိနေပါသည်', 'Meeting Platform (e.g., Zoom) ရွေးချယ်ပေးပါ။');
      return;
    }

    const startTime24 = convertTo24Hour(data.startTime);
    const endTime24 = convertTo24Hour(data.endTime);

    const payload = {
      title: data.title.trim(),
      agenda: data.purpose ? data.purpose.trim() : null,
      company_name: data.company.trim(),
      meeting_date: data.date,
      start_time: startTime24.length === 5 ? `${startTime24}:00` : startTime24,
      end_time: endTime24.length === 5 ? `${endTime24}:00` : endTime24,
      meeting_type: data.meetingType.toLowerCase() === "face to face" ? "face to face" : "online",
      platform: data.meetingType.toLowerCase() === "online" ? (data.platform || null) : null,
      room_id: data.meetingType.toLowerCase() === "face to face" && data.room ? Number(data.room) : null,
      created_by: currentUser?.id || 1, 
      invite_cliq: Boolean(data.inviteCliq),
      participants: (data.participants || []).map(p => ({
        email: p.email,
        name: p.name || "",
        zoho_user_id: p.zoho_user_id ? String(p.zoho_user_id) : p.email
      })),
      participant_emails: (data.participants || []).map(p => p.email)
    };

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/meetings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const locationText = data.meetingType === "Online" ? `${data.platform} (Online)` : `Room ${data.room}`;
        showAlert(
          'success', 
          'အောင်မြင်ပါသည်!', 
          `${locationText} တွင် ${data.startTime} မှ ${data.endTime} အတွက် Booking တင်ပြီးပါပြီ။`
        );
        fetchBookedMeetings(data.date);
        handleClear();
      } else {
        const errorData = await response.json();
        showAlert(
          'error', 
          'Booking မအောင်မြင်ပါ', 
          errorData.detail || 'အချိန်တူနေပါသည် သို့မဟုတ် အချက်အလက် မှားယွင်းနေပါသည်။'
        );
      }
    } catch (error) {
      showAlert('error', 'Network Error!', 'Server သို့ ချိတ်ဆက်၍ မရပါ။');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setData(initialData);
  };

  const activeBookedMeetings = bookedMeetings.length > 0 ? bookedMeetings : fetchedMeetings;

  return (
    <div className="max-w-[1400px] mx-auto p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Book a Meeting</h2>
        <p className="text-gray-500 text-sm mt-0.5">Schedule a new meeting</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <BookingForm 
          data={data} 
          setData={setData} 
          onBook={handleBook} 
          onClear={handleClear}
          isLoading={isLoading} 
          bookedMeetings={activeBookedMeetings} 
          rooms={rooms}
        />
        <RoomAvailability 
          data={data} 
          setData={setData} 
          bookedMeetings={activeBookedMeetings} 
          rooms={rooms} 
        />
      </div>
    </div>
  );
}
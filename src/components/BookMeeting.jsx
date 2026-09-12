import React, { useState } from 'react';
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
  date: getTodayDate(),
  startTime: "09:00 AM",
  endTime: "10:00 AM",
  room: "",
  participants: [],
  inviteCliq: true
};

export default function BookMeeting({ setBookedMeetings }) {
  const [data, setData] = useState(initialData);

  const getStoredMeetings = () => {
    try {
      const saved = localStorage.getItem('bookedMeetings');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const [bookedMeetings, setLocalBookedMeetings] = useState(getStoredMeetings());

  const showAlert = (icon, title, text) => {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: '#4F39F6',
      customClass: { popup: 'rounded-2xl' }
    });
  };

  const handleBook = () => {
    // 1. Data Validations
    if (!data.title?.trim()) {
      showAlert('warning', 'လိုအပ်ချက်ရှိနေပါသည်', 'Meeting Title ဖြည့်ပေးပါ။');
      return;
    }
    if (!data.date) {
      showAlert('warning', 'လိုအပ်ချက်ရှိနေပါသည်', 'Meeting ပြုလုပ်မည့် Date ရွေးချယ်ပေးပါ။');
      return;
    }
    if (!data.room) {
      showAlert('warning', 'လိုအပ်ချက်ရှိနေပါသည်', 'Meeting Room ရွေးချယ်ပေးပါ။');
      return;
    }
    if (!data.company) {
      showAlert('warning', 'လိုအပ်ချက်ရှိနေပါသည်', 'Company Name ရွေးချယ်ပေးပါ။');
      return;
    }

    const newBooking = {
      title: data.title,
      purpose: data.purpose,
      room: data.room,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      participants: data.participants
    };

    const updatedMeetings = [...bookedMeetings, newBooking];
    setLocalBookedMeetings(updatedMeetings);
    localStorage.setItem('bookedMeetings', JSON.stringify(updatedMeetings));

    if (typeof setBookedMeetings === 'function') {
      setBookedMeetings(updatedMeetings);
    }
    
    showAlert(
      'success', 
      'အောင်မြင်ပါသည်!', 
      `${data.room} တွင် ${data.startTime} မှ ${data.endTime} အတွက် Booking ရရှိပါပြီ။`
    );

    handleClear();
  };

  const handleClear = () => {
    setData(initialData);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-gray-900">Book a Meeting</h2>
        <p className="text-gray-500 text-sm mt-0.5">Schedule a new meeting</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <BookingForm 
          data={data} 
          setData={setData} 
          onBook={handleBook} 
          onClear={handleClear} 
          bookedMeetings={bookedMeetings}
        />
        <RoomAvailability 
          data={data} 
          setData={setData} 
          bookedMeetings={bookedMeetings} 
        />
      </div>
    </div>
  );
}
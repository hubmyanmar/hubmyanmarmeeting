import React from 'react';

export default function BookMeeting() {
  return (
    <div className="max-w-[1100px] mx-auto p-2 font-sans">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">Book a Meeting</h2>
        <p className="text-gray-500 text-sm mt-0">Schedule a new meeting</p>
      </div>

      {/* Main Content: 2 Columns */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Form */}
        <div className="flex-1 flex flex-col gap-5 bg-white">
          
          {/* Meeting Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              defaultValue=""
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Purpose / Agenda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose / Agenda
            </label>
            <input 
              type="text"
              defaultValue=""
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative w-48">
              <input 
                type="text" 
                defaultValue="20 May 2025"
                className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <div className="flex items-center gap-4">
              <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none w-40 appearance-none bg-no-repeat bg-right" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundSize: '0.65rem auto', backgroundPosition: 'right 0.75rem center' }}>
                <option>10:00 AM</option>
              </select>
              <span className="text-gray-500 text-sm">to</span>
              <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none w-40 appearance-none bg-no-repeat bg-right" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundSize: '0.65rem auto', backgroundPosition: 'right 0.75rem center' }}>
                <option>11:30 AM</option>
              </select>
            </div>
          </div>

          {/* Meeting Room */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Meeting Room</label>
              <button className="text-indigo-600 text-sm hover:underline">Check Availability</button>
            </div>
            <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none appearance-none bg-no-repeat bg-right" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundSize: '0.65rem auto', backgroundPosition: 'right 1rem center' }}>
              <option>Meeting Room A</option>
            </select>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-medium">
                  +5
                </div>
              </div>
            </div>
            <input 
              type="text" 
              placeholder="Add Invitees..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="invite-cliq" defaultChecked className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 accent-indigo-600" />
            <label htmlFor="invite-cliq" className="text-sm text-gray-700">Send invitation via Zoho Cliq</label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-4">
            <button className="flex-1 py-2.5 border border-indigo-200 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition">
              Clear
            </button>
            <button className="flex-1 py-2.5 bg-[#4F39F6] text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm border border-[#4F39F6]">
              Book Meeting
            </button>
          </div>

        </div>

        {/* Right Column - Room Availability */}
        <div className="flex-1 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Availability</h3>
          
          {/* Date Navigator */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mb-6">
            <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <span className="font-medium text-gray-700">20 May 2025</span>
            <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>

          {/* Rooms List */}
          <div className="space-y-6">
            
            {/* Room A */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <h4 className="font-medium text-gray-800 text-sm">Meeting Room A</h4>
                <span className="text-xs text-gray-400">Capacity 12</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">09:00</button>
                <button className="py-2 text-sm bg-green-100 border border-green-200 text-green-700 rounded-md">10:00</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">11:30</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">02:00</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">03:30</button>
              </div>
            </div>

            {/* Room B */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <h4 className="font-medium text-gray-800 text-sm">Meeting Room B</h4>
                <span className="text-xs text-gray-400">Capacity 8</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <button className="py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-400 cursor-not-allowed">09:00</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">10:00</button>
                <button className="py-2 text-sm bg-green-100 border border-green-200 text-green-700 rounded-md">11:30</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">02:00</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">03:30</button>
              </div>
            </div>

            {/* Room C */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <h4 className="font-medium text-gray-800 text-sm">Meeting Room C</h4>
                <span className="text-xs text-gray-400">Capacity 20</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">09:00</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">10:00</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">11:30</button>
                <button className="py-2 text-sm bg-green-100 border border-green-200 text-green-700 rounded-md">02:00</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">03:30</button>
              </div>
            </div>

            {/* Room D */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <h4 className="font-medium text-gray-800 text-sm">Meeting Room D</h4>
                <span className="text-xs text-gray-400">Capacity 6</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <button className="py-2 text-sm bg-red-50 border border-red-100 text-red-400 rounded-md cursor-not-allowed">09:00</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">10:00</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">11:30</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">02:00</button>
                <button className="py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-gray-300">03:30</button>
              </div>
            </div>

          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
              <span className="text-xs text-gray-500 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
              <span className="text-xs text-gray-500 font-medium">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
              <span className="text-xs text-gray-500 font-medium">Your Selection</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
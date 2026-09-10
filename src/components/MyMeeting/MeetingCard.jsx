import React from 'react';

export default function MeetingCard({ item }) {
  const avatarCount = item.avatars || item.avatarsCount || 3;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-gray-400 font-medium">{item.date}</span>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.statusColor}`}>
              {item.status}
            </span>
            <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mb-3">{item.title}</h3>

        {/* Time & Location */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100/80">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-gray-700">{item.time}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100/80">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="font-semibold text-gray-700">{item.location}</span>
          </div>
        </div>

        {/* Avatars */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {Array.from({ length: avatarCount }).map((_, i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/100?img=${item.id * 7 + i}`}
                alt="Participant"
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
            ))}
            {item.plus && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 text-gray-600 font-semibold text-xs flex items-center justify-center">
                {item.plus}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400 font-medium ml-1">{item.total}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 leading-relaxed mb-6">
          {item.desc}
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="flex items-center justify-center gap-2 py-2 px-4 bg-[#5538ee] hover:bg-[#482ee0] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          <span>Join</span>
        </button>
        <button type="button" className="flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/80 rounded-xl text-xs font-semibold transition-colors">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Details</span>
        </button>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
function ParticipantAvatar({ participant, index }) {
  const [hasError, setHasError] = useState(false);
  const name = typeof participant === 'string' ? participant : participant?.name || `User ${index + 1}`;
  const avatarUrl = typeof participant === 'object' ? participant?.avatar : null;
  const initial = name.trim().charAt(0).toUpperCase() || 'U';
  const bgColors = [
    'bg-indigo-500',
    'bg-purple-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500'
  ];
  const bgColor = bgColors[index % bgColors.length];

  return avatarUrl && !hasError ? (
    <img
      src={avatarUrl}
      alt={name}
      onError={() => setHasError(true)}
      className="w-7 h-7 rounded-full border-2 border-white object-cover"
    />
  ) : (
    <div
      title={name}
      className={`w-7 h-7 rounded-full border-2 border-white ${bgColor} text-white font-bold text-[10px] flex items-center justify-center select-none shadow-xs`}
    >
      {initial}
    </div>
  );
}

export default function MeetingCard({ item }) {
 
  const participantsList = Array.isArray(item.participantsList) && item.participantsList.length > 0
    ? item.participantsList
    : Array.from({ length: item.avatars || 1 }, (_, i) => `User ${i + 1}`);

  const displayParticipants = participantsList.slice(0, 3);
  const remainingCount = participantsList.length - 3;

  const getDynamicStatusLabel = (dateStr) => {
    if (item.status && item.status !== 'PENDING') {
      return item.status;
    }

    if (!dateStr) return 'PENDING';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meetingDate = new Date(dateStr);
    meetingDate.setHours(0, 0, 0, 0);

    const diffTime = meetingDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays > 1) {
      return `In ${diffDays} days`;
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else {
      return `${Math.abs(diffDays)} days ago`;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-gray-400 font-medium">{item.date}</span>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.statusColor || 'bg-indigo-50 text-indigo-700'}`}>
              {getDynamicStatusLabel(item.date)}
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

        {/* Avatars with Initial Fallback */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {displayParticipants.map((participant, i) => (
              <ParticipantAvatar key={i} participant={participant} index={i} />
            ))}

            {remainingCount > 0 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 text-gray-600 font-semibold text-[10px] flex items-center justify-center">
                +{remainingCount}
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

    </div>
  );
}
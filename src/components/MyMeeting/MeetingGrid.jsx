import React from 'react';
import MeetingCard from './MeetingCard';

export default function MeetingGrid({ meetings = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-y-4 lg:gap-y-3">
      {meetings.map((item) => (
        <MeetingCard key={item.id} item={item} />
      ))}
    </div>
  );
}

import React from 'react';
import MeetingCard from './MeetingCard';

export default function MeetingGrid({ meetings = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {meetings.map((item) => (
        <MeetingCard key={item.id} item={item} />
      ))}
    </div>
  );
}
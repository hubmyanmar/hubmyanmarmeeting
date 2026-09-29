import React from 'react';

export default function DashboardHeader({ currentUser }) {
  let userObj = currentUser;
  if (Array.isArray(userObj)) {
    userObj = userObj[0] || {};
  }
  const displayName = userObj?.name || userObj?.fullName || userObj?.username || userObj?.user_name || "";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  return (
    <div className="pb-1">
      <h1 className="text-xl font-bold text-gray-900 tracking-tight">
        {getGreeting()}, {displayName}
      </h1>
      <p className="text-[11px] text-gray-500 mt-0.5">
        Here's what's happening with your meetings today.
      </p>
    </div>
  );
}
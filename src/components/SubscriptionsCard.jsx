import React from "react";

const SubscriptionsCard = ({ profileImg, username }) => {
  return (
    <div className="flex items-center p-4 border rounded-lg shadow-sm bg-white w-full">
      <div className="flex items-center gap-3">
        <img src={profileImg} alt={username} className="w-10 h-10 rounded-full" />
        <div>
          <div className="flex items-center gap-1">
            <p className="font-semibold text-base">{username}</p>
            <span className="text-orange-500"></span> {/* Verification icon placeholder */}
          </div>
          <p className="text-gray-500 text-sm">@{username.toLowerCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsCard;

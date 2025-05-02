import React from "react";

const BlockedCard = ({ profileImg, username, handleUnblock }) => {
  // Ensure username is always a valid string
  const safeUsername = username ? username.toLowerCase() : "unknown";

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white w-full">
      <div className="flex items-center gap-3">
      <img
          src={profileImg || "https://via.placeholder.com/40"}
          alt={safeUsername}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="flex items-center gap-1">
            <p className="font-semibold text-base">{username || "Unknown"}</p>
            <span className="text-orange-500"></span> {/* Verification icon placeholder */}
          </div>
          <p className="text-gray-500 text-sm">@{safeUsername}</p>
        </div>
      </div>
      <button
        onClick={handleUnblock}
        className="px-4 py-1 border rounded-full text-black hover:bg-gray-200 transition"
      >
        Unblock
      </button>
    </div>
  );
};

export default BlockedCard;

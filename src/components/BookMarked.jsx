import React, { useState, useEffect } from "react";

const BookMarked = ({ bookmarks = [] }) => {
  const [bookmarkedItems, setBookmarkedItems] = useState(bookmarks);

  useEffect(() => {
    if (Array.isArray(bookmarks)) {
      setBookmarkedItems(bookmarks);
    }
  }, [bookmarks]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Bookmarked Items</h2>
      {bookmarkedItems.length > 0 ? (
        bookmarkedItems.map((item, index) => (
          <div
            key={item._id || index}
            className="p-4 rounded-lg shadow-md bg-gray-100 border-l-4 border-gray-400"
          >
            {/* Author Details */}
            <div className="flex items-center gap-3 mb-2">
              {item.author?.personal_info?.profile_img && (
                <img
                  src={item.author.personal_info.profile_img}
                  alt={item.author.personal_info.fullname || "Author"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <p className="text-sm font-medium text-gray-700">
                {item.author?.personal_info?.fullname || item.author?.personal_info?.username || "Unknown Author"}
              </p>
            </div>

            {/* Caption */}
            <h4 className="text-lg font-semibold">{item.caption || "No Caption"}</h4>

            {/* Video and Audio */}
            {item.video && (
              <video controls className="w-full mt-2 rounded-lg">
                <source src={item.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            {item.audio && (
              <audio controls className="w-full mt-2">
                <source src={item.audio} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No bookmarks yet!</p>
      )}
    </div>
  );
};

export default BookMarked;

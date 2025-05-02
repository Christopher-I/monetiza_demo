import React from "react";
import coverPhoto from "../imgs/cover-photo.png";
import { capitalizeFirstLetters } from "../common/utils";
import { useSelector } from "react-redux";
import verifiedSVG from "../imgs/Vector.svg";
import { useNavigate } from "react-router-dom";

const SubscriptionCardPrev = ({ profileImage, username, bio, price, status }) => {
  return (
    <div className="bg-white border rounded-lg shadow-md p-4 flex items-center space-x-4">
      <img loading="lazy"
        src={profileImage}
        alt={`${username}'s profile`}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div className="flex-grow">
        <h3 className="text-lg font-semibold">{username}</h3>
        <p className="text-gray-600 text-sm">{bio}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm ${status === "Subscribed" ? "text-green-500" : "text-red-500"}`}>
          {status}
        </p>
        <p className="text-orange-500 font-bold">${price}</p>
      </div>
    </div>
  );
};

export const SubscriptionCardPro = ({ profileImage, username, bio, price, status, fullname }) => {
    const { user, unRead } = useSelector((state) => state.auth);
  return (
    <div className="w-full border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header with Background and Profile Image */}
      <div className="relative">
        <img loading="lazy"
          src={coverPhoto}
          alt="Background"
          className="w-full h-24 object-cover"
        />
        <div className="absolute -bottom-16 left-16 transform -translate-x-1/2 w-24 h-24 border-4 border-white rounded-full overflow-hidden">
          <img loading="lazy"
            src={profileImage}
            alt={`${username}'s profile`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Body Content */}
      <div className="mt-0 p-4 pt-1">
        <div className="flex items-center space-x-1 pl-[100px]">
            <span className="text-xl font-semibold">{capitalizeFirstLetters(fullname)}</span>
            {user.creatorSettings.isCreator && <img loading="lazy" src={verifiedSVG} alt="verified" className="h-4 lg:h-7 w-4 lg:w-7" /> }
        </div>
        <div className="pl-[100px]">
          <span className="text-sm text-gray-400">@{username}</span>
        </div>
        <p className="text-gray-600 text-sm mt-4 ml-2">{bio}</p>
      </div>

      {/* Footer Section */}
      <div className="flex w-[92%] mx-auto mb-4 justify-between items-center p-2 py-1 border-2 rounded-full border-orange-500 text-orange-500">
        <button
          className={`text-lg font-bold`}
        >
          {status}
        </button>
        <div className="text-lg font-bold">${price}</div>
      </div>
    </div>
  );
};

const SubscriptionCard = ({ profileImage, username, bio, price, status, fullname, isCreator, id }) => {
    const { user, unRead } = useSelector((state) => state.auth);
    const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/user/${id}`)} className="w-[80%] border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header with Background and Profile Image */}
      <div className="relative">
        <img loading="lazy"
          src={coverPhoto}
          alt="Background"
          className="w-full h-24 object-cover"
        />
        <div className="absolute -bottom-16 left-16 transform -translate-x-1/2 w-24 h-24 border-4 border-white rounded-full overflow-hidden">
          <img loading="lazy"
            src={profileImage}
            alt={`${username}'s profile`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Body Content */}
      <div className="mt-0 p-4 pt-1">
        <div className="flex items-center space-x-1 pl-[35%]">
            <span className="text-xl font-semibold">{capitalizeFirstLetters(fullname)}</span>
            {isCreator && <img loading="lazy" src={verifiedSVG} alt="verified" className="h-4 lg:h-7 w-4 lg:w-7" /> }
        </div>
        <div className="pl-[35%]">
          <span className="text-sm text-gray-400">@{username}</span>
        </div>
        <p className="text-gray-600 text-sm mt-4 ml-2">{bio}</p>
      </div>

      {/* Footer Section */}
      <div className="flex w-[92%] mx-auto mb-4 justify-between items-center p-2 py-1 border-2 rounded-full border-orange-500 text-orange-500">
        <button
          className={`text-lg font-bold`}
        >
          {status}
        </button>
        <div className="text-lg font-bold">${price}</div>
      </div>
    </div>
  );
};


export default SubscriptionCard;

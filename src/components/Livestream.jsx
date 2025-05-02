import React, { useEffect, useState } from "react";
import { createClient, createMicrophoneAndCameraTracks } from "agora-rtc-sdk-ng";
import { useSelector } from "react-redux";

const Livestream = ({ channelName, appId, token }) => {
  const { user, unRead } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  // const appId = import.meta.env.VITE_AGORA_APP_ID; // Replace with your Agora App ID
  const channel = "YOUR_CHANNEL_NAME"; // Replace with your channel name

  useEffect(() => {
    const initAgora = async () => {
      const client = createClient({ mode: "rtc", codec: "vp8" });

      const [microphoneTrack, cameraTrack] = await createMicrophoneAndCameraTracks();

      setLocalTracks([microphoneTrack, cameraTrack]);

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setUsers((prevUsers) => [...prevUsers, user]);
        }
      });

      client.on("user-unpublished", (user) => {
        setUsers((prevUsers) =>
          prevUsers.filter((u) => u.uid !== user.uid)
        );
      });

      await client.join(appId, channelName, token, user._id);
      await client.publish([microphoneTrack, cameraTrack]);
    };

    initAgora();

    return () => {
      localTracks.forEach((track) => track.close());
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-900 text-white">
      {/* Video Section */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Local User Video */}
        <div className="w-1/2">
          {localTracks[1] && (
            <div
              id="local-video"
              className="rounded-lg overflow-hidden"
              ref={(el) => {
                if (el) localTracks[1].play(el);
              }}
            ></div>
          )}
        </div>

        {/* Remote Users Video */}
        <div className="grid grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.uid}
              className="rounded-lg overflow-hidden"
              id={`user-${user.uid}`}
              ref={(el) => {
                if (el) user.videoTrack?.play(el);
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Floating UI Elements */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center space-x-2">
          <img
            src="https://via.placeholder.com/40" // Replace with profile picture
            alt="host"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="text-sm font-semibold">Christine Kludge</h3>
            <span className="text-xs text-gray-400">5.6K followers</span>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-gray-800 rounded-lg">
        <div className="overflow-y-auto max-h-40">
          <div className="text-sm mb-2">Christine Kludge: It's nice meeting you all</div>
          <div className="text-sm mb-2">Beyond Redding: Exciting to be here</div>
          <div className="text-sm mb-2">Dash Dominic: Cool stuff happening here</div>
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full mt-2 p-2 text-sm bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
  );
};

export default Livestream;
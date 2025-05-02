import React, { useEffect, useRef, useState } from "react";
import { createClient } from "agora-rtc-sdk-ng";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import giftImg from '../imgs/gift.png'
import sendImg from '../imgs/send.png'
import { capitalizeFirstLetters } from "../common/utils";
import axios from "axios";
import SendTipsModal from "./SendTipsModal";

const ViewerLivestream = ({ channelName, appId, token, host, streamId }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { user, unRead } = useSelector((state) => state.auth);
  const socket = useSocket()
  const client = createClient({ mode: "live", codec: "vp8" });
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalViews, setTotalViews] = useState(0);
  const commentsContainerRef = useRef(null);

  useEffect(() => {
    const joinStream = async () => {
      await client.join(appId, channelName, token, user._id);
      await client.setClientRole("audience"); // Set role to audience

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        // console.log(user, "my feedback")
        // console.log(mediaType, "my feedback mediaType")
        if (mediaType === "video") {
          const remoteContainer = document.getElementById("remote-stream");
          const videoTrack = user.videoTrack;
          videoTrack.play(remoteContainer);
        }
        if (mediaType === "audio") {
          // const remoteContainer = document.getElementById("remote-stream2");
          // const audioTrack = user.audioTrack;
          // audioTrack.play(remoteContainer);
          user.audioTrack.play(); // Plays audio directly without an HTML container
          
        }
        user.audioTrack?.play(); // Plays audio directly without an HTML container
      });
    };

    joinStream();

    return () => {
      client.leave();
    };
  }, [channelName, client, appId]);

  useEffect(() => {
    // Scroll to the bottom of the comments container when a new comment is added
    if (commentsContainerRef.current) {
      // commentsContainerRef.current.scrollTop =
      //   commentsContainerRef.current.scrollHeight;
      
        commentsContainerRef.current.scrollTo({
          top: commentsContainerRef.current.scrollHeight,
          behavior: "smooth", // Enable smooth scrolling
        });
    }
  }, [comments]);

  function handleKeyPress(event) {
    // Use event.key if available, otherwise fall back to event.keyCode
    const key = event.key || event.keyCode;

    if (key === "Enter" || key === 13) {
        // console.log("Enter key was pressed!");
        handleSend()
    }
}

  useEffect(() => {
    if (!socket) return;

    // Join the room for the current live stream
    socket.emit('joinLiveStreamRoom', channelName);
    const countLiveStreamRoomTimer = setInterval(() => {
      socket.emit('countLiveStreamRoom', channelName)
    }, 5000);

    // Listen for incoming messages
    const handleMessage = ({ content, profileImage, username }) => {
      setComments((prev) => [...prev, { content, profileImage, username }]);
      // console.log(comments, "comments")
    };

    const handleActiveViewers = (data) => {
      setTotalViews(() => data.length - 1)
    };

    socket.on('disconnecting', () => {
      // console.log('Client is about to disconnect');
      socket.emit('disconnecting', channelName);
    });

    socket.on('receiveLiveStreamMessage', handleMessage);
    socket.on('getActiveViewers', handleActiveViewers);

    // Cleanup on unmount
    return () => {
      clearInterval(countLiveStreamRoomTimer)
      socket.off('receiveLiveStreamMessage', handleMessage)
    };
  }, [socket, channelName]);

  const handleSend = () => {
    if (message.trim()) {
      socket.emit('sendLiveStreamMessage', { channelName, content: message, profileImage: user.personal_info.profile_img, username: user.personal_info.username })
      setComments((prev) => [...prev, { content: message, profileImage: user.personal_info.profile_img, username: user.personal_info.username }]);
      setMessage("")
    }
  }

  return (
    <div className="relative w-full h-full bg-gray-900 text-black">
      {/* Video Section */}
        <div id="remote-stream" className="h-full w-full"></div>
        <audio id="remote-stream2" controls controlsList="nodownload" className="w-full">
          <source type="audio/mp3" />
        </audio>

      {/* Floating UI Elements */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-3xl opacity-50">
          <img loading="lazy"
            src={host.personal_info.profile_img} // Replace with profile picture
            alt="host"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold">{capitalizeFirstLetters(host.personal_info.fullname)}</h3>
              <span className="text-sm text-gray-400">@{host.personal_info.username}</span>
            </div>
            <span className="text-xs text-gray-400">{totalViews} viewers</span>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="absolute bottom-16 lg:bottom-4 left-4 right-4 p-4 rounded-lg">
        <div className="overflow-y-auto max-h-40 space-y-4 hide-scrollbar mb-4" ref={commentsContainerRef}>
      {comments && comments.length > 0 && comments.map((comment) => (
        <CommentContainer 
          text={comment.content}
          img={comment.profileImage}
          username={comment.username}
        />
      ))}
        </div>
        <div className="w-full flex h-[60px] space-x-8">
          <div className="bg-gray-200 relative h-full max-w-[520px] w-full rounded-lg flex justify-center items-start">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(() => e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="max-w-[500px] w-full mt-2 p-2 text-sm rounded-full px-4"
            />
            <img onClick={handleSend} loading="lazy" src={sendImg} alt="gift streamer" className="absolute h-8 w-8 top-2 right-2 cursor-pointer" />
          </div>
          <button className="rounded-full h-full w-[60px]">
            <img loading="lazy" src={giftImg} alt="gift streamer" className="" />
          </button>
          <SendTipsModal
          isOpen={isModalOpen}
          onClose={(data = {}) => setIsModalOpen(false)}
          data={
            {
              postId: undefined,
              authorId: host._id,
              profilePic: host.personal_info.profile_img,
              name: capitalizeFirstLetters(host.personal_info.fullname),
              verified: host.creatorSettings.isCreator,
              username: host.personal_info.username,
            }
          }
        />
        </div>
      </div>
    </div>
  );

  return <div id="remote-stream" className="w-full h-full bg-black"></div>;
};

const CommentContainer = ({text, img, username}) => (
  <div className="bg-gray-100 rounded-2xl py-1 px-2 max-w-[450px] w-full flex items-center gap-4 opacity-50">
    <img loading="lazy" src={img || sendImg} alt="" className="rounded-full h-10 w-10" />
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold">@{username || "mummem"}</h3>
      <span className="text-sm">{text || "what a rubbish content"}</span>
    </div>
  </div>
)

export default ViewerLivestream;

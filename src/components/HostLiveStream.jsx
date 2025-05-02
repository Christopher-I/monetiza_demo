import React, { useEffect, useRef, useState } from "react";
import { createClient, createMicrophoneAndCameraTracks } from "agora-rtc-sdk-ng";
import { useSelector } from "react-redux";
import giftImg from '../imgs/gift.png'
import sendImg from '../imgs/send.png'
import { capitalizeFirstLetters } from "../common/utils";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import AgoraRTM from 'agora-rtm-sdk';
import { useSocket } from "../context/SocketContext";
// import { uuid } from 'uuidv4';

const HostLivestream = ({ channelName, appId, token, host, streamId, tokenP }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const clientBaseUrl = import.meta.env.VITE_CLIENT_BASE_URL;
  const navigate = useNavigate()
  const socket = useSocket()
  const { user, unRead } = useSelector((state) => state.auth);
  const client = createClient({ mode: "live", codec: "vp8" });
  // const rtmClient = new AgoraRTM.RTM(appId, user._id);
  // const [rtmClient, setRtmClient] = useState();
  // const [rtmChannel, setRtmChannel] = useState();
  const [comments, setComments] = useState([]); // very important
  const [message, setMessage] = useState(""); // very important
  const [currentStream, setCurrentStream] = useState();
  const [microphoneTrackGeneral, setMicrophoneTrack] = useState();
  const [cameraTrackGeneral, setCameraTrack] = useState();
  const [totalViews, setTotalViews] = useState(0);
  const commentsContainerRef = useRef(null);

  // const rtmClient = new AgoraRTM.RTM(appId, "12345")

  // const showMessage = async (event, message) => {
  //   if (rtmChannel) {
  //     try {
  //       // await rtmChannel.sendMessage({ text: message });
  //       console.log("My RTM -", 'Message sent:', message);
  //       console.log("My RTM -", 'Event sent:', event);
  //     } catch (error) {
  //       console.error('Error sending message:', error);
  //     }
  //   }
  // }

  // const sendMessage = async (message) => {
  //   if (rtmChannel) {
  //     try {
  //       await rtmChannel.sendMessage({ text: message });
  //       console.log('Message sent:', message);
  //     } catch (error) {
  //       console.error('Error sending message:', error);
  //     }
  //   }
  // }

  // const listenForMessages = (callback) => {
  //   if (rtmChannel) {
  //     rtmChannel.on('ChannelMessage', ({ text }, senderId) => {
  //       callback({ user: senderId, message: text });
  //       console.log(text, "text")
  //       console.log(senderId, "senderId")
  //     });
  //   }
  // }

  const shareViaNative = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check this out!",
          url: `${clientBaseUrl}/live/${streamId}`,
        })
        .catch((error) => {
          toast.error("Error sharing: " + error.message);
        });
    } else {
      toast.info("Native share is not supported on this device.");
    }
  };

  // const leaveRTM = async () => {
  //   if (rtmChannel) {
  //     await rtmChannel.leave();
  //     console.log('Left RTM channel');
  //   }
  //   if (rtmClient) {
  //     await rtmClient.logout();
  //     console.log('RTM Logout successful');
  //   }
  // }

  useEffect(() => {
    // console.log(appId, "appId")
    // console.log(token, "token")
    // console.log(tokenP, "tokenP")
    const startStream = async () => {
      const [microphoneTrack, cameraTrack] = await createMicrophoneAndCameraTracks();

      setMicrophoneTrack(() => microphoneTrack)
      setCameraTrack(() => cameraTrack)

      await client.join(appId, channelName, token, user._id);
      await client.setClientRole("host"); // Set role to host
      await client.publish([microphoneTrack, cameraTrack]);
      // await client.publish(cameraTrack);
      // await client.publish(microphoneTrack);

      
;
      cameraTrack.play("local-stream"); 
      // microphoneTrack.play("local-stream");
    };
    // const startMessaging = async () => {
    //   try {
    //     const rtmClient = new AgoraRTM.RTM(appId, user._id)
    //     const rtmResult = await rtmClient.login({ token: tokenP });
    //     console.log(rtmResult, 'RTM Login data');
    //     console.log('RTM Login successful');

    //     const rtmChannel = rtmClient.createChannel(channelName);
    //     await rtmChannel.join();
    //     setRtmChannel(rtmChannel); // Use the setter to update the state

    //     console.log(`Joined RTM channel: ${channelName}`);

    //     setRtmChannel(rtmChannel);
    //     setRtmClient(rtmClient);
    //     listenForMessages((comment) => {
    //       setComments((prev) => [...prev, comment]);
    //     })
    //   } catch (error) {
    //     console.error('RTM Initialization Error:', error);
    //   }
    // };
    
    // const startDefaultMessaging = async () => {
    //   try {
    //     console.log(tokenP, 'tokenP');
    //     let token = "007eJxTYMi7yuzgau1373HH5rjdruv75B9wLM5VON+bVTunSPqQqK8CQ4qFWUqisalFiomZqYlliqFlklmSRZJlqkliUpqZpWHqh+Md6Q2BjAwZljzMjAwQCOKzMhTl5+caMTAAADPsHu4="
    //     let userId = "1234";
    //     let roomName = "room2"
        
    //     const rtmClient = new AgoraRTM.RTM("d86da358d46549d19b6b8b9e4abf691e", userId)
    //     const rtmResult = await rtmClient.login({ token });
    //     console.log(rtmResult, 'RTM Login data');
    //     console.log('RTM Login successful');
    
    //     const rtmChannelInit = await rtmClient.subscribe(roomName);
    //     // await rtmChannelInit.join({token: tokenP});
    //     console.log(`Joined RTM channel: ${rtmChannelInit}`);
    //     console.log(`Joined RTM channel: ${"room1"}`);

    //     // Message event handler.
    //     rtmClient.addEventListener("message", event => {
    //       showMessage(event.publisher, event.message);
    //     });

    //     // Presence event handler.
    //     rtmClient.addEventListener("presence", event => {
    //       if (event.eventType === "SNAPSHOT") {
    //         showMessage("INFO", "I Join");
    //       }
    //       else {
    //         showMessage("INFO", event.publisher + " is " + event.eventType);
    //       }
    //     });

    //     // Connection state changed event handler.
    //     rtmClient.addEventListener("status", event => {
    //       // The current connection state.
    //       const currentState = event.state;
    //       // The reason why the connection state changes.
    //       const changeReason = event.reason;
    //       showMessage("INFO", JSON.stringify(event));
    //     });

    
    //     setRtmChannel(rtmChannelInit);
    //     // setRtmClient(rtmClientInit);
    //   } catch (error) {
    //     console.error('RTM Initialization Error:', error);
    //   }
    // }

    // ws.onmessage = (event) => {
    //   const newComment = JSON.parse(event.data);
    //   setComments((prevComments) => [...prevComments, newComment]).slice(-50); // Append new comment
    // };

    startStream();
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(function (stream) {
        setCurrentStream(stream);
      })
      .catch(function (error) {
        console.error("Error accessing media devices: ", error);
      });

    setTimeout(() => {
      // startMessaging()
      // startDefaultMessaging()
    }, 10000);

    return () => {
      client.leave();
      // rtmClient.unsubscribe("room2")
      // rtmClient.logout("room1")
      // leaveRTM();
      // ws.close();
    };
  }, [channelName, appId]);

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

  // const handleSendMessage = async () => {
  //   if (message.trim()) {
  //     await sendMessage(message);
  //     setComments((prev) => [...prev, { user: 'You', message }]);
  //     setMessage('');
  //   }
  // }

  const endStream = async () => {
    try {
      await axios.patch(`${baseUrl}/api/stream/live/${streamId}`, { status: "ended" }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      // console.log(microphoneTrackGeneral, cameraTrackGeneral, "skrrrr")
      await client.leave()
      toast.info("Livestream has ended")
      if (currentStream) {
        let tracks = currentStream.getTracks();

        tracks.forEach(track => track.stop());
      }
      if (microphoneTrackGeneral) {
        microphoneTrackGeneral.unpipe()
        microphoneTrackGeneral.stop()
        // console.log(microphoneTrackGeneral, "microphoneTrackGeneral")
      }
      if (cameraTrackGeneral) {
        cameraTrackGeneral.unpipe()
        cameraTrackGeneral.stop()
        // console.log(cameraTrackGeneral, "cameraTrackGeneral")
      }
      window.location.pathname = "feed"

    } catch (error) {

    }
  };

  useEffect(() => {
    // console.log(streamId, "streamId")
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
      // console.log("viewers count:")
      // console.log("viewers count:")
      // console.log("viewers count:")
      // console.log("viewers count:")
      // console.log(data, "data")
      // console.log("viewers count:")
      // console.log("viewers count:")
      // console.log("viewers count:")
      // console.log("viewers count:")
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
      // socket.emit('leaveLiveStreamRoom', channelName);
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

  // return <div id="local-stream" className="w-full h-full bg-black"></div>;
  return (
    <div className="relative w-full h-full bg-gray-900 text-black">
      {/* Video Section */}
      <div id="local-stream" className="h-full w-full"></div>
      {/* <div className="relative w-full h-full flex items-center justify-center">
        {/* Local User Video /}
        <div id="local-stream" className="flex-1">
          <div
            id="local-stream"
            className="rounded-lg overflow-hidden w-full h-full"
            // ref={(el) => {
            //   if (el) localTracks[1].play(el);
            // }}
          >klknlknlkn</div>
        </div>
      </div> */}

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

      {/* End Live */}
      <div className="absolute top-20 lg:top-4 right-4">
        <button className="bg-red-600 px-6 py-2 rounded-xl text-white text-xl font-bold font-montserrat" onClick={endStream}>End Livestream</button>
      </div>
      <div className="absolute top-36 lg:top-20 right-4">
        <button className="bg-blue-300 px-6 py-2 rounded-xl text-white text-xl font-bold font-montserrat" onClick={shareViaNative}>Share Livestream</button>
      </div>

      {/* Chat Section */}
      <div className="absolute bottom-16 lg:bottom-4 left-4 right-4 p-4 rounded-lg">
        <div className="overflow-y-auto max-h-40 space-y-4 hide-scrollbar mb-4" ref={commentsContainerRef}>
          {/* {comments.map((comment, index) => (
        <div key={index} className="mb-2">
          <p className="text-sm text-gray-800">{comment.username}: {comment.text}</p>
        </div>
      ))} */}
      {comments && comments.length > 0 && comments.map((comment) => (
        <CommentContainer 
          text={comment.content}
          img={comment.profileImage}
          username={comment.username}
        />
      ))}
          {/* <CommentContainer />
          <CommentContainer text={"it is really an amazing content"} /> */}
          {/* <div className="text-sm mb-2">Christine Kludge: It's nice meeting you all</div>
          <div className="text-sm mb-2">Beyond Redding: Exciting to be here</div>
          <div className="text-sm mb-2">Dash Dominic: Cool stuff happening here</div> */}
        </div>
        <div className="w-full flex h-[60px] space-x-8">
          <div className="bg-gray-200 relative h-full max-w-[520px] w-full rounded-lg flex justify-center items-start">
            <input
              type="text"
              defaultValue={streamId}
              value={message}
              onChange={(e) => setMessage(() => e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="max-w-[500px] w-full mt-2 p-2 text-sm rounded-full px-4"
            />
            <img onClick={handleSend} loading="lazy" src={sendImg} alt="gift streamer" className="absolute h-8 w-8 top-2 right-2 cursor-pointer" />
          </div>
          {/* <button className="rounded-full h-full w-[60px]">
            <img loading="lazy" src={giftImg} alt="gift streamer" className="" />
          </button> */}
        </div>
      </div>
    </div>
  );
};

const CommentContainer = ({ text, img, username }) => (
  <div className="bg-gray-100 rounded-2xl py-1 px-2 max-w-[450px] w-full flex items-center gap-4 opacity-50">
    <img loading="lazy" src={img || sendImg} alt="" className="rounded-full h-10 w-10" />
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold">@{username || "mummem"}</h3>
      <span className="text-sm">{text || "what a rubbish content"}</span>
    </div>
  </div>
)

export default HostLivestream;

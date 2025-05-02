import RecentChats from "../components/RecentChats";
import ChatSection from "../components/ChatSection";
import withProtectedRoute from "../hoc/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Livestream from "../components/Livestream";
import HostLivestream from "../components/HostLiveStream";
import axios from "axios";
import { useSelector } from "react-redux";

// eslint-disable-next-line react-refresh/only-export-components
const Stream = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const { user, unRead } = useSelector((state) => state.auth);
    const location = useLocation();
    const data = location.state;


    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState("recentChats");
    const recentChatsRef = useRef(); // Create reference for RecentChats component
    const [tokenU, setTokenU] = useState("")
    const [tokenP, setTokenP] = useState("")
    const [channelName, setChannelName] = useState("")
    const [host, setHost] = useState({})
    const [streamId, setStreamId] = useState("")

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Use 768px as breakpoint for mobile
        };

        // axios.post(`http://localhost:5000/api/stream/live`, {
        //     headers: { "Content-Type": "application/json" },
        //     withCredentials: true,
        //   }).then((result) => {
        //     console.log(result.data)
        //     setToken(() => result.data.token)
        //   })
        // console.log(data, "state data")

        // axios.post(`http://localhost:5000/api/stream/live`, {
        //     headers: { "Content-Type": "application/json" },
        //     withCredentials: true,
        //     }).then((result) => {
        //         console.log(result.data)
        //         setToken(() => result.data.token)
        //     }).catch((err) => console.log(err, "failed to fetch posts"))

        axios.post(`${baseUrl}/api/stream/live`, {title: data?.topic, viewer: data.viewer, description: "empty description"}, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        }).then((result) => {
            setTokenU(result.data.tokens.rtcToken)
            setTokenP(result.data.tokens.rtmToken)
            // console.log(result.data.tokens, "the tokens")
            setChannelName(result.data.stream.channelName)
            setHost(result.data.stream.hostId)
            setStreamId(result.data.stream._id)
        }).catch((err) => console.log(err, "failed to start livestream"))

        // if (streamer) {
        //     console.log(streamer.data, "streamer.data")
        //     setTokenU(streamer.data.token)
        //     setChannelName(streamer.data.stream.channelName)
        // }

        // Check initial window size
        handleResize();

        // Add event listener for window resize
        window.addEventListener("resize", handleResize);

        // Cleanup event listener on component unmount
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Function to handle sending a new message and updating recent chats
    const handleNewMessage = (newMessage, isSender) => {
        // Call updateRecentMessages exposed by RecentChats to update the list
        recentChatsRef.current.updateRecentMessages(newMessage, isSender);
    };

    return (
        <div className="h-screen w-full">
            {channelName.length > 0 && tokenU.length > 0 ? <HostLivestream host={host} streamId={streamId} channelName={channelName} token={tokenU} tokenP={tokenP} appId={import.meta.env.VITE_AGORA_APP_ID} /> : null}
        </div>
        
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withProtectedRoute(Stream, 'livestream');
 
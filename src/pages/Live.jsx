import RecentChats from "../components/RecentChats";
import ChatSection from "../components/ChatSection";
import withProtectedRoute from "../hoc/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import ViewerLivestream from "../components/ViewerLiveStream";

// eslint-disable-next-line react-refresh/only-export-components
const Live = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const location = useLocation();
    const data = location.state;

    
    const { streamId } = useParams();


    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState("recentChats");
    const recentChatsRef = useRef(); // Create reference for RecentChats component
    const [tokenU, setTokenU] = useState("")
    const [channelName, setChannelName] = useState("")
    const [host, setHost] = useState({})

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

        axios.get(`${baseUrl}/api/stream/live/${streamId}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        }).then((result) => {
            setTokenU(result.data.token)
            setChannelName(result.data.stream.channelName)
            setHost(result.data.stream.hostId)
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
            {channelName.length > 0 && tokenU.length > 0 ? <ViewerLivestream host={host} streamId={streamId} channelName={channelName} token={tokenU} appId={import.meta.env.VITE_AGORA_APP_ID} /> : null}
        </div>
        
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withProtectedRoute(Live, 'live');
 
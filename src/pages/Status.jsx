import RecentChats from "../components/RecentChats";
import ChatSection from "../components/ChatSection";
import withProtectedRoute from "../hoc/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import NewPublication from "../components/NewPublication";
import TopCreators from "../components/TopCreators";
import PostCard from "../components/PostCard";
import axios from "axios";
import StoriesSection from "../components/Stories";
import { useSelector } from "react-redux";
import MessageBox from "../components/MessageBox";
import AddNewStatus from "../components/AddNewStatus";

// eslint-disable-next-line react-refresh/only-export-components
const NewStatus = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const { user, unRead } = useSelector((state) => state.auth);

    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState("For you");
    const [posts, setPosts] = useState([])
    const [statuses, setStatuses] = useState([])

    useEffect(() => {

       axios.get(`${baseUrl}/api/post/all`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        }).then((result) => {
            // console.log(result, "result")
            setPosts(() => result.data.posts)
        }).catch((err) => console.log(err, "failed to fetch posts"))

       axios.get(`${baseUrl}/api/post/status`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        }).then((result) => {
            // console.log(result, "result")
            setStatuses(() => result.data.statuses)
        }).catch((err) => console.log(err, "failed to fetch posts"))
    }, []);

    useEffect(() => {

    //    axios.get(`${baseUrl}/api/post/all`, {
    //     headers: { "Content-Type": "application/json" },
    //     withCredentials: true,
    //     }).then((result) => {
    //         console.log(result, "result")
    //         setPosts(() => result.data.posts)
    //     }).catch((err) => console.log(err, "failed to fetch posts"))

        if (activeTab != "Following") {
            axios.get(`${baseUrl}/api/post/all`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
                }).then((result) => {
                    // console.log(result, "result")
                    setPosts(() => result.data.posts)
                }).catch((err) => console.log(err, "failed to fetch posts"))
                return 
        }
        axios.get(`${baseUrl}/api/post/following`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
            }).then((result) => {
                // console.log(result, "result")
                setPosts(() => result.data.posts)
            }).catch((err) => console.log(err, "failed to fetch posts"))
        
    }, [activeTab]);

    const refetch = async() => {
        if (activeTab != "Following") {
            axios.get(`${baseUrl}/api/post/all`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
                }).then((result) => {
                    // console.log(result, "result")
                    setPosts(() => result.data.posts)
                }).catch((err) => console.log(err, "failed to fetch posts"))
                return 
        }
        axios.get(`${baseUrl}/api/post/following`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
            }).then((result) => {
                // console.log(result, "result")
                setPosts(() => result.data.posts)
            }).catch((err) => console.log(err, "failed to fetch posts"))
    }

    const refetchAllPosts = () => {
        // 
        axios.get(`${baseUrl}/api/post/all`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
            }).then((result) => {
                // console.log(result, "result")
                setPosts(() => result.data.posts)
            }).catch((err) => console.log(err, "failed to fetch posts"))
    }


    return (
        <div className={`flex flex-1 h-[100vh] ${isMobile ? "flex-col" : "lg:flex-row"}`}>
                <>
                    {/* Desktop layout */}
                    <div className="w-full overflow-y-auto h-full lg:w-3/4 border-r border-[var(--border-color)]">
                        <AddNewStatus />
                    </div>
                    <div className="w-full lg:flex hidden lg:w-2/4">
                        <TopCreators />
                    </div>
                </>
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withProtectedRoute(NewStatus, 'home');

import RecentChats from "../components/RecentChats";
import ChatSection from "../components/ChatSection";
import withProtectedRoute from "../hoc/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import ContentTable, { ContentManagement, SecondContentTable } from "../components/ContentTable";
import axios from "axios";

// const tableData = [
//     {
//       title: 'Navigating Sorcery',
//       contentType: 'Media',
//       status: 'Published',
//     },
//     {
//       title: 'Advanced Theory',
//       contentType: 'Post',
//       status: 'Published',
//     },
//     {
//       title: 'Subscription Policy',
//       contentType: 'Media',
//       status: 'Not Published',
//     },
//     {
//       title: 'Cause to grow more',
//       contentType: 'Post',
//       status: 'Published',
//     },
//     {
//       title: 'Operation movements',
//       contentType: 'Media',
//       status: 'Not Published',
//     },
//   ];

// eslint-disable-next-line react-refresh/only-export-components
const ContentPage = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
    const [isMobile, setIsMobile] = useState(false);
    const [tableData, setTableData] = useState([]);
    const recentChatsRef = useRef(); // Create reference for RecentChats component

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Use 768px as breakpoint for mobile
        };

        // Check initial window size
        handleResize();

        axios.get(`${baseUrl}/api/post/draft`, {
          // {...formData, ...uploadData}, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }).then((result) => {
          // console.log(result.data.posts, "result.data.posts")
          setTableData(() => result.data.posts)
        }).catch((error) => {
          // 
        })

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
        <div className="p-8 overflow-y-auto w-full">
            <div className="space-y-1 mb-4">
                <h1 className="text-xl font-bold">Content Management</h1>
                <p className="text-gray-500 text-lg">Organize and schedule your content</p>
            </div>
            {tableData && <ContentManagement initialData={tableData} />}
            {/* <ContentTable data={tableData} /> */}
            {/* <SecondContentTable /> */}
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withProtectedRoute(ContentPage, 'content');

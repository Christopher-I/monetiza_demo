import { useEffect, useImperativeHandle, forwardRef, useState, useRef } from 'react'; // Add useRef
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllConversations, setActiveChat, fetchMessages } from '../store/chatSlice';
import { addUnread } from '../store/authSlice';
import search from '../imgs/search.png';
import filter from '../imgs/filter.png';
import dot from '../imgs/dot.png';
import { formatTimeTo12Hour } from '../common/utils';
import Loading from './Loading';
import { io } from 'socket.io-client'; // Add this import

const RecentChats = forwardRef(({ handleClick, preselectedUser, onSelectChat }, ref) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const dispatch = useDispatch();
    const { activeChat, conversations: reduxConvs } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [isPinning, setIsPinning] = useState(false);
    const socket = useRef(null); // Declare socket with useRef

    const handleSearchUsers = async (e) => {
      e.preventDefault()
      if (e.target.value == "") return setFilteredConversations(conversations);
      setFilteredConversations(conversations.filter(conversation => conversation?.user?.personal_info?.fullname.includes(e.target.value) ))
      // 
    }

    // Fetch recent chats
    const fetchRecentChats = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/message/all-recent-message`, {
                withCredentials: true,
            });

            if (response.data.success) {
                const sortedConversations = response.data.messages.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setConversations(sortedConversations);
                setFilteredConversations(sortedConversations);
            }
        } catch (error) {
            console.error("Error fetching recent chats:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleChatClick = (user) => {
        onSelectChat(user);
        handleClick(); // This will trigger the navigation to the chat section
    };

    // Initialize WebSocket connection
    useEffect(() => {
        socket.current = io(baseUrl, {
            query: { userId: user._id },
        });

        // Listen for new messages
        socket.current.on('newMessage', (message) => {
            // Update the conversations list
            setConversations((prevConversations) => {
                const updatedConversations = prevConversations.map((conv) =>
                    conv.conversationId === message.conversationId
                        ? { ...conv, message: message.message, time: message.createdAt }
                        : conv
                );

                // Move the updated conversation to the top
                const updatedConv = updatedConversations.find(
                    (conv) => conv.conversationId === message.conversationId
                );
                const filteredConvs = updatedConversations.filter(
                    (conv) => conv.conversationId !== message.conversationId
                );
                return [updatedConv, ...filteredConvs];
            });
        });

        return () => {
            socket.current.disconnect();
        };
    }, [user._id]);

    const getPinned = async () => {
        try {
          const response = await axios.get(
            `${baseUrl}/api/message/pinned-conversations`,
            { withCredentials: true }
          );
      
          if (response.data) {
            // Handle success, you can trigger UI updates or show a message
            return response.data.conversations
          } else {
            // console.log("Error:", response.data.message);
          }
        } catch (error) {
          console.error("Error toggling pin:", error);
        }
      };

    const handlePin = async (conversationId, action) => {
        if(isPinning || !conversationId){
          return
        }
        setIsPinning(true)
        try {
          const response = await axios.post(
            `${baseUrl}/api/message/conversations/${conversationId}/pinned`,
            { action },
            { withCredentials: true }
          );
      
          if (response.data.success) {
            // Update the pinned state locally
            setConversations((prevUsers) =>
              prevUsers.map((user) =>
                user.conversationId === conversationId
                  ? { ...user, pinned: action === "pin" }
                  : user
              )
            );
      
            // Reapply the current tab's filter to update the UI
            const conversationss = await getPinned();
            const updatedUsers = conversations.map((user) => {
              const conversation = conversationss.find(
                (conv) => conv._id === user.conversationId
              );
              return {
                ...user,
                pinned: conversation?.pinned || false,
              };
            });
      
            const filteredUsers = updatedUsers.filter((user) => {
              if (activeTab === "Pinned") {
                return user.pinned === true;
              }
              if (activeTab === "Unread") {
                return user.unReadCount > 0;
              }
              if (activeTab === "Tips") {
                return user.isTip === true;
              }
              return true; // Default case, show all users
            });
      
            setFilteredConversations(filteredUsers);
            setIsPinning(false)
          } else {
            // console.log("Error:", response.data.message);
          }
        } catch (error) {
          console.error("Error toggling pin:", error);
        }
      };

    // Fetch recent chats on component mount
    useEffect(() => {
        fetchRecentChats();
    }, []);

    // Handle preselected user
    useEffect(() => {
        if (preselectedUser && reduxConvs) {
            const conversation = reduxConvs.find(
                (conv) => conv.user?._id === preselectedUser._id
            );
            if (conversation) {
                onSelectChat(conversation.user);
                handleClick();
            }
        }
    }, [preselectedUser, reduxConvs]);

    // Filter conversations based on active tab
    useEffect(() => {
        let filtered = conversations;
        if (activeTab === "Pinned") {
            filtered = conversations.filter((conv) => conv.pinned);
        } else if (activeTab === "Unread") {
            filtered = conversations.filter((conv) => conv.unReadCount > 0);
        }
        setFilteredConversations(filtered);
    }, [activeTab, conversations]);

    // Expose updateRecentMessages to parent component
    useImperativeHandle(ref, () => ({
        updateRecentMessages: (newMessage, isSender) => {


            const updatedUsers = [...conversations];
                  const userIndex = updatedUsers.findIndex(
                    (user) => user._id === newMessage.receiverId || user._id === newMessage.senderId
                  );
              
                  if (userIndex > -1) {
                    // Update the existing user
                    updatedUsers[userIndex] = {
                      ...updatedUsers[userIndex],
                      message: newMessage.message,
                      time: isSender? newMessage.time : newMessage.createdAt,
                      // Reset unReadCount to 0 if activeChat._id matches receiverId, otherwise increment if not sender
                      unReadCount:
                          activeChat._id === newMessage.receiverId
                          ? 0
                          : !isSender
                          ? (updatedUsers[userIndex].unReadCount || 0) + 1
                          : updatedUsers[userIndex].unReadCount,
                    };
              
                    // Move the user to the top
                    const [userToMove] = updatedUsers.splice(userIndex, 1);
                    updatedUsers.unshift(userToMove);
                    if (!isSender){
                      dispatch(addUnread(true))
                    }
                  } else {
                    // Add a new user if not found
                    updatedUsers.unshift({
                      ...newMessage.user,
                      message: newMessage.message,
                      time: newMessage.time,
                      unReadCount: 0,
                    });
                  }

            ////////////
            // setConversations((prevConversations) => {
            //     const updatedConversations = prevConversations.map((conv) =>
            //         conv.conversationId === newMessage.conversationId
            //             ? { ...conv, message: newMessage.message, time: newMessage.createdAt }
            //             : conv
            //     );

            //     // Move the updated conversation to the top
            //     const updatedConv = updatedConversations.find(
            //         (conv) => conv.conversationId === newMessage.conversationId
            //     );
            //     const filteredConvs = updatedConversations.filter(
            //         (conv) => conv.conversationId !== newMessage.conversationId
            //     );
            //     return [updatedConv, ...filteredConvs];
            // });

            setConversations(updatedUsers); 
            setFilteredConversations(updatedUsers);
        },
    }));

    return (
        <div className="flex flex-col w-full border-r bg-[var(--bg-color)] h-screen overflow-y-auto shadow-lg">
            <div className="px-4 py-3 border-b">
                <div className="flex justify-end">
                    <img loading="lazy" className="h-7" src={dot} alt="Menu" />
                </div>
                <div className="flex justify-between my-2 mb-4">
                    <h2 className="font-montserrat text-lg font-bold text-gray-800">Recent</h2>
                    <div className="flex justify-end w-[55%]">
                        {/* <img loading="lazy" className="h-5" src={search} alt="search" /> */}
                        <div className="relative w-full max-w-[200px] bg-white rounded-xl border border-black pr-8 pl-1">
                            <input type="text" className="w-full rounded-xl" onChange={handleSearchUsers} />
                            <img loading="lazy" className="absolute right-1 top-[2px] h-5" src={search} alt="search" />
                        </div>
                        {/* <img loading="lazy" className="mx-2 ml-3 h-5" src={filter} alt="filter" /> */}
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button className={`font-montserrat text-sm px-3 py-1 ${activeTab === "All" ? "bg-[var(--main-color)]" : "bg-[var(--sidebar-text-color)]"} text-white rounded-3xl`} onClick={() => setActiveTab("All")}>All</button>
                    <button className={`font-montserrat text-sm px-3 py-1 ${activeTab === "Pinned" ? "bg-[var(--main-color)]" : "bg-[var(--sidebar-text-color)]"} text-white rounded-3xl`} onClick={() => setActiveTab("Pinned")}>Pinned</button>
                    <button className={`font-montserrat text-sm px-3 py-1 ${activeTab === "Unread" ? "bg-[var(--main-color)]" : "bg-[var(--sidebar-text-color)]"} text-white rounded-3xl`} onClick={() => setActiveTab("Unread")}>Unread</button>
                </div>
            </div>
            {loading ? <Loading /> : (
                <ul className="divide-y divide-gray-200">
                    {filteredConversations.map((conv, index) => (
                        <li key={index} className="flex items-center justify-between px-4 py-3 hover:bg-gray-100">
                            <div onClick={() => handleChatClick(conv.user)} className="flex items-center flex-1 space-x-3 cursor-pointer">
                                <img
                                    src={conv.user?.personal_info?.profile_img || "/default-avatar.png"}
                                    alt={conv.user?.personal_info?.fullname || "User"}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-montserrat text-sm font-semibold text-gray-800">
                                        {conv.user?.personal_info?.fullname || "Unknown User"}
                                    </h3>
                                    <p className={`text-xs text-black truncate w-48 ${conv.unReadCount > 0 ? "font-bold" : ""}`}>
                                        {conv.message || "No recent message"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs font-semibold text-black">
                                    {formatTimeTo12Hour(conv.createdAt)}
                                </p>
                                {conv.unReadCount > 0 && (
                                    <div className="text-xs px-2 py-1 bg-red-500 text-white rounded-full">
                                        {conv.unReadCount}
                                    </div>
                                )}
                                {conv.pinned ? (
                                    <PushPinIcon className="text-[var(--main-color)] cursor-pointer" onClick={() => handlePin(conv.conversationId, "unpin")} />
                                ) : (
                                    <PushPinOutlinedIcon className="text-gray-500 cursor-pointer" onClick={() => handlePin(conv.conversationId, "pin")} />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

RecentChats.displayName = 'RecentChats';
RecentChats.propTypes = {
    handleClick: PropTypes.func.isRequired,
    preselectedUser: PropTypes.object,
    onSelectChat: PropTypes.func.isRequired
};

export default RecentChats;
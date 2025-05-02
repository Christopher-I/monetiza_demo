import { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSuggestedUsers } from '../store/suggestedUsersSlice';
import Loading from './Loading';
import { setActiveChat, fetchMessages, fetchAllConversations } from '../store/chatSlice';
import { addUnread } from '../store/authSlice';
import search from '../imgs/search.png';
import filter from '../imgs/filter.png';
import dot from '../imgs/dot.png';
import { formatTimeTo12Hour } from '../common/utils';

// Forward ref to expose methods to the parent component
const RecentChats = forwardRef(({ handleClick, preselectedUser, onSelectChat }, ref) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const dispatch = useDispatch();
  const { activeChat } = useSelector((state) => state.chat);
  const { users, status: usersStatus, error: usersError } = useSelector((state) => state.suggestedUsers);
  const { conversations, convLoading, error: convError } = useSelector((state) => state.chat);

  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([])
  const [activeTab, setActiveTab] = useState('All');
  const [isPinning, setIsPinning] = useState(false)

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
        setUniqueUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.conversationId === conversationId
              ? { ...user, pinned: action === "pin" }
              : user
          )
        );
  
        // Reapply the current tab's filter to update the UI
        const conversations = await getPinned();
        const updatedUsers = uniqueUsers.map((user) => {
          const conversation = conversations.find(
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
  
        setFilteredUsers(filteredUsers);
        setIsPinning(false)
      } else {
        // console.log("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };
  

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
  const handleTabToggle = async (activeTab) => {
    setActiveTab(activeTab);
  
    try {
      const conversations = await getPinned();
  
      const updatedUsers = uniqueUsers.map((user) => {
        const conversation = conversations.find(
          (conv) =>
            conv._id === user.conversationId
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
  
      setFilteredUsers(filteredUsers);
    } catch (error) {
      console.error("Error toggling tabs:", error);
    }
  };
  

  useEffect(() => {
    if (usersStatus === 'idle') {
      dispatch(fetchSuggestedUsers());
    }
  }, [dispatch, usersStatus]);

  useEffect(() => {
    if (convLoading === 'idle') {
      dispatch(fetchAllConversations());
    }
  }, [dispatch, convLoading]);

  useEffect(() => {
    // Merge and de-duplicate conversations and suggested users
    const filterConv = conversations.filter((user) => user.user !== null);
    const newConversations = users.map((user) => {
      const conversation = filterConv.find((conv) => conv.user._id === user._id);
      if (conversation) {
        return { ...user, message: conversation.message,
           unReadCount: conversation.unReadCount,
           time: conversation.createdAt,
           conversationId: conversation.conversationId,
           pinned: conversation.pinned };
      }
      else {
        return { ...user, message: "suggested chat", unReadCount: 0 }
      }
    });

    setUniqueUsers(newConversations);
    setFilteredUsers(newConversations);

  }, [conversations, users]);

  const handleChatClick = (user) => {
    dispatch(setActiveChat(user));
    dispatch(fetchMessages({ userId: user._id }));
    handleClick();
  
    // Reset the unReadCount for the clicked user
    setUniqueUsers((prevUsers) =>
      prevUsers.map((u) =>
        u._id === user._id
          ? { ...u, unReadCount: 0 }
          : u
      )
    );
  };

  useEffect(() => {
    if (preselectedUser) {
        const user = users.find(u => u._id === preselectedUser._id);
        if (user) {
            onSelectChat(user);
            handleClick();
        }
    }
}, [preselectedUser, users]);



  useImperativeHandle(ref, () => ({
    updateRecentMessages: (newMessage, isSender) => {
      const updatedUsers = [...uniqueUsers];
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
  
      setUniqueUsers(updatedUsers); 
      setFilteredUsers(updatedUsers);
    },
  }));
  
  

  return (
    <div className="flex flex-col w-full border-r bg-[var(--bg-color)] h-screen overflow-y-auto shadow-lg">
      <div className="px-4 py-3 border-b ">
        <div className="flex justify-end">
          <img loading="lazy" className="h-7" src={dot} alt="Menu" />
        </div>
        <div className="flex justify-between my-2 mb-4">
          <h2 className="font-montserrat text-lg font-bold text-gray-800">Recent</h2>
          <div className="flex justify-end w-[40%]">
            <img loading="lazy" className="h-5" src={search} alt="search" />
            <img loading="lazy" className="mx-2 ml-3 h-5" src={filter} alt="filter" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className={`font-montserrat text-sm px-3 py-1 ${activeTab === "All"? "bg-[var(--main-color)]" : "bg-[var(--sidebar-text-color)]"} text-white rounded-3xl`}
          onClick={() => handleTabToggle("All")}
          >All</button>
          <button className={`font-montserrat text-sm px-2 py-1 ${activeTab === "Pinned"? "bg-[var(--main-color)]" : "bg-[var(--sidebar-text-color)]"} text-white rounded-3xl`}
          onClick={() => handleTabToggle("Pinned")}
          >Pinned</button>
          <button className={`font-montserrat text-sm px-2 py-1 ${activeTab === "Unread"? "bg-[var(--main-color)]" : "bg-[var(--sidebar-text-color)]"} text-white rounded-3xl`}
          onClick={() => handleTabToggle("Unread")}
          >Unread</button>
          <button className={`font-montserrat text-sm px-2 py-1 ${activeTab === "Tips"? "bg-[var(--main-color)]" : "bg-[var(--sidebar-text-color)]"} text-white rounded-3xl`}
          onClick={() => handleTabToggle("Tips")}
          >Tips</button>
        </div>
      </div>
      {(usersStatus === 'loading' || convLoading === 'loading') && <Loading />}
      {(usersStatus === 'failed' || convLoading === 'failed') && (
        <p className="text-center mt-4 text-red-500">{usersError || convError}</p>
      )}
      <ul className="divide-y divide-gray-200">
        {filteredUsers.map((user, index) => (
          <li key={index} className="flex items-center justify-between px-4 py-3 hover:bg-gray-100">
            <div onClick={() => handleChatClick(user)} className="flex items-center flex-1 space-x-3">
              <img loading="lazy"
                src={user.personal_info?.profile_img || '/default-avatar.png'}
                alt={user.personal_info?.fullname || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-montserrat text-sm font-semibold text-gray-800">{user.personal_info?.fullname || 'Unknown User'}</h3>
                <p className={`${user.unReadCount > 0 && "font-bold"} font-montserrat text-xs text-black truncate w-48`}>{user.message || 'No recent message'}</p>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-[0.75rem] self-start font-[600] text-black">{user.time? formatTimeTo12Hour(user.time) : "" }</p>
              {user.unReadCount > 0 ? (
                <div className="font-montserrat text-[10px] flex items-center justify-center px-2 py-2 w-3 h-3 bg-[var(--main-color)] rounded-full mt-1 text-white">{user.unReadCount}</div>
              ):(
                <div className="font-montserrat text-[10px] flex items-center justify-center px-2 py-2 w-3 h-3 bg-[var(--main-color)] rounded-full mt-1 text-white opacity-0"></div>
              )}
              {user.pinned ? (
                <PushPinIcon
                  fontSize="small"
                  className="text-[var(--main-color)] cursor-pointer"
                  onClick={() => handlePin(user.conversationId, "unpin")}
                />
              ) : (
                <PushPinOutlinedIcon
                  fontSize="small"
                  className="text-gray-500 cursor-pointer"
                  onClick={() => handlePin(user.conversationId, "pin")}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

RecentChats.displayName = 'RecentChats';

RecentChats.propTypes = {
  handleClick: PropTypes.func.isRequired,
};

export default RecentChats;

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { formatTime, formatTimeTo12Hour } from '../common/utils';
import { fetchMessages, sendMessage } from "../store/chatSlice";
import { addUnread } from '../store/authSlice';
import { io } from "socket.io-client";
import dot from "../imgs/dot.png";

const ChatSection = ({ handleNewMessage, selectedChat }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeChat } = useSelector((state) => state.chat);
  const [chatMessages, setChatMessages] = useState([]); // Manage local chat messages state
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socket = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatMessages]);

  useEffect(() => {
    socket.current = io(`${baseUrl}`, {
      query: { userId: user._id },
    });

    useEffect(() => {
      if (selectedChat) {
        dispatch(setActiveChat(selectedChat));
        dispatch(fetchMessages({ userId: selectedChat._id }));
      }
    }, [selectedChat]);

    socket.current.on('connect', () => {
      // console.log('Connected to socket server');
    });

    socket.current.on('getOnlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socket.current.on('newMessage', async (message) => {
      try {
        // Handle the new message
        handleNewMessage(message, false);

        // Call the deliveredMessage API
        const response = await axios.post(
          `${baseUrl}/api/message/messages/${message._id}/delivered`,
          {},
          { withCredentials: true }
        );

        // console.log("Message delivery status updated:", response.data);

        setChatMessages((prevMessages) => [...prevMessages, message]);
      } catch (error) {
        console.error("Error marking message as delivered:", error);
      }
    });


    socket.current.on('messageDelivered', (message) => {
      const deliveredMessage = chatMessages.map((msg) =>
        msg._id === message.messageId
          ? { ...msg, delivered: true, deliveredAt: message.deliveredAt }
          : msg
      )
      setChatMessages(deliveredMessage)
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user, activeChat, socket, chatMessages, setChatMessages, handleNewMessage]);

  useEffect(() => {
    if (activeChat) {
      dispatch(addUnread(false))
      dispatch(fetchMessages({ receiverId: activeChat._id })).then((action) => {
        if (action.payload) {
          setChatMessages(action.payload);

          // Mark messages as read
          action.payload.forEach(async (message) => {
            if (!message.isRead && message.senderId === activeChat._id) {
              // console.log("here again")
              try {
                await axios.post(
                  `${baseUrl}/api/message/messages/${message._id}/read`,
                  {},
                  { withCredentials: true }
                );
              } catch (error) {
                console.error("Error marking message as read:", error);
              }
            }
          });
        }
      });
    }
  }, [dispatch, activeChat]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      const timestamp = new Date().toISOString();
      const tempMessage = {
        senderId: user._id,
        receiverId: activeChat._id,
        message: newMessage,
        time: timestamp,
        isTemporary: true,
      };
      handleNewMessage(tempMessage, true)

      setChatMessages((prevMessages) => [...prevMessages, tempMessage]);
      setNewMessage('');

      try {
        const action = await dispatch(
          sendMessage({ receiverId: activeChat._id, message: newMessage })
        );
        if (action.payload) {
          setChatMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg === tempMessage ? action.payload : msg
            )
          );
        }
      } catch (error) {
        setChatMessages((prevMessages) =>
          prevMessages.filter((msg) => msg !== tempMessage)
        );
        console.error('Message sending failed:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-color)] w-full">
      {activeChat ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center space-x-3">
              <img loading="lazy"
                src={activeChat.personal_info.profile_img}
                alt={activeChat.personal_info.fullname}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-montserrat text-sm font-semibold text-gray-800">{activeChat.personal_info.fullname}</h3>
                {
                  onlineUsers.includes(activeChat?._id) ? <p className="font-montserrat text-xs text-gray-500">Online</p> :
                    <p className="font-montserrat text-xs text-gray-500">Offline</p>
                }

              </div>
            </div>
            <button className="text-gray-600 hover:text-gray-800">
              <img loading="lazy" className="h-7" src={dot} alt="" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[var(--bg-color)]
                      [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-track]:rounded-full
                      [&::-webkit-scrollbar-track]:bg-gray-100
                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-thumb]:bg-gray-300
                      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
              ">
            {chatMessages.map((message, index) => (
              message.senderId === user._id ? (
                <div key={index} className="flex items-end justify-end space-x-2">
                  <div className="w-[70%] flex items-center gap-1 justify-end">
                    <div className="flex flex-col items-end">
                      <div className="flex w-fit">
                        <button className="text-gray-400 hover:text-gray-600">
                          <img loading="lazy" className="h-7" src={dot} alt="" />
                        </button>
                        <div className="px-4 py-3 rounded-3xl shadow-md bg-[var(--main-color)] text-white">
                          <p className="font-montserrat text-sm">{message.message}</p>
                        </div>
                      </div>
                      <p className="font-montserrat mr-3 text-xs text-right mt-1 opacity-75">
                        {message.time ? formatTimeTo12Hour(message.time) : message.createdAt ? formatTimeTo12Hour(message.createdAt) : ""}
                      </p>
                      {
                        message.isRead ? (
                          <p className="font-montserrat mr-3 text-xs text-right mt-1 opacity-75 text-[var(--main-color)]">
                            <i className="fas fa-check-double"></i>
                          </p>

                        ) : message.isDelivered ? (

                          <p className="font-montserrat mr-3 text-xs text-right mt-1 opacity-75 text-gray-400">
                            <i className="fas fa-check-double"></i>
                          </p>
                        ) : (
                          <p className="font-montserrat mr-3 text-xs text-right mt-1 opacity-75 text-gray-400">
                            <i className="fas fa-check"></i>
                          </p>
                        )
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <div key={index} className="flex items-end justify-start">
                  <div className="w-[70%] flex items-center gap-0 justify-start">
                    <div className="flex flex-col items-start">
                      <div className="flex w-fit">
                        <div className="px-4 py-3 rounded-3xl shadow-md bg-[var(--sidebar-text-color)] text-white">
                          <p className="font-montserrat w-[100%] text-sm">{message.message}</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <img loading="lazy" className="h-7" src={dot} alt="" />
                        </button>
                        <button className="pt-1 text-gray-400 hover:text-gray-600">
                          <i className="fi fi-rs-heart"></i>
                        </button>
                      </div>
                      <p className="font-montserrat ml-3 text-xs text-right mt-1">{message.time ? formatTimeTo12Hour(message.time) : message.createdAt ? formatTimeTo12Hour(message.createdAt) : ""}</p>
                    </div>
                  </div>
                </div>
              )
            ))}
            {/* Dummy div to scroll to */}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center px-4 py-3 border-t bg-[var(--bg-color)]"
          >
            <button className="mr-3 text-gray-500 hover:text-gray-700">
              <i className="fi fi-rr-picture text-lg"></i>
            </button>

            <button className="mr-3 text-gray-500 hover:text-gray-700">
              <i className="fi fi-rr-folder text-lg"></i>
            </button>

            <input
              type="text"
              className="font-montserrat flex-1 px-4 py-2 bg-[var(--bg-color)] border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <button
              type="submit"
              className="ml-3 w-10 h-10 flex items-center justify-center bg-[var(--main-color)] text-white rounded-full hover:bg-orange-600"
            >
              <i className="fi fi-rr-paper-plane"></i>
            </button>
          </form>
        </>)
        : (
          <div>Select A Chat</div>
        )}
    </div>
  );
};

export default ChatSection;

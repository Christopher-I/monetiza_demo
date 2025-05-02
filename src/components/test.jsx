import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, sendMessage } from "../store/chatSlice";
import { addUnread } from "../store/authSlice";
import { io } from "socket.io-client";
import { FiImage, FiLock, FiPaperclip, FiSend, FiSmile, FiFolder } from "react-icons/fi";
import PaymentModal from "./PaymentModal";

const ChatSectionTest = ({ handleNewMessage }) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { activeChat } = useSelector((state) => state.chat);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedImages, setSelectedImages] = useState([]); // Stores uploaded images
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const messagesEndRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const socket = useRef(null);
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [chatMessages]);

    useEffect(() => {
        socket.current = io(`${baseUrl}`, { query: { userId: user._id } });

        socket.current.on("connect", () => {
            // console.log("Connected to socket server");
        });

        socket.current.on("getOnlineUsers", (users) => {
            setOnlineUsers(users);
        });

        socket.current.on("newMessage", async (message) => {
            try {
                handleNewMessage(message, false);
                await axios.post(
                    `${baseUrl}/api/message/messages/${message._id}/delivered`,
                    {},
                    { withCredentials: true }
                );
                setChatMessages((prevMessages) => [...prevMessages, message]);
            } catch (error) {
                console.error("Error marking message as delivered:", error);
            }
        });

        return () => {
            socket.current.disconnect();
        };
    }, [user, activeChat, handleNewMessage]);

    useEffect(() => {
        if (activeChat) {
            dispatch(addUnread(false));
            dispatch(fetchMessages({ receiverId: activeChat._id })).then((action) => {
                if (action.payload) {
                    setChatMessages(action.payload);
                }
            });
        }
    }, [dispatch, activeChat]);

    // Handle image selection
    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);

        if (files.length + selectedImages.length > 10) {
            alert("You can only upload up to 10 images.");
            return;
        }

        setSelectedImages((prevImages) => [...prevImages, ...files]);
    };


    // const handleSendMessage = async (e) => {
    //     e.preventDefault();

    //     if (!newMessage.trim() && selectedImages.length === 0) return; // Ensure at least text or images

    //     const tempMessage = {
    //         senderId: user._id,
    //         receiverId: activeChat._id,
    //         message: newMessage,
    //         media: selectedImages.map((img) => URL.createObjectURL(img)), // Show images instantly
    //         isTemporary: true, // Used to identify messages not yet confirmed by the server
    //     };

    //     setChatMessages((prevMessages) => [...prevMessages, tempMessage]); // Show message instantly in UI
    //     setNewMessage("");

    //     const formData = new FormData();
    //     formData.append("senderId", user._id);
    //     formData.append("receiverId", activeChat._id);
    //     formData.append("message", newMessage);

    //     selectedImages.forEach((image) => {
    //         formData.append("files", image); // Append images
    //     });

    //     setSelectedImages([]); // Clear selected images after adding to UI

    //     try {
    //         const response = await axios.post(`${baseUrl}/api/message/send-message`, formData, {
    //             headers: { "Content-Type": "multipart/form-data" },
    //         });

    //         setChatMessages((prevMessages) =>
    //             prevMessages.map((msg) =>
    //                 msg === tempMessage ? response.data : msg // Replace temporary message with server response
    //             )
    //         );
    //     } catch (error) {
    //         console.error("Message sending failed:", error);
    //         setChatMessages((prevMessages) =>
    //             prevMessages.filter((msg) => msg !== tempMessage) // Remove failed message
    //         );
    //     }
    // };


    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() && selectedImages.length === 0) return; // Ensure message or image exists

        // Create a temporary message to display instantly
        const tempMessage = {
            senderId: user._id,
            receiverId: activeChat._id,
            message: newMessage,
            media: selectedImages.map((file) => URL.createObjectURL(file)), // Temporary local preview
            time: new Date().toISOString(),
            isTemporary: true, // Mark as temporary for UI updates
        };

        setChatMessages((prevMessages) => [...prevMessages, tempMessage]); // Show instantly
        setNewMessage("");

        const formData = new FormData();
        formData.append("senderId", user._id);
        formData.append("receiverId", activeChat._id);
        formData.append("message", newMessage);

        selectedImages.forEach((image) => {
            formData.append("files", image);
        });

        setSelectedImages([]); // Clear UI selection

        try {
            const response = await axios.post(`${baseUrl}/api/message/send-message`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Replace temporary message with actual server response
            setChatMessages((prevMessages) =>
                prevMessages.map((msg) => (msg === tempMessage ? response.data : msg))
            );
        } catch (error) {
            console.error("Error sending message:", error);
            // Remove temporary message if request fails
            setChatMessages((prevMessages) =>
                prevMessages.filter((msg) => msg !== tempMessage)
            );
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[var(--bg-color)] w-full">
            {activeChat ? (
                <>
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <div className="flex items-center space-x-3">
                            <img
                                src={activeChat.personal_info.profile_img}
                                alt={activeChat.personal_info.fullname}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-montserrat text-sm font-semibold text-gray-800">
                                    {activeChat.personal_info.fullname}
                                </h3>
                                <p className="font-montserrat text-xs text-gray-500">
                                    {onlineUsers.includes(activeChat?._id) ? "Online" : "Offline"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {!paymentCompleted && activeChat.creatorSettings.isCreator ? (
                        <div className="flex flex-col items-center justify-start">
                            <div className="flex flex-col items-center mt-10 space-y-4">
                                <FiLock className="text-4xl text-black" />
                                <p className="text-lg text-black font-bold">Tip to unlock chat with creator</p>
                            </div>
                            <button
                                onClick={() => setIsTipModalOpen(true)}
                                className="mt-6 px-6 w-[40%] py-3 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition duration-300"
                            >
                                Tip Now
                            </button>
                            <PaymentModal
                                isOpen={isTipModalOpen}
                                onClose={() => setIsTipModalOpen(false)}
                                activeChat={activeChat}
                                baseUrl={baseUrl}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">


                                {chatMessages.map((message, index) => (
                                    <div key={index} className={`flex w-full text-white ${message.senderId === user._id ? "justify-end" : "justify-start"}`}>
                                        <div className={`chat-message max-w-[250px] py-2 px-6 rounded-2xl ${message.senderId === user._id ? "bg-orange-500" : "bg-gray-500"}`}>
                                            {/* Show message text */}
                                            {message.message}

                                            {/* Show images if available */}
                                            {message.media && message.media.length > 0 && (
                                                <div className="grid grid-cols-3 gap-2 mt-2">
                                                    {message.media.map((img, i) => (
                                                        <img key={i} src={img} alt="Sent media" className="w-16 h-16 rounded-md object-cover" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}


                            </div>

                            {/* Image Preview Section */}
                            {/* Image Preview Section */}
                            {selectedImages.length > 0 && (
                                <div className="flex flex-wrap p-2 bg-gray-100 rounded-lg">
                                    {selectedImages.map((image, index) => (
                                        <img
                                            key={index}
                                            src={URL.createObjectURL(image)}
                                            alt="preview"
                                            className="w-16 h-16 object-cover rounded-md m-1"
                                        />
                                    ))}
                                </div>
                            )}


                            {/* Message Input Section */}
                            <form onSubmit={handleSendMessage} className="flex items-center p-3 border-t bg-[#F1F5F9] rounded-lg shadow-md">
                                {/* Image Upload Button */}
                                <label className="cursor-pointer p-2 text-[#807E7E]">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        hidden
                                        onChange={handleImageUpload}
                                    />
                                    <FiImage size={30} />
                                </label>

                                {/* Message Input */}
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 py-2 px-6 mx-2 text-gray-700 bg-gray-100 rounded-full border border-gray-300 outline-none focus:ring-2 focus:ring-orange-500"
                                />

                                {/* Send Button */}
                                <button type="submit" className="p-3 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition duration-300">
                                    <FiSend size={20} />
                                </button>
                            </form>
                        </>
                    )}
                </>
            ) : (
                <div>Select A Chat</div>
            )}
        </div>
    );
};

export default ChatSectionTest;

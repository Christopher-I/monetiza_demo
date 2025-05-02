import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, sendMessage, setActiveChat } from "../store/chatSlice";
import { addUnread } from "../store/authSlice";
import { io } from "socket.io-client";
import dot from "../imgs/dot.png";
import { FiImage, FiLock, FiPaperclip, FiSend, FiSmile, FiVideo } from "react-icons/fi";
import PaymentModal from "./PaymentModal";
import imgicon from '../imgs/image.png'
import { FiFolder } from "react-icons/fi";
import { toast } from "react-toastify";
import PropTypes from 'prop-types'; // Add this import
import online from '../imgs/online.png'
import offline from '../imgs/offline.png'
import ChatSubscribeModal, { MediaSubscribeModal } from "./ChatSubscribeModal";
import { formatTimeTo12Hour } from "../common/utils";


const ChatSectionTest = ({ handleNewMessage, selectedChat, onBack }) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { activeChat } = useSelector((state) => state.chat);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [paymentCompleted, setPaymentCompleted] = useState(false); // Track payment status
    const messagesEndRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const socket = useRef(null);
    const [selectedImages, setSelectedImages] = useState([]); // Stores uploaded images
    const [isPaid, setIsPaid] = useState(false);
    const [amount, setAmount] = useState(0);
    const [singleMessage, setSingleMessage] = useState({
        _id: undefined,
        amount: undefined,
    });

    // const [isModalOpen, setIsModalOpen] = useState(false);

    const [isTipModalOpen, setIsTipModalOpen] = useState(false);
    const [isMediaTipModalOpen, setIsMediaTipModalOpen] = useState(false);

    const openTipModal = () => setIsTipModalOpen(true);
    const closeTipModal = () => setIsTipModalOpen(false);
    const [imageModal, setImageModal] = useState({ open: false, imageUrl: "" });

    const handleImageClick = (imageUrl) => {
        setImageModal({ open: true, imageUrl });
    };

    const handleMoreImagesClick = (allImages) => {
        setImageModal({ open: true, imageUrl: "", allImages });
    };


    const closeImageModal = () => {
        setImageModal({ open: false, imageUrl: "" });
    };
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [chatMessages]);

    useEffect(() => {
        if (selectedChat) {
            dispatch(setActiveChat(selectedChat));
            dispatch(fetchMessages({ userId: selectedChat._id }));
        }
    }, [selectedChat, dispatch])

    useEffect(() => {
        socket.current = io(`${baseUrl}`, {
            query: { userId: user._id },
        });

        socket.current.on("connect", () => {
            // console.log("Connected to socket server");
        });

        socket.current.on("getOnlineUsers", (users) => {
            setOnlineUsers(users);
        });

        socket.current.on("newMessage", async (message) => {
            try {
                handleNewMessage(message, false);

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

        return () => {
            socket.current.disconnect();
        };
    }, [user, activeChat, handleNewMessage]);

    useEffect(() => {
        //
        // console.log(activeChat, "activeChat")
    }, [activeChat])

    useEffect(() => {

        if (activeChat) {
            dispatch(addUnread(false));
            dispatch(fetchMessages({ receiverId: activeChat?._id })).then((action) => {
                if (action.payload) {
                    setChatMessages(action.payload);
                    if (paymentCompleted === true) {
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
                }
            });
            setPaymentCompleted(false)
            // isSubscribed
            const checkIsSubscribed = async () => {
                const response = await axios.post(`${baseUrl}/api/message/isSubscribed`, { creator: activeChat?._id }, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

                if (response) {
                    // 
                    setPaymentCompleted(true)
                }
            }
            checkIsSubscribed()
        }
    }, [dispatch, activeChat, paymentCompleted]);



    // Handle image selection
    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);

        if (files.length + selectedImages.length > 10) {
            toast.error("You can only upload up to 10 images.");
            return;
        }

        // console.log(files, "files")

        setSelectedImages((prevImages) => [...prevImages, ...files]);
    };

    const handleVideoUpload = (event) => {
        const files = Array.from(event.target.files);

        if (files.length + selectedImages.length > 10) {
            toast.error("You can only upload up to 10 images.");
            return;
        }

        setSelectedImages((prevImages) => [...prevImages, ...files]);
    };


    // const handleSendMessage = async (e) => {
    //     e.preventDefault();
    //     if (newMessage.trim() !== "") {
    //         const tempMessage = {
    //             senderId: user._id,
    //             receiverId: activeChat?._id,
    //             message: newMessage,
    //             time: new Date().toISOString(),
    //             isTemporary: true,
    //         };

    //         handleNewMessage(tempMessage, true);
    //         setChatMessages((prevMessages) => [...prevMessages, tempMessage]);
    //         setNewMessage("");

    //         try {
    //             const action = await dispatch(
    //                 sendMessage({ receiverId: activeChat?._id, message: newMessage })
    //             );
    //             if (action.payload) {
    //                 setChatMessages((prevMessages) =>
    //                     prevMessages.map((msg) =>
    //                         msg === tempMessage ? action.payload : msg
    //                     )
    //                 );
    //             }
    //         } catch (error) {
    //             setChatMessages((prevMessages) =>
    //                 prevMessages.filter((msg) => msg !== tempMessage)
    //             );
    //             console.error("Message sending failed:", error);
    //         }
    //     }
    // };

    useEffect(() => {
        // console.log(isPaid, "isPaid")
        
    }, [isPaid]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if(amount == 0 && isPaid) return;

        if (!newMessage.trim() && selectedImages.length === 0) return;

        // Check if the chat is paid and if the user has paid
        if (activeChat?.chatSettings?.isPaidChat && !paymentCompleted) {
            openTipModal(); // Show payment modal
            return;
        }

        // If isPaidChat is false or payment is completed, proceed with sending the message
        const tempMessage = {
            senderId: user._id,
            receiverId: activeChat?._id,
            message: newMessage,
            image: selectedImages.map((file) => URL.createObjectURL(file)),
            createdAt: new Date().toISOString(),
            isTemporary: true,
        };

        setChatMessages((prevMessages) => [...prevMessages, tempMessage]);
        setNewMessage("");

        ///////////////

        // try {
        //     const action = await dispatch(
        //         sendMessage({ receiverId: activeChat._id, message: newMessage })
        //     );
        //     if (action.payload) {
        //         setChatMessages((prevMessages) =>
        //         prevMessages.map((msg) =>
        //             msg === tempMessage ? action.payload : msg
        //         )
        //         );
        //     }
        //     } catch (error) {
        //     setChatMessages((prevMessages) =>
        //         prevMessages.filter((msg) => msg !== tempMessage)
        //     );
        //     console.error('Message sending failed:', error);
        //     }
        // }

        ///////////////

        const formData = new FormData();
        formData.append("senderId", user._id);
        formData.append("receiverId", activeChat?._id);
        formData.append("message", newMessage);
        formData.append("isPaid", isPaid);
        if(isPaid) formData.append("amount", amount);

        selectedImages.forEach((image) => {
            formData.append("media", image);
        });

        setSelectedImages([]);

        try {
            const response = await axios.post(`${baseUrl}/api/message/send-message`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setChatMessages((prevMessages) =>
                prevMessages.map((msg) => (msg === tempMessage ? response.data.message : msg))
            );
        } catch (error) {
            console.error("Message sending failed:", error);
            setChatMessages((prevMessages) => prevMessages.filter((msg) => msg !== tempMessage));
        }
    };
    // console.log("Active Chat Object:", activeChat);

    ChatSectionTest.propTypes = {
        selectedChat: PropTypes.object,
        handleNewMessage: PropTypes.func.isRequired,
        onBack: PropTypes.func
    };


    return (
        <div className="flex flex-col h-screen bg-[var(--bg-color)] w-full max-h-screen relative pb-[140px] lg:pb-0">
            {activeChat ? (
                <>
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <div className="flex items-center space-x-3">
                            <img
                                src={activeChat?.personal_info.profile_img}
                                alt={activeChat?.personal_info.fullname}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div >
                                <h3 className="font-montserrat text-sm font-semibold text-gray-800">
                                    {activeChat?.personal_info.fullname}
                                </h3>
                                {onlineUsers.includes(activeChat?._id) ? (
                                    <p className="font-montserrat text-xs text-gray-500 flex "><img src={online} alt="online icon" className="w-5 h-5 " />Online</p>
                                ) : (
                                    <p className="font-montserrat text-xs text-gray-500 flex"><img src={offline} alt="offline icon" className="w-5 h-5 " />Offline</p>
                                )}
                            </div>
                        </div>
                        {/* Add back button for mobile */}

                    </div>

                    {!paymentCompleted && activeChat?.chatSettings?.isPaidChat ? (
                        <div className="flex flex-col items-center justify-start">
                            {/* Lock Icon and Message */}
                            <div className="flex flex-col items-center mt-10 space-y-4">
                                <div className="text-4xl text-black">

                                    <FiLock />
                                </div>
                                <p className="text-lg text-[#000000] font-bold font-Montserrat">Tip to unlock chat with creator</p>
                            </div>

                            {/* Tip Now Button */}
                            <button
                                onClick={openTipModal}

                                // onClick={handleTip}
                                className="mt-6 px-6 w-[40%] py-3 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition duration-300"
                            >
                                Chat Now
                            </button>


                            {/* <PaymentModal
                                onClick={openTipModal}
                                isOpen={isTipModalOpen}
                                onClose={closeTipModal}
                                activeChat={activeChat}
                                baseUrl={baseUrl}
                            /> */}
                            <ChatSubscribeModal
                                isOpen={isTipModalOpen}
                                onClose={() => closeTipModal(false)}
                                onSuccess={() => setPaymentCompleted(true)}
                                data={{
                                    authorId: activeChat?._id,
                                    profilePic: activeChat?.personal_info.profile_img,
                                    name: activeChat?.personal_info.fullname,
                                    verified: activeChat?.creatorSettings.isCreator,
                                    username: activeChat?.personal_info.username,
                                    subDetails: activeChat?.chatSettings.pricePerText
                                }}
                            />
                        </div>

                    ) : (
                        <>

                            <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-6">
                                                <MediaSubscribeModal
                                                    isOpen={isMediaTipModalOpen}
                                                    onClose={() => setIsMediaTipModalOpen(false)}
                                                    onSuccess={() => setIsMediaTipModalOpen(false)}
                                                    data={{
                                                        authorId: activeChat?._id,
                                                        messageId: singleMessage?._id,
                                                        profilePic: activeChat?.personal_info.profile_img,
                                                        name: activeChat?.personal_info.fullname,
                                                        verified: activeChat?.creatorSettings.isCreator,
                                                        username: activeChat?.personal_info.username,
                                                        subDetails: singleMessage.amount
                                                    }}
                                                />
                                {chatMessages?.map((message, index) => {
                                    // const isMessageFromCreator = activeChat?.isCreator;

                                    const isUserSubscribed = message.paidBy?.includes(user._id); // paymentCompleted || message.paidBy?.includes(user._id); // Check if user has unlocked
                                    const isMessageFromCreator = activeChat?.creatorSettings?.isCreator ?? false;
                                    // const isUserSubscribed = paymentCompleted || activeChat?.subscriptions?.includes(user._id) ?? false;

                                    // console.log("Is Message From Creator:", isMessageFromCreator);
                                    // console.log("Is User Subscribed:", isUserSubscribed);

                                    // console.log(isMessageFromCreator, isUserSubscribed, "isMessageFromCreator, isUserSubscribed")
                                    return (
                                        <div key={index} className={`flex flex-col w-full ${message.senderId === activeChat?._id ? "items-start" : "items-end"}`}>
                                            <div className={`chat-message max-w-[280px] py-2 px-6 rounded-2xl relative ${message.senderId === activeChat?._id ? "bg-gray-700" : (message.image?.length > 0 && Array.isArray(message?.image)) ? "bg-gray-300" : "bg-orange-500"} text-white`}>
                                            <span className="break-words w-full">{linkifyText(message.message)}</span>
                                                

                                                {/* Handling Image Visibility */}
                                                {/* {message.image?.length > 0 && (
                                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                                        {message.image.slice(0, 4).map((img, i) => (
                                                            <div key={i} className="relative w-28 h-28">
                                                                {isMessageFromCreator && !isUserSubscribed ? (
                                                                    <>
                                                                        <div className="w-28 h-28 bg-gray-300 rounded-md flex items-center justify-center blur-xl">
                                                                            <FiLock size={24} className="text-gray-700" />
                                                                        </div>
                                                                        <button
                                                                            onClick={openTipModal}
                                                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-semibold rounded-md"
                                                                        >
                                                                            Unlock
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <img
                                                                        src={img}
                                                                        alt="Sent media"
                                                                        className="w-28 h-28 rounded-md object-cover cursor-pointer"
                                                                        onClick={() => handleImageClick(img)}
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                        {message.image.length > 4 && (
                                                            <div
                                                                className="relative flex items-center justify-center w-28 h-28 bg-gray-500 rounded-md cursor-pointer"
                                                                onClick={() => handleMoreImagesClick(message.image)}
                                                            >
                                                                <p className="text-white text-lg font-bold">+{message.image.length - 4}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )} */}

                                                {((message.image?.length > 0 && Array.isArray(message?.image)) || (message.video?.length > 0 && Array.isArray(message?.video))) && (
                                                    <div className="flex flex-col items-center divide-y">
                                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                                            {[].concat(message.image || [], message.video || [])
                                                                // .slice(0, 4)
                                                                .map((img, i) => (
                                                                    <div key={i} className="relative w-28 h-28">
                                                                        {message?.isPaid && message?.amount > 0 && !(message.senderId === user?._id || message.paidBy?.includes(user?._id)) ? (  // Changed `&&` to `||`
                                                                            <>
                                                                                {/* Blurred Image */}
                                                                                <div className="w-28 h-28 bg-gray-300 rounded-md flex items-center justify-center blur-xl">
                                                                                    <FiLock size={24} className="text-gray-700" />
                                                                                </div>
                                                                                {/* Unlock Button */}
                                                                                {/* <button
                                                                                onClick={openTipModal}
                                                                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-semibold rounded-md"
                                                                            >
                                                                                Unlock
                                                                            </button> */}
                                                                            <button
                                                                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-semibold rounded-md"
                                                                            >
                                                                                <FiLock size={24} className="text-gray-700" />
                                                                                {/* Unlock */}
                                                                            </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {img.split(".").pop() === "mp4" ? 
                                                                                    <video 
                                                                                        src={img}
                                                                                        className="w-28 h-28 rounded-md object-cover cursor-pointer"
                                                                                        onClick={() => handleImageClick(img)}
                                                                                    ></video> : 
                                                                                    <img
                                                                                        src={img}
                                                                                        alt="Sent media"
                                                                                        className="w-28 h-28 rounded-md object-cover cursor-pointer"
                                                                                        onClick={() => handleImageClick(img)}
                                                                                    />
                                                                                }
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                        </div>
                                                        {
                                                            message?.isPaid && message?.amount > 0 && !(message.senderId === user?._id || message.paidBy?.includes(user?._id)) && 
                                                            <>
                                                                <div className="absolute left-0 bottom-[58px] w-full h-[2px] bg-gray-900"></div>
                                                                <button onClick={() => {setSingleMessage({...message}); setIsMediaTipModalOpen(true)}} className="w-[90%] bg-orange-600 rounded-lg p-2 mt-5">Unlock to view content</button>
                                                            </>
                                                        }
                                                        
                                                    </div>
                                                )}
                                                
                                                {/* {message.message} */}
                                            </div>
                                            <div className={`flex w-full max-w-[280px] ${message.senderId === user?._id && "justify-end"}`}>
                                                <p className="font-montserrat mr-3 text-xs text-right mt-1 opacity-75">
                                                    {message.time ? formatTimeTo12Hour(message.time) : message.createdAt ? formatTimeTo12Hour(message.createdAt) : ""}
                                                </p>
                                                { message.senderId === user?._id &&
                                                    <>
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
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef}></div>
                            </div>

                            {/* Place this outside the return statement */}
                            {/* {isTipModalOpen && (
                                <PaymentModal
                                    isOpen={isTipModalOpen}
                                    onClose={closeTipModal}
                                    activeChat={activeChat}
                                    baseUrl={baseUrl}
                                />
                            )} */}

                            {/* 🔹 Image Modal (Full-Screen Preview) */}
                            {imageModal.open && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 p-4" onClick={closeImageModal}>
                                    {imageModal?.allImages?.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {imageModal.allImages.map((img, i) => (
                                                <img key={i} src={img} alt="Preview" className="max-w-full max-h-80 rounded-lg" />
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            {imageModal.imageUrl.split(".").pop() === "mp4" ? 
                                                <video loading="lazy" controls className="max-w-full max-h-full rounded-lg">
                                                    <source src={imageModal.imageUrl} type="video/mp4" />
                                                </video> :
                                                <img src={imageModal.imageUrl} alt="Full Preview" className="max-w-full max-h-full rounded-lg" />
                                            }
                                        </>
                                    )}
                                </div>
                            )}


                            {selectedImages.length > 0 && (
                                <div className="flex w-[380px] flex-wrap p-2 bg-gray-100 rounded-lg">
                                    {selectedImages.map((image, index) => (
                                        <>
                                            {image.type.includes("image/") ? <img
                                                key={index}
                                                src={URL.createObjectURL(image)}
                                                alt="preview"
                                                className="w-20 h-20 object-cover rounded-md m-1"
                                            /> : 
                                            image.type.includes("video/") ? <video
                                                key={index}
                                                src={URL.createObjectURL(image)}
                                                alt="preview"
                                                className="w-20 h-20 object-cover rounded-md m-1"
                                            ></video> : 
                                            null}
                                        </>
                                    ))}
                                </div>
                            )}
                            {selectedImages.length > 0 && (
                                <div className="flex w-[380px] flex-wrap p-2 bg-gray-100">
                                    <select 
                                        name="isPaid" 
                                        defaultValue={false} 
                                        onChange={(e) => {console.log(e.target.value); setIsPaid(e.target.value);}}
                                        // onSelect={(e) => {setIsPaid(e.target.value)}}
                                        >
                                        <option value={true} onSelect={() => {setIsPaid(true)}}>Paid</option>
                                        <option value={false}  onSelect={() => {setIsPaid(false)}}>Free</option>
                                    </select>
                                    {isPaid == "true" && <div className="flex gap-2">
                                        <span className="ml-4">Amount:</span>
                                        <div className="border border-black flex rounded-lg px-2 gap-1 bg-white"><span className="">$</span><input type="number" name="" value={amount} onChange={(e) => setAmount(e.target.value)} id="" className="rounded-lg bg-white w-10" /></div>
                                    </div>}
                                </div>
                            )}
                            
                            <form onSubmit={handleSendMessage} className="message-input absolute lg:relative bottom-[75px] lg:bottom-0 left-0 h-[60] flex items-center p-3 border-t bg-[#F1F5F9] rounded-lg shadow-md">
                                <label className="cursor-pointer p-2 text-[#807E7E]">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        hidden
                                        onChange={handleImageUpload}
                                        disabled={activeChat?.chatSettings?.isPaidChat && !paymentCompleted}
                                    />
                                    <FiImage size={30} />
                                </label>
                                <label className="cursor-pointer p-2 text-[#807E7E]">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        multiple
                                        hidden
                                        onChange={handleImageUpload}
                                        disabled={activeChat?.chatSettings?.isPaidChat && !paymentCompleted}
                                    />
                                    <FiVideo size={30} />
                                </label>
                                {/* <button type="button" className="p-2 text-[#807E7E]">
                                    <FiVideo size={30} />
                                </button> */}

                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 py-2 px-6 mx-2 text-gray-700 bg-gray-100 rounded-full border border-gray-300 outline-none focus:ring-2 focus:ring-orange-500"
                                    disabled={activeChat?.chatSettings?.isPaidChat && !paymentCompleted}
                                />
                                <button
                                    type="submit"
                                    className="p-3 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition duration-300"
                                    disabled={activeChat?.chatSettings?.isPaidChat && !paymentCompleted}
                                >
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



// const linkifyText = (text) => {
//     const urlRegex = /https?:\/\/[^\s]+/g; // Simple regex to detect URLs starting with http:// or https://
//     // const urlRegex = /\b(?:https?|http|ftp|mailto|file|data):\/\/[^\s/$.?#].[^\s]*/g; // Simple regex to detect URLs starting with http:// or https://
//     console.log(text, "text")
//     console.log(urlRegex.test(text), "urlRegex.test(text)")
  
//     return text.split(urlRegex).map((part, index, array) => {
//         console.log(part, "part")
//       if (index < array.length - 1) {
//         // Check if part is followed by a URL, and create an anchor tag
//         return (
//           <>
//             {part}
//             <a href={array[index + 1]} target="_blank" rel="noopener noreferrer">
//               {array[index + 1]}
//             </a>
//           </>
//         );
//       }
//       return part; // Return the last part without a link
//     });
//   };

const linkifyText = (text) => {
  const urlRegex = /\b(?:https?|ftp|mailto|file|data):\/\/[^\s/$.?#].[^\s]*/g;

  // Find all URLs using the regex
  const matches = [...text.matchAll(urlRegex)];

  if (matches.length === 0) return text; // If no URLs are found, return the original text

  let result = [];
  let lastIndex = 0;

  matches.forEach((match, idx) => {
    const [url] = match; // The matched URL

    // Add the text between the last match and the current match
    result.push(text.slice(lastIndex, match.index));

    // Add the anchor tag for the matched URL
    result.push(
      <a
        key={idx}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500"
      >
        {url}
      </a>
    );

    // Update the last index to the end of the current match
    lastIndex = match.index + url.length;
  });

  // Add the remaining part of the text after the last URL
  result.push(text.slice(lastIndex));

  return result;
};





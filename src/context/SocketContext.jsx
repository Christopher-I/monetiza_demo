import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

// Create the context
const SocketContext = createContext(null);

// Custom hook to use the context
export const useSocket = () => useContext(SocketContext);

// Provider component
export const SocketProvider = ({ children, userId }) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const navigate = useNavigate();
    const { user, unRead } = useSelector((state) => state.auth);
    const [socket, setSocket] = useState(null);
    userId = user?._id

    useEffect(() => {
        if (userId) {
            const newSocket = io(`${baseUrl}`, {
                query: { userId },
            });

            // Listen for connection events
            newSocket.on("connect", (message) => {
                console.log("Socket connected:", newSocket.id);
                console.log("Socket connected message:", message);
                newSocket.on("getOnlineUsers", (message) => {
                    console.log("Socket connected with online users:", message, userId);
                });
                newSocket.on("notification", (message) => {
                    console.log("Socket connected with notification:", message);
                    console.log(message, "neutral message")
                    switch (message.type) {
                        case "like":
                            console.log(message, "liked message")
                            toast.info(message.message, {onClick: () => navigate(`/post/${message.postId}`)})
                            break;
                    
                        default:
                            break;
                    }
                });
            });

            newSocket.on("disconnect", () => {
                console.log("Socket disconnected");
            });

            setSocket(newSocket);

            // Cleanup on component unmount
            return () => {
                newSocket.disconnect();
            };
        }
    }, [userId]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

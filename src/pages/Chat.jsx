import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import withProtectedRoute from "../hoc/ProtectedRoute";
import RecentChats from "../components/RecentChattest";
import ChatSectionTest from "../components/ChatSectionTest";

// Icons
import { FiArrowLeft, FiUsers, FiMessageSquare, FiSearch, FiX } from "react-icons/fi";

const ChatPage = () => {
  // State
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  
  // Refs
  const recentChatsRef = useRef();
  const searchInputRef = useRef();
  
  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  const receiver = location.state?.receiver;
  const initialMessage = location.state?.message;
  
  // Determine if mobile based on screen width
  const isMobile = windowWidth < 768;
  
  // Update selected chat when receiving location state
  useEffect(() => {
    if (receiver) {
      setSelectedChat(receiver);
    }
  }, [receiver]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Focus search input when search is activated
  useEffect(() => {
    if (isSearchActive) {
      searchInputRef.current?.focus();
    }
  }, [isSearchActive]);
  
  // Update recent chats when new message arrives
  const handleNewMessage = (newMessage, isSender) => {
    recentChatsRef.current?.updateRecentMessages(newMessage, isSender);
    
    // Show alert if chat is not selected (mobile only)
    if (isMobile && !selectedChat && !isSender) {
      setNewMessageAlert(true);
      
      // Clear alert after 3 seconds
      setTimeout(() => {
        setNewMessageAlert(false);
      }, 3000);
    }
  };
  
  // Handle selecting a chat
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    
    // Update URL to include chat user ID without page reload
    navigate(
      `/chat/${chat._id}`, 
      { 
        state: { receiver: chat }, 
        replace: true 
      }
    );
  };
  
  // Handle going back to chat list on mobile
  const handleBackToList = () => {
    setSelectedChat(null);
    
    // Update URL to remove user ID
    navigate('/chat', { replace: true });
  };
  
  // Toggle search
  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    setSearchQuery("");
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };
  
  // Animation variants
  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 }
  };
  
  return (
    <div className="flex flex-1 h-[100vh] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Desktop layout */}
      {!isMobile ? (
        <div className="flex w-full h-full">
          {/* Chat list sidebar */}
          <div className="w-1/3 xl:w-1/4 border-r border-gray-200 dark:border-gray-800 h-full bg-white dark:bg-gray-900">
            {/* Chat list header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                <FiMessageSquare className="mr-2" />
                Messages
              </h2>
              
              <div className="flex items-center space-x-2">
                {isSearchActive ? (
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                    />
                    <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    {searchQuery && (
                      <button 
                        onClick={clearSearch}
                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={toggleSearch}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <FiSearch className="w-5 h-5" />
                  </button>
                )}
                
                <button className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <FiUsers className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Recent chats list */}
            <div className="h-[calc(100%-57px)] overflow-hidden">
              <RecentChats
                ref={recentChatsRef}
                onSelectChat={handleSelectChat}
                preselectedUser={receiver}
                searchQuery={searchQuery}
                selectedChat={selectedChat}
              />
            </div>
          </div>
          
          {/* Chat content area */}
          <div className="w-2/3 xl:w-3/4 h-full bg-gray-50 dark:bg-gray-900">
            {selectedChat ? (
              <ChatSectionTest
                key={selectedChat._id}
                selectedChat={selectedChat}
                handleNewMessage={handleNewMessage}
                initialMessage={initialMessage}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FiMessageSquare className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Choose a contact from the left to start messaging or search for a specific person.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mobile layout */
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div 
              key="chat"
              className="h-full w-full"
              {...pageTransition}
            >
              <ChatSectionTest
                selectedChat={selectedChat}
                handleNewMessage={handleNewMessage}
                onBack={handleBackToList}
                initialMessage={initialMessage}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="chatList"
              className="h-full w-full flex flex-col"
              {...pageTransition}
            >
              {/* Chat list header */}
              <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                  <FiMessageSquare className="mr-2" />
                  Messages
                </h2>
                
                <div className="flex items-center space-x-2">
                  {isSearchActive ? (
                    <div className="relative flex-1">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-8 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                      />
                      <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      {searchQuery && (
                        <button 
                          onClick={clearSearch}
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={toggleSearch}
                      className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <FiSearch className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Recent chats list */}
              <div className="flex-grow overflow-hidden bg-white dark:bg-gray-900">
                <RecentChats
                  ref={recentChatsRef}
                  onSelectChat={handleSelectChat}
                  preselectedUser={receiver}
                  searchQuery={searchQuery}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {/* New message alert on mobile */}
      <AnimatePresence>
        {newMessageAlert && isMobile && !selectedChat && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-5 left-0 right-0 mx-auto w-[90%] max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-2 mr-3">
                <FiMessageSquare className="text-orange-500 w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">New message received</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tap to view your conversations</p>
              </div>
              <button 
                onClick={() => setNewMessageAlert(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hidden file input for image uploads */}
      <input type="file" id="image-upload" className="hidden" accept="image/*" />
    </div>
  );
};

export default withProtectedRoute(ChatPage, 'chat');
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Icons
import { FiX, FiCheck, FiSend, FiSearch, FiUsers, FiLink } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ShareLinkDMs = ({ enabled, message, onClose = () => {} }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { user } = useSelector((state) => state.auth);
  
  // States
  const [conversations, setConversations] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Refs
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch recent conversations when modal is opened
  useEffect(() => {
    if (enabled) {
      fetchRecentChats();
      
      // Auto-focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
      
      // Handle click outside
      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [enabled]);
  
  // Fetch recent conversations
  const fetchRecentChats = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.get(`${baseUrl}/api/message/all-recent-message`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        const sortedConversations = response.data.messages.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error("Error fetching recent chats:", error);
      toast.error("Couldn't load conversations");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle recipient selection
  const toggleRecipient = (recipientId) => {
    setSelectedRecipients(prev => 
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };
  
  // Send message to all selected recipients
  const handleSendMessage = async () => {
    if (selectedRecipients.length === 0) {
      toast.info("Select at least one recipient");
      return;
    }
    
    setIsSending(true);
    let successCount = 0;
    let failedCount = 0;
    
    try {
      // Create an array of promises for all send requests
      const sendPromises = selectedRecipients.map(async (recipientId) => {
        const formData = new FormData();
        formData.append("senderId", user._id);
        formData.append("receiverId", recipientId);
        formData.append("message", message);
        formData.append("isPaid", false);
        
        try {
          await axios.post(`${baseUrl}/api/message/send-message`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });
          successCount++;
          return true;
        } catch (error) {
          failedCount++;
          return false;
        }
      });
      
      // Wait for all promises to resolve
      await Promise.all(sendPromises);
      
      if (successCount > 0) {
        toast.success(`Shared with ${successCount} ${successCount === 1 ? 'person' : 'people'}`);
      }
      
      if (failedCount > 0) {
        toast.error(`Failed to share with ${failedCount} ${failedCount === 1 ? 'recipient' : 'recipients'}`);
      }
      
      onClose();
    } catch (error) {
      console.error("Error sending messages:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSending(false);
    }
  };
  
  // Filter conversations based on search query
  const filteredConversations = searchQuery.trim() 
    ? conversations.filter(convo => 
        convo.user.personal_info.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (convo.user.personal_info.username && 
         convo.user.personal_info.username.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : conversations;
  
  // If modal is not enabled, don't render anything
  if (!enabled) return null;
  
  // Animation variants
  const modalVariants = {
    hidden: { y: 200, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { y: 200, opacity: 0, transition: { duration: 0.2 } }
  };
  
  return (
    <AnimatePresence>
      {enabled && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            ref={modalRef}
            className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiLink className="text-gray-500 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Share with</h2>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedRecipients.length > 0 && (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {selectedRecipients.length} selected
                    </span>
                  )}
                  
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    aria-label="Close"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Preview of what's being shared */}
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 line-clamp-2 flex items-start">
                <FiLink className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                <p className="overflow-hidden text-ellipsis">{message}</p>
              </div>
              
              {/* Search box */}
              <div className="relative mt-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400 w-5 h-5" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <FiX className="text-gray-400 w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Recipients list */}
            <div className="max-h-[40vh] overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-orange-500"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3">
                    <FiUsers className="text-gray-400 w-6 h-6" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? "No matching conversations found" : "No recent conversations"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredConversations.map((convo) => {
                    const isSelected = selectedRecipients.includes(convo.user.id);
                    return (
                      <button
                        key={convo.user.id}
                        onClick={() => toggleRecipient(convo.user.id)}
                        className={`relative flex flex-col items-center p-4 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' 
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1">
                            <FiCheck className="w-3 h-3" />
                          </div>
                        )}
                        
                        {/* Avatar */}
                        <div className="w-16 h-16 mb-2 relative rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                          {convo.user.personal_info.profile_img ? (
                            <img
                              src={convo.user.personal_info.profile_img}
                              alt={convo.user.personal_info.fullname}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/64?text=' + 
                                  convo.user.personal_info.fullname.charAt(0).toUpperCase();
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xl font-bold">
                              {convo.user.personal_info.fullname.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        {/* Name and username */}
                        <p className="font-medium text-gray-900 dark:text-white text-sm text-center truncate max-w-full">
                          {convo.user.personal_info.fullname}
                        </p>
                        {convo.user.personal_info.username && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
                            @{convo.user.personal_info.username}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer / Action buttons */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={selectedRecipients.length === 0 || isSending}
                  className={`px-6 py-2 rounded-lg flex items-center space-x-2 font-medium text-white transition-colors ${
                    selectedRecipients.length === 0 || isSending
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      <span>Send{selectedRecipients.length > 0 ? ` (${selectedRecipients.length})` : ''}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareLinkDMs;
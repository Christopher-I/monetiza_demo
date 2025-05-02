import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import withProtectedRoute from "../hoc/ProtectedRoute";
import TopCreators from "../components/TopCreators";
import { timeAgo } from "../helpers/dataformat.helper";

// Icons
import { 
  FiBell, FiCheck, FiTrash2, FiChevronDown, 
  FiUser, FiHeart, FiMessageCircle, FiCheckCircle,
  FiUsers, FiStar, FiFilter, FiSearch, FiX 
} from "react-icons/fi";

const Notifications = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notificationFilters, setNotificationFilters] = useState({
    comments: true,
    likes: true,
    follows: true,
    mentions: true,
    system: true
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [timestampUpdate, setTimestampUpdate] = useState(Date.now());
  
  // Refs
  const searchInputRef = useRef(null);
  const filterMenuRef = useRef(null);
  
  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 2 minutes
    const refreshInterval = setInterval(() => {
      fetchNotifications(false);
    }, 120000);
    
    return () => clearInterval(refreshInterval);
  }, [activeTab]);
  
  // Update time ago display
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestampUpdate(Date.now());
    }, 30000);
    
    return () => clearInterval(interval); 
  }, []);
  
  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);
  
  // Handle click outside filter menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Filter notifications based on search and filters
  useEffect(() => {
    let result = [...notifications];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(notification => 
        notification.mainText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.subText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filters
    result = result.filter(notification => {
      if (notification.type === 'like' && !notificationFilters.likes) return false;
      if (notification.type === 'comment' && !notificationFilters.comments) return false;
      if (notification.type === 'follow' && !notificationFilters.follows) return false;
      if (notification.type === 'mention' && !notificationFilters.mentions) return false;
      if (notification.type === 'system' && !notificationFilters.system) return false;
      return true;
    });
    
    setFilteredNotifications(result);
  }, [notifications, searchQuery, notificationFilters]);
  
  // Fetch notifications from API
  const fetchNotifications = async (showLoadingState = true) => {
    if (showLoadingState) {
      setIsLoading(true);
    }
    
    try {
      const response = await axios.get(
        activeTab === "all"
          ? `${baseUrl}/api/notifications`
          : `${baseUrl}/api/notifications/verified`, 
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      const notifs = response.data.notifications || [];
      setNotifications(notifs);
      
      // Check for unread notifications
      setHasUnread(notifs.some(notif => !notif.read));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${baseUrl}/api/notifications/mark-read`, 
        {}, 
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      setHasUnread(false);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };
  
  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${baseUrl}/api/notifications/${notificationId}/mark-read`, 
        {}, 
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );
      
      // Check if any unread notifications remain
      const anyUnread = notifications.some(
        notif => notif._id !== notificationId && !notif.read
      );
      
      setHasUnread(anyUnread);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Delete all notifications
  const handleDeleteAll = async () => {
    setIsConfirmingClear(false);
    
    try {
      await axios.delete(
        `${baseUrl}/api/notifications`, 
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      setNotifications([]);
      setHasUnread(false);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error deleting notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };
  
  // Delete single notification
  const deleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    
    try {
      await axios.delete(
        `${baseUrl}/api/notifications/${notificationId}`, 
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      
      toast.success("Notification removed");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to remove notification");
    }
  };
  
  // Toggle filter
  const toggleFilter = (filter) => {
    setNotificationFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  // Refresh notifications
  const refreshNotifications = () => {
    fetchNotifications();
    toast.info("Notifications refreshed");
  };
  
  // Handle notification click (navigation)
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FiHeart className="text-red-500" />;
      case 'comment':
        return <FiMessageCircle className="text-blue-500" />;
      case 'follow':
        return <FiUser className="text-green-500" />;
      case 'mention':
        return <FiAt className="text-purple-500" />;
      case 'system':
        return <FiBell className="text-orange-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.07 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Notifications Section */}
      <div className="w-full lg:w-3/5 xl:w-2/3 h-full flex flex-col bg-white dark:bg-gray-800 shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              {hasUnread && (
                <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm font-medium text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-600"></span>
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Search toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-full ${
                  showSearch 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label="Search notifications"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              
              {/* Filter menu */}
              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`p-2 rounded-full ${
                    showFilterMenu 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Filter notifications"
                >
                  <FiFilter className="w-5 h-5" />
                </button>
                
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-10">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by type</h3>
                    </div>
                    <div className="py-2">
                      {[
                        { key: 'likes', label: 'Likes', icon: <FiHeart className="w-4 h-4 text-red-500" /> },
                        { key: 'comments', label: 'Comments', icon: <FiMessageCircle className="w-4 h-4 text-blue-500" /> },
                        { key: 'follows', label: 'Follows', icon: <FiUser className="w-4 h-4 text-green-500" /> },
                        { key: 'mentions', label: 'Mentions', icon: <FiAt className="w-4 h-4 text-purple-500" /> },
                        { key: 'system', label: 'System', icon: <FiBell className="w-4 h-4 text-orange-500" /> }
                      ].map(filter => (
                        <div key={filter.key} className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <input
                            id={`filter-${filter.key}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            checked={notificationFilters[filter.key]}
                            onChange={() => toggleFilter(filter.key)}
                          />
                          <label 
                            htmlFor={`filter-${filter.key}`}
                            className="ml-3 flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            {filter.icon}
                            <span className="ml-2">{filter.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Refresh */}
              <button
                onClick={refreshNotifications}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Refresh notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              {/* Mark all as read */}
              {hasUnread && (
                <button
                  onClick={markAllAsRead}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Mark all as read"
                >
                  <FiCheck className="w-5 h-5" />
                </button>
              )}
              
              {/* Clear all notifications */}
              {notifications.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsConfirmingClear(true)}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Clear all notifications"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                  
                  {isConfirmingClear && (
                    <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-10 p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        Are you sure you want to clear all notifications?
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setIsConfirmingClear(false)}
                          className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAll}
                          className="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Search bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex">
            <button
              className={`flex-1 py-3 font-medium text-center transition-colors focus:outline-none ${
                activeTab === "all"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button
              className={`flex-1 py-3 font-medium text-center transition-colors focus:outline-none ${
                activeTab === "verified"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("verified")}
            >
              <div className="flex items-center justify-center">
                <span>Verified</span>
                <FiCheckCircle className="ml-1 h-4 w-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            // Loading state
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-600 h-10 w-10 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-4 space-y-3"
            >
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all group ${
                    notification.read 
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                      : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-700'
                  }`}
                >
                  {!notification.read && (
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-orange-500"></span>
                  )}
                  
                  <div className="flex items-start">
                    <div className="relative flex-shrink-0 mr-3">
                      <img
                        src={notification.profileUrl || "https://via.placeholder.com/40"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/40?text=U";
                        }}
                      />
                      
                      <div className="absolute -bottom-1 -right-1 rounded-full p-1 bg-white dark:bg-gray-800">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">{notification.mainText}</span>{" "}
                        {notification.subText}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {notification.createdAt ? timeAgo(notification.createdAt) : "No Date"}
                      </p>
                    </div>
                    
                    {/* Delete button (shown on hover) */}
                    <button
                      onClick={(e) => deleteNotification(notification._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-opacity"
                      aria-label="Delete notification"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FiBell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery 
                  ? "No matching notifications" 
                  : "No notifications yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                {searchQuery 
                  ? `No notifications match "${searchQuery}". Try a different search term or clear your filters.` 
                  : "When you receive notifications, they'll appear here. Check back later!"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Creators Section */}
      <div className="hidden lg:block lg:w-2/5 xl:w-1/3 h-full overflow-hidden bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <TopCreators />
      </div>
    </div>
  );
};

export default withProtectedRoute(Notifications, "notifications");
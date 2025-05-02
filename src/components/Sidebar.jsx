import PropTypes from "prop-types";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { addUnread } from '../store/authSlice';

// Components
import GoLiveModal from "./GoLiveModal";

// Icons
import {
  FiHome, FiUser, FiMessageCircle, FiUsers, FiFolder, 
  FiCreditCard, FiPlusCircle, FiMoreHorizontal, FiLogOut,
  FiSettings, FiBarChart2, FiDollarSign, FiVideo, FiBell, FiBriefcase
} from "react-icons/fi";

// Logo
import Logo from "../imgs/u-logo.png";

// Base URL
const baseUrl = import.meta.env.VITE_BASE_URL;

const Sidebar = ({ activeSidebar }) => {
  const { user, unRead } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHoveringItem, setIsHoveringItem] = useState(null);

  // Refs
  const moreMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const sidebarRef = useRef(null);

  // Define sidebar items with icons from react-icons
  const sidebarItems = [
    { 
      icon: <FiHome className="w-6 h-6" />, 
      label: "Home", 
      name: "home", 
      link: "/feed" 
    },
    { 
      icon: <FiUser className="w-6 h-6" />, 
      label: "Be a Creator", 
      name: "creator", 
      link: "/creator",
      showIf: !user?.creatorSettings?.isCreator
    },
    { 
      icon: <FiUsers className="w-6 h-6" />, 
      label: "Creators Page", 
      name: "creatorPage", 
      link: "/creatorPage",
      showIf: user?.creatorSettings?.isCreator
    },
    { 
      icon: <FiMessageCircle className="w-6 h-6" />, 
      label: "Chat", 
      name: "chat", 
      link: "/chat",
      badge: unRead ? unreadCount : null
    },
    { 
      icon: <FiUsers className="w-6 h-6" />, 
      label: "Following", 
      name: "following", 
      link: "/following" 
    },
    { 
      icon: <FiFolder className="w-6 h-6" />, 
      label: "Collections", 
      name: "collection", 
      link: "/collections" 
    },
    { 
      icon: <FiCreditCard className="w-6 h-6" />, 
      label: "My Cards", 
      name: "cards", 
      link: "/my-cards" 
    },
    { 
      icon: <FiUser className="w-6 h-6" />, 
      label: "Profile", 
      name: "profile", 
      link: "/profile" 
    },
  ];

  // Define more menu items
  const moreMenuItems = [
    { 
      icon: <FiBarChart2 className="w-6 h-6" />, 
      label: "Analytics Dashboard", 
      name: "dashboard", 
      link: "/dashboard" 
    },
    { 
      icon: <FiBriefcase className="w-6 h-6" />, 
      label: "Content Management", 
      name: "content", 
      link: "/content" 
    },
    { 
      icon: <FiSettings className="w-6 h-6" />, 
      label: "Settings", 
      name: "settings", 
      link: "/settings" 
    },
    { 
      icon: <FiDollarSign className="w-6 h-6" />, 
      label: "Earnings", 
      name: "earnings", 
      link: "/earnings" 
    },
    { 
      icon: <FiVideo className="w-6 h-6" />, 
      label: "Start Live", 
      name: "livestream", 
      link: "#",
      action: () => setIsModalOpen(true)
    },
    { 
      icon: <FiBell className="w-6 h-6" />, 
      label: "Notifications", 
      name: "notifications", 
      link: "/notifications" 
    },
  ];

  // Check if any item in the more menu is active
  const isMoreActive = moreMenuItems.some(item => item.name === activeSidebar);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread messages
  useEffect(() => {
    const fetchPendingMessages = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/message/all-recent-message`, {
          withCredentials: true,
        });

        if (response.data.success) {
          const truthyMessages = response.data.messages.filter(
            (messageObj) => messageObj.unReadCount > 0
          );
          
          if (truthyMessages.length > 0) {
            dispatch(addUnread(true));
            setUnreadCount(truthyMessages.length);
          }
        }
      } catch (error) {
        console.error("Failed to fetch unread messages:", error);
      }
    };

    fetchPendingMessages();
    
    // Set up periodic checking
    const intervalId = setInterval(fetchPendingMessages, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Handle sidebar item click
  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      navigate(item.link);
    }
    
    // Close menus on navigation
    setIsMoreMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post(`${baseUrl}/api/auth/signout`, {}, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      toast.success('Logged out successfully');
      navigate("/signin");
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  // Toggle sidebar collapse (for future use)
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <motion.div 
      ref={sidebarRef}
      initial={{ width: 300 }}
      animate={{ width: isCollapsed ? 80 : 300 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 relative shadow-sm overflow-hidden"
    >
      {/* Logo area */}
      <div className="flex items-center p-5 border-b border-gray-100 dark:border-gray-800">
        <Link to="/feed" className="flex items-center">
          <img 
            src={Logo} 
            alt="Monetiza+" 
            className="h-10 w-auto" 
          />
          {!isCollapsed && (
            <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">
              Monetiza+
            </span>
          )}
        </Link>
        
        {/* Collapse toggle button (optional for future use) */}
        {/* <button 
          onClick={toggleSidebar} 
          className="ml-auto p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        >
          {isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
        </button> */}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1.5">
          {/* Main menu items */}
          {sidebarItems.map((item) => {
            // Skip items that shouldn't be shown
            if (item.showIf === false) return null;
            
            const isActive = activeSidebar === item.name;
            const isHovering = isHoveringItem === item.name;
            
            return (
              <motion.button
                key={item.name}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setIsHoveringItem(item.name)}
                onMouseLeave={() => setIsHoveringItem(null)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-3 ${
                  isActive
                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center">
                  <div className={`${isActive ? "text-orange-500" : "text-gray-500 dark:text-gray-400"}`}>
                    {item.icon}
                  </div>
                  
                  {!isCollapsed && (
                    <span className="ml-4 text-base">
                      {item.label}
                    </span>
                  )}
                </div>
                
                {/* Badge for unread messages */}
                {!isCollapsed && item.badge && (
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
          
          {/* More menu trigger */}
          <motion.button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            onMouseEnter={() => setIsHoveringItem('more')}
            onMouseLeave={() => setIsHoveringItem(null)}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full flex items-center justify-between rounded-xl px-3 py-3 ${
              isMoreActive
                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500 font-medium"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center">
              <div className={`${isMoreActive ? "text-orange-500" : "text-gray-500 dark:text-gray-400"}`}>
                <FiMoreHorizontal className="w-6 h-6" />
              </div>
              
              {!isCollapsed && (
                <span className="ml-4 text-base">
                  More
                </span>
              )}
            </div>
            
            {!isCollapsed && (
              <svg 
                className={`w-4 h-4 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d={isMoreMenuOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                />
              </svg>
            )}
          </motion.button>
          
          {/* More menu dropdown */}
          <AnimatePresence>
            {isMoreMenuOpen && !isCollapsed && (
              <motion.div
                ref={moreMenuRef}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden ml-8 border-l-2 border-gray-100 dark:border-gray-800 pl-2"
              >
                {moreMenuItems.map((item) => {
                  const isActive = activeSidebar === item.name;
                  
                  return (
                    <motion.button
                      key={item.name}
                      onClick={() => handleItemClick(item)}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center text-left rounded-xl px-2 py-2.5 my-0.5 ${
                        isActive
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className={`${isActive ? "text-orange-500" : "text-gray-500 dark:text-gray-400"}`}>
                        {item.icon}
                      </div>
                      <span className="ml-3 text-sm">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* New publication button */}
      <div className="px-3 pb-4">
        <motion.button
          onClick={() => navigate("/new")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
        >
          <FiPlusCircle className="w-5 h-5" />
          {!isCollapsed && <span>New Publication</span>}
        </motion.button>
      </div>

      {/* User profile section */}
      <div className="relative p-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="w-full flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {/* User avatar */}
          <div className="relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            {user?.personal_info?.profile_img ? (
              <img
                src={user.personal_info.profile_img}
                alt={user.personal_info.fullname || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 font-bold">
                {getInitials(user?.personal_info?.fullname || "User")}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.personal_info?.fullname || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{user?.personal_info?.username || "username"}
                </p>
              </div>
              
              <svg 
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d={isUserMenuOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
            </>
          )}
        </button>
        
        {/* User menu dropdown */}
        <AnimatePresence>
          {isUserMenuOpen && !isCollapsed && (
            <motion.div
              ref={userMenuRef}
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
            >
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {user?.personal_info?.profile_img ? (
                      <img
                        src={user.personal_info.profile_img}
                        alt={user.personal_info.fullname || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 font-bold">
                        {getInitials(user?.personal_info?.fullname || "User")}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.personal_info?.fullname || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{user?.personal_info?.username || "username"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <Link 
                  to="/profile" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  View profile
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Settings
                </Link>
                <Link 
                  to="/signin" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Add existing account
                </Link>
                <Link 
                  to="/signup" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Create new account
                </Link>
              </div>
              
              <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiLogOut className="mr-2 w-4 h-4" />
                  Log out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Go Live Modal */}
      <GoLiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(data = {}) => {
          setIsModalOpen(false);
          navigate("/stream", { state: data });
        }}
      />
    </motion.div>
  );
};

Sidebar.propTypes = {
  activeSidebar: PropTypes.string.isRequired,
};

export default Sidebar;
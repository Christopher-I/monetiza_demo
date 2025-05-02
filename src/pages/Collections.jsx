import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import withProtectedRoute from "../hoc/ProtectedRoute";
import PostCard from "../components/PostCard";
import SubscriptionCard from "../components/SubscriptionCard";
import BlockedCard from "../components/BlockedCard";
import ShareLinkDMs from "../components/ShareLinkDMs";

// Icons
import { 
  FiArrowLeft, FiBookmark, FiUsers, FiSlash, 
  FiSearch, FiFilter, FiCheck, FiAlertCircle,
  FiHeart, FiGrid, FiList, FiClock 
} from "react-icons/fi";

const Collections = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { user } = useSelector((state) => state.auth);
  
  // State
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("Subscriptions");
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [sortOrder, setSortOrder] = useState("recent"); // "recent" or "oldest"
  const [message, setMessage] = useState("");
  const [messageOpen, setMessageOpen] = useState(false);
  
  // Refs
  const contentRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Fetch data
  useEffect(() => {
    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        const [bookmarksRes, subscriptionsRes, blockedRes] = await Promise.all([
          axios.get(`${baseUrl}/api/post/bookmarks`, { withCredentials: true }),
          axios.get(`${baseUrl}/api/auth/subscriptions`, { withCredentials: true }),
          axios.get(`${baseUrl}/api/auth/blocked`, { withCredentials: true })
        ]);
        
        setBookmarkedPosts(bookmarksRes.data.posts || []);
        setSubscriptions(subscriptionsRes.data.users || []);
        setBlockedUsers(blockedRes.data.blockedUsers || []);
      } catch (err) {
        console.error("Error fetching collections data:", err);
        toast.error("Failed to load your collections. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [baseUrl]);
  
  // Handle unblock user
  const handleUnblock = async (userId) => {
    try {
      await axios.post(
        `${baseUrl}/api/auth/unblock/${userId}`, 
        {}, 
        { withCredentials: true }
      );
      
      setBlockedUsers((prev) => prev.filter((user) => user._id !== userId));
      toast.success("User has been unblocked successfully");
    } catch (err) {
      console.error("Failed to unblock user:", err);
      toast.error("Failed to unblock user. Please try again.");
    }
  };
  
  // Handle bookmark toggle
  const handleBookmarkToggle = async (postId) => {
    try {
      await axios.post(
        `${baseUrl}/api/post/bookmark`, 
        { postId }, 
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      setBookmarkedPosts((prev) => prev.filter((post) => post._id !== postId));
      toast.success("Post removed from bookmarks");
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
      toast.error("Failed to update bookmark. Please try again.");
    }
  };
  
  // Filter and sort data based on search query and sort order
  const filteredBookmarks = bookmarkedPosts
    .filter(post => 
      searchQuery === "" || 
      post?.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post?.author?.personal_info?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post?.author?.personal_info?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "recent") {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      } else {
        return new Date(a.publishedAt) - new Date(b.publishedAt);
      }
    });
    
  const filteredSubscriptions = subscriptions
    .filter(sub => 
      searchQuery === "" || 
      sub?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
  const filteredBlocked = blockedUsers
    .filter(blocked => 
      searchQuery === "" || 
      blocked?.personal_info?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blocked?.personal_info?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  // Check if mobile view
  const isMobile = windowWidth < 768;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="flex flex-1 h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Share message modal */}
      <ShareLinkDMs 
        enabled={messageOpen}
        message={message}
        onClose={() => setMessageOpen(false)}
      />
      
      <div className="flex flex-1 flex-col md:flex-row h-full">
        {/* Sidebar - Categories */}
        <AnimatePresence mode="wait">
          {(!isMobile || !showMobileDetail) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobile ? "100%" : "300px", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collections</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage your saved items and subscriptions
                </p>
              </div>
              
              <nav className="py-4">
                {[
                  { 
                    title: "Subscriptions", 
                    icon: <FiUsers />, 
                    count: subscriptions.length,
                    description: "Creators you subscribe to"
                  },
                  { 
                    title: "Bookmarks", 
                    icon: <FiBookmark />, 
                    count: bookmarkedPosts.length,
                    description: "Posts you've saved"
                  },
                  { 
                    title: "Blocked", 
                    icon: <FiSlash />, 
                    count: blockedUsers.length,
                    description: "Users you've blocked"
                  }
                ].map((item) => (
                  <button
                    key={item.title}
                    className={`w-full flex items-start px-6 py-4 ${
                      activeTab === item.title 
                        ? "bg-orange-50 dark:bg-orange-900/20 border-r-4 border-orange-500" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      setActiveTab(item.title);
                      setSearchQuery("");
                      if (isMobile) setShowMobileDetail(true);
                      
                      // Reset content scroll position
                      if (contentRef.current) {
                        contentRef.current.scrollTop = 0;
                      }
                    }}
                  >
                    <div className={`flex-shrink-0 mr-4 p-2 rounded-lg ${
                      activeTab === item.title 
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" 
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}>
                      {item.icon}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h3 className={`font-medium ${
                        activeTab === item.title 
                          ? "text-orange-600 dark:text-orange-400" 
                          : "text-gray-800 dark:text-gray-200"
                      }`}>
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </span>
                        
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          activeTab === item.title 
                            ? "bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200" 
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}>
                          {item.count}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main content */}
        <AnimatePresence mode="wait">
          {(!isMobile || showMobileDetail) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900"
            >
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="flex items-center">
                  {isMobile && (
                    <button
                      onClick={() => setShowMobileDetail(false)}
                      className="mr-3 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {activeTab}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activeTab === "Subscriptions" && `${subscriptions.length} creator${subscriptions.length !== 1 ? 's' : ''}`}
                      {activeTab === "Bookmarks" && `${bookmarkedPosts.length} saved post${bookmarkedPosts.length !== 1 ? 's' : ''}`}
                      {activeTab === "Blocked" && `${blockedUsers.length} blocked user${blockedUsers.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Search */}
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={`Search ${activeTab.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* View toggle (grid/list) for bookmarks */}
                    {activeTab === "Bookmarks" && (
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-1.5 rounded ${
                            viewMode === "list" 
                              ? "bg-white dark:bg-gray-600 text-orange-500 shadow-sm" 
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                          aria-label="List view"
                        >
                          <FiList className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-1.5 rounded ${
                            viewMode === "grid" 
                              ? "bg-white dark:bg-gray-600 text-orange-500 shadow-sm" 
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                          aria-label="Grid view"
                        >
                          <FiGrid className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Sort order dropdown */}
                    {activeTab === "Bookmarks" && (
                      <div className="relative">
                        <button
                          onClick={() => setSortOrder(sortOrder === "recent" ? "oldest" : "recent")}
                          className="flex items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          aria-label="Sort order"
                        >
                          <FiClock className="w-4 h-4" />
                          <span className="text-xs hidden sm:inline">
                            {sortOrder === "recent" ? "Newest first" : "Oldest first"}
                          </span>
                        </button>
                      </div>
                    )}
                    
                    {/* Additional filter for subscriptions */}
                    {activeTab === "Subscriptions" && (
                      <div className="relative">
                        <button
                          onClick={() => {/* Toggle filter */}}
                          className="flex items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          aria-label="Filter subscriptions"
                        >
                          <FiFilter className="w-4 h-4" />
                          <span className="text-xs hidden sm:inline">Filter</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Content area */}
              <div 
                ref={contentRef}
                className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
              >
                {isLoading ? (
                  // Skeleton loading based on active tab
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                          </div>
                        </div>
                        {activeTab === "Bookmarks" && (
                          <>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                            <div className="flex justify-between">
                              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                              <div className="flex gap-2">
                                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Subscriptions tab
                  activeTab === "Subscriptions" && (
                    filteredSubscriptions.length > 0 ? (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {filteredSubscriptions.map((sub, index) => (
                          <motion.div key={sub._id || index} variants={itemVariants}>
                            <SubscriptionCard
                              profileImage={sub.profileImg || "https://via.placeholder.com/40"}
                              username={sub.username}
                              bio={sub.bio}
                              price={sub.price}
                              status={sub.status}
                              fullname={sub.fullname}
                              id={sub._id}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <FiUsers className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                          {searchQuery ? "No matching subscriptions" : "No subscriptions yet"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                          {searchQuery 
                            ? `No subscriptions match "${searchQuery}". Try a different search term.` 
                            : "Subscribe to creators to see their exclusive content in your feed."}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    )
                  )
                )}
                
                {/* Bookmarks tab */}
                {!isLoading && activeTab === "Bookmarks" && (
                  filteredBookmarks.length > 0 ? (
                    viewMode === "list" ? (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                      >
                        {filteredBookmarks.map((post, index) => (
                          <motion.div key={post._id || index} variants={itemVariants}>
                            <PostCard
                              postId={post._id}
                              authorId={post?.author?._id}
                              name={post?.author?.personal_info?.fullname}
                              profilePic={post?.author?.personal_info?.profile_img}
                              verified={post?.author?.creatorSettings?.isCreator}
                              createdAt={new Date(post.publishedAt)}
                              username={post?.author?.personal_info?.username}
                              text={post.caption}
                              image={post.image}
                              audio={post.audio}
                              video={post.video}
                              comments={post.comments?.length}
                              likes={post.likes?.length}
                              bookmarked={true}
                              isLiked={post.likes?.includes(user?._id)}
                              refetch={() => handleBookmarkToggle(post._id)}
                              setMessage={setMessage}
                              setMessageOpen={setMessageOpen}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      // Grid view for bookmarks
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4"
                      >
                        {filteredBookmarks.map((post, index) => (
                          <motion.div 
                            key={post._id || index} 
                            variants={itemVariants}
                            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            {post.image && (
                              <div className="relative h-48 overflow-hidden">
                                <img 
                                  src={post.image} 
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookmarkToggle(post._id);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-black/50 rounded-full text-orange-500"
                                >
                                  <FiBookmark className="w-4 h-4 fill-current" />
                                </button>
                              </div>
                            )}
                            
                            <div className="p-4">
                              <div className="flex items-center mb-3">
                                <img 
                                  src={post?.author?.personal_info?.profile_img || "https://via.placeholder.com/40"} 
                                  alt={post?.author?.personal_info?.fullname}
                                  className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                                    {post?.author?.personal_info?.fullname}
                                    {post?.author?.creatorSettings?.isCreator && (
                                      <span className="ml-1 text-orange-500">✓</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    @{post?.author?.personal_info?.username}
                                  </p>
                                </div>
                              </div>
                              
                              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                                {post.caption}
                              </p>
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                  <FiHeart className="w-3 h-3 mr-1" />
                                  <span>{post.likes?.length || 0}</span>
                                  <span className="mx-1">•</span>
                                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    setMessage(`Check out this post: ${window.location.origin}/post/${post._id}`);
                                    setMessageOpen(true);
                                  }}
                                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  <FiShare2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <FiBookmark className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        {searchQuery ? "No matching bookmarks" : "No bookmarks yet"}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                        {searchQuery 
                          ? `No bookmarks match "${searchQuery}". Try a different search term.` 
                          : "Save posts that you want to revisit later by clicking the bookmark icon."}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )
                )}
                
                {/* Blocked users tab */}
                {!isLoading && activeTab === "Blocked" && (
                  filteredBlocked.length > 0 ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {filteredBlocked.map((blockedUser) => (
                        <motion.div key={blockedUser.id || blockedUser._id} variants={itemVariants}>
                          <BlockedCard
                            profileImg={blockedUser.personal_info.profile_img}
                            username={blockedUser.personal_info.fullname}
                            isVerified={blockedUser.personal_info.isVerified}
                            handleUnblock={() => handleUnblock(blockedUser.id || blockedUser._id)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <FiSlash className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        {searchQuery ? "No matching blocked users" : "No blocked users"}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        {searchQuery 
                          ? `No blocked users match "${searchQuery}". Try a different search term.` 
                          : "Users you've blocked will appear here. You can unblock them at any time."}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="px-4 py-2 mt-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default withProtectedRoute(Collections);
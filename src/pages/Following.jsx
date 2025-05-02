import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Components
import PostCard from "../components/PostCard";
import TopCreators from "../components/TopCreators";
import ShareLinkDMs from "../components/ShareLinkDMs";
import withProtectedRoute from "../hoc/ProtectedRoute";

// Icons
import { FiRefreshCw, FiUsers, FiFilter, FiArrowUp, FiSearch } from "react-icons/fi";

const Following = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { user } = useSelector((state) => state.auth);
  const feedRef = useRef(null);
  
  // State
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOpen, setMessageOpen] = useState(false);
  const [sortOption, setSortOption] = useState("recent");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);
  
  // Determine if mobile based on screen width
  const isMobile = windowWidth < 768;
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Fetch posts on mount and when sort option changes
  useEffect(() => {
    fetchPosts();
  }, [sortOption]);
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (feedRef.current) {
        setShowScrollTop(feedRef.current.scrollTop > 500);
      }
    };
    
    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener('scroll', handleScroll);
      return () => feedElement.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Fetch posts
  const fetchPosts = async () => {
    setIsLoading(true);
    setIsEmpty(false);
    
    try {
      const response = await axios.get(`${baseUrl}/api/post/following?sort=${sortOption}${searchQuery ? `&query=${searchQuery}` : ''}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      const posts = response.data.posts || [];
      setPosts(posts);
      
      if (posts.length === 0) {
        setIsEmpty(true);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to load posts. Please try again.");
      setIsEmpty(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Refresh posts
  const refreshPosts = () => {
    setIsRefreshing(true);
    fetchPosts();
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    fetchPosts();
  };
  
  // Scroll to top
  const scrollToTop = () => {
    feedRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Loading skeletons
  const renderSkeletons = () => (
    <div className="space-y-6 px-4 py-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
          <div className="flex justify-between mt-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
            <div className="flex gap-2">
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  // Empty state
  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <FiUsers className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {searchQuery 
          ? "No matching posts found" 
          : "You're not following anyone yet"}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        {searchQuery 
          ? "We couldn't find any posts matching your search. Try different keywords or clear your search."
          : "Follow some creators to see their posts in your feed. Discover new creators from the suggestions on the right."}
      </p>
      
      {searchQuery ? (
        <button 
          onClick={clearSearch}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
          Clear search
        </button>
      ) : (
        <button 
          onClick={() => window.scrollTo(0, document.body.scrollHeight)}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
          Discover creators
        </button>
      )}
    </motion.div>
  );
  
  return (
    <div className="flex flex-1 h-[100vh] bg-gray-50 dark:bg-gray-900">
      {/* Share message modal */}
      <ShareLinkDMs 
        enabled={messageOpen}
        message={message}
        onClose={() => setMessageOpen(false)}
      />
      
      {/* Main content layout */}
      <div className="flex flex-1 h-full">
        {/* Feed area */}
        <div className="w-full lg:w-3/4 h-full relative bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <FiUsers className="mr-2" />
                Following
              </h1>
              
              <div className="flex items-center space-x-2">
                {/* Search bar */}
                <form onSubmit={handleSearch} className="relative mr-2">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-36 sm:w-64 pl-8 pr-3 py-1.5 text-sm rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </form>
                
                {/* Sort dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="hidden sm:inline">Sort:</span>
                    <span className="font-medium">
                      {sortOption === 'recent' && 'Recent'}
                      {sortOption === 'popular' && 'Popular'}
                      {sortOption === 'oldest' && 'Oldest'}
                    </span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1"
                      >
                        <button 
                          onClick={() => {
                            setSortOption('recent');
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            sortOption === 'recent' 
                              ? 'text-orange-500 font-medium bg-orange-50 dark:bg-orange-900/20' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          Most Recent
                        </button>
                        <button 
                          onClick={() => {
                            setSortOption('popular');
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            sortOption === 'popular' 
                              ? 'text-orange-500 font-medium bg-orange-50 dark:bg-orange-900/20' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          Most Popular
                        </button>
                        <button 
                          onClick={() => {
                            setSortOption('oldest');
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            sortOption === 'oldest' 
                              ? 'text-orange-500 font-medium bg-orange-50 dark:bg-orange-900/20' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          Oldest First
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Refresh button */}
                <button
                  onClick={refreshPosts}
                  disabled={isRefreshing}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Refresh feed"
                >
                  <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content scrollable area */}
          <div 
            ref={feedRef}
            className="h-[calc(100vh-57px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
          >
            {/* Pull to refresh indicator */}
            <AnimatePresence>
              {isRefreshing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-center items-center py-4"
                >
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Refreshing...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Posts feed */}
            {isLoading ? (
              renderSkeletons()
            ) : isEmpty || posts.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="space-y-4 px-4 pt-4 pb-20">
                {posts.map((post, index) => (
                  <motion.div
                    key={post._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
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
                      bookmarked={user?.bookmarks?.includes(post._id)}
                      isLiked={post.likes?.includes(user._id)}
                      isPrivate={post.isPrivate}
                      isPaidPost={post.isPaidPost}
                      price={post.price}
                      purchasedBy={post.purchasedBy}
                      donationTarget={post.donationTarget}
                      currentDonation={post.currentDonation}
                      refetch={refreshPosts}
                      setMessage={setMessage}
                      setMessageOpen={setMessageOpen}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          {/* Scroll to top button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg z-30 transition-colors"
                aria-label="Scroll to top"
              >
                <FiArrowUp className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        {/* Right sidebar - Top Creators */}
        <div className="hidden lg:block w-1/4 h-full border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <TopCreators />
        </div>
      </div>
    </div>
  );
};

export default withProtectedRoute(Following, 'following');
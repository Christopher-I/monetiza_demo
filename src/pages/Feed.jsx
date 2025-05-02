import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Components
import MessageBox from "../components/MessageBox";
import StoriesSection from "../components/Stories";
import PostCard from "../components/PostCard";
import TopCreators from "../components/TopCreators";
import TipsSuccessModal from "../components/TipsSuccessModal";
import ShareLinkDMs from "../components/ShareLinkDMs";
import withProtectedRoute from "../hoc/ProtectedRoute";

// Icons
import { 
  FiRefreshCw, FiArrowUp, FiBookmark, FiHome, FiUsers, 
  FiFilter, FiTrendingUp, FiClock, FiStar
} from "react-icons/fi";

const Feed = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    const navigate = useNavigate();
    const receivedData = location.state;
    const feedRef = useRef(null);

    // State management
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [activeTab, setActiveTab] = useState("For you");
    const [posts, setPosts] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(receivedData ? true : false);
    const [message, setMessage] = useState("");
    const [messageOpen, setMessageOpen] = useState(false);
    const [sortOption, setSortOption] = useState("recent");
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [hasNewContent, setHasNewContent] = useState(false);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);

    // Check for responsive design
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle tip modal on load
    useEffect(() => {
        if (receivedData) {
            setIsModalOpen(true);
        }
    }, [receivedData]);

    // Fetch initial data
    useEffect(() => {
        fetchStatuses();
        fetchPosts();
        
        // Setup periodic check for new content (every 2 minutes)
        const checkNewContentInterval = setInterval(() => {
            checkForNewContent();
        }, 120000);
        
        return () => clearInterval(checkNewContentInterval);
    }, []);

    // Fetch posts when tab changes
    useEffect(() => {
        fetchPosts();
    }, [activeTab, sortOption]);

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

    // Fetch user statuses
    const fetchStatuses = async () => {
        try {
            const result = await axios.get(`${baseUrl}/api/post/status`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            setStatuses(result.data.statuses || []);
        } catch (err) {
            console.error("Failed to fetch statuses:", err);
        }
    };

    // Check for new content without refreshing the entire feed
    const checkForNewContent = async () => {
        try {
            const endpoint = activeTab === "For you" 
                ? `${baseUrl}/api/post/count/new` 
                : `${baseUrl}/api/post/count/following/new`;
                
            const result = await axios.get(endpoint, {
                params: { lastPostId: posts[0]?._id },
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            
            if (result.data.count > 0) {
                setHasNewContent(true);
            }
        } catch (err) {
            console.error("Failed to check for new content:", err);
        }
    };

    // Fetch posts
    const fetchPosts = async (showRefreshIndicator = true) => {
        if (showRefreshIndicator) {
            setIsLoading(true);
        }
        setIsSearchActive(false);
        
        try {
            const endpoint = activeTab === "For you" 
                ? `${baseUrl}/api/post/all` 
                : `${baseUrl}/api/post/following`;
            
            // Add sort parameters    
            const params = { sort: sortOption };
            
            // Add filter parameters if any
            if (activeFilters.length > 0) {
                params.filters = activeFilters.join(',');
            }
                
            const result = await axios.get(endpoint, {
                params,
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            
            setPosts(result.data.posts || []);
            setHasNewContent(false);
        } catch (err) {
            console.error(`Failed to fetch ${activeTab.toLowerCase()} posts:`, err);
            toast.error("Failed to load posts. Please try again.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Pull-to-refresh simulation
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchPosts(false);
    };

    // Handle search results
    const handleSearchResults = (results) => {
        setIsSearchActive(true);
        setPosts(results);
    };

    // Scroll to top
    const scrollToTop = () => {
        feedRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Toggle filter
    const toggleFilter = (filter) => {
        setActiveFilters(prev => 
            prev.includes(filter) 
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    // Apply filters and refresh
    const applyFilters = () => {
        setIsFilterMenuOpen(false);
        fetchPosts();
    };

    // Clear all filters
    const clearFilters = () => {
        setActiveFilters([]);
        setIsFilterMenuOpen(false);
        fetchPosts();
    };

    // Render empty state messaging
    const renderEmptyState = () => {
        if (isSearchActive) {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-4 text-center"
                >
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <FiBookmark className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        No results found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                        We couldn't find any posts matching your search. Try different keywords or filters.
                    </p>
                    <button 
                        onClick={fetchPosts}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        Clear search
                    </button>
                </motion.div>
            );
        }
        
        if (activeTab === "Following") {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-4 text-center"
                >
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <FiUsers className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        Your feed is empty
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                        You're not following any creators yet. Discover and follow creators to see their posts here.
                    </p>
                    <button 
                        onClick={() => setActiveTab("For you")}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        Discover creators
                    </button>
                </motion.div>
            );
        }
        
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 px-4 text-center"
            >
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <FiHome className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    No posts available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                    There are no posts to show right now. Check back later or be the first to create a post!
                </p>
                <button 
                    onClick={handleRefresh}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </motion.div>
        );
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

    // Sort options menu
    const renderSortOptions = () => (
        <AnimatePresence>
            {showSortMenu && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-30 border border-gray-200 dark:border-gray-700 w-48"
                >
                    <div className="py-1.5">
                        <button
                            className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'recent' ? 'text-orange-500 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                            onClick={() => {
                                setSortOption('recent');
                                setShowSortMenu(false);
                            }}
                        >
                            <FiClock className="w-4 h-4" />
                            <span>Most Recent</span>
                        </button>
                        <button
                            className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'popular' ? 'text-orange-500 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                            onClick={() => {
                                setSortOption('popular');
                                setShowSortMenu(false);
                            }}
                        >
                            <FiTrendingUp className="w-4 h-4" />
                            <span>Most Popular</span>
                        </button>
                        <button
                            className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${sortOption === 'trending' ? 'text-orange-500 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                            onClick={() => {
                                setSortOption('trending');
                                setShowSortMenu(false);
                            }}
                        >
                            <FiStar className="w-4 h-4" />
                            <span>Trending</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Filter menu
    const renderFilterMenu = () => (
        <AnimatePresence>
            {isFilterMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-full left-4 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-30 border border-gray-200 dark:border-gray-700 w-64 p-4"
                >
                    <h3 className="font-medium text-gray-800 dark:text-white mb-3">Filter posts</h3>
                    
                    <div className="space-y-2 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={activeFilters.includes('images')}
                                onChange={() => toggleFilter('images')}
                                className="rounded text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300">With images</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={activeFilters.includes('videos')}
                                onChange={() => toggleFilter('videos')}
                                className="rounded text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300">With videos</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={activeFilters.includes('audio')}
                                onChange={() => toggleFilter('audio')}
                                className="rounded text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300">With audio</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={activeFilters.includes('premium')}
                                onChange={() => toggleFilter('premium')}
                                className="rounded text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Premium content</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={activeFilters.includes('donations')}
                                onChange={() => toggleFilter('donations')}
                                className="rounded text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300">With donation goals</span>
                        </label>
                    </div>
                    
                    <div className="flex justify-between">
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Clear all
                        </button>
                        
                        <button
                            onClick={applyFilters}
                            className="px-4 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                            Apply filters
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Determine if it's mobile or tablet
    const isMobileOrTablet = windowWidth < 1024;

    return (
        <div className="flex flex-1 h-[100vh] bg-gray-50 dark:bg-gray-900">
            {/* Modals */}
            <TipsSuccessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={receivedData}
            />
            
            <ShareLinkDMs 
                enabled={messageOpen}
                message={message}
                onClose={() => setMessageOpen(false)}
            />
            
            {/* Main content layout */}
            <div className={`flex flex-1 ${isMobileOrTablet ? "flex-col" : "flex-row"}`}>
                {/* Main feed */}
                <div className="relative flex-grow h-full max-h-screen overflow-hidden">
                    {/* Main feed scrollable area */}
                    <div 
                        ref={feedRef}
                        className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
                    >
                        {/* Tab navigation */}
                        <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                                <div className="flex-1 flex">
                                    {["For you", "Following"].map((item) => (
                                        <button 
                                            key={item} 
                                            className={`flex-1 flex justify-center items-center py-4 px-4 relative font-medium text-base transition-colors ${
                                                activeTab === item 
                                                    ? "text-orange-500" 
                                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                                            }`}
                                            onClick={() => setActiveTab(item)}
                                        >
                                            {item}
                                            {activeTab === item && (
                                                <motion.div 
                                                    layoutId="active-tab-indicator"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Sort & filter options */}
                                <div className="flex items-center pr-2">
                                    <div className="relative">
                                        <button 
                                            className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                            aria-label="Filter posts"
                                        >
                                            <FiFilter className="w-5 h-5" />
                                            {activeFilters.length > 0 && (
                                                <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                                    {activeFilters.length}
                                                </span>
                                            )}
                                        </button>
                                        {renderFilterMenu()}
                                    </div>
                                    
                                    <div className="relative">
                                        <button 
                                            className="flex items-center gap-1 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full ml-1"
                                            onClick={() => setShowSortMenu(!showSortMenu)}
                                            aria-label="Sort options"
                                        >
                                            <span className="hidden sm:inline text-sm font-medium">Sort by:</span>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {sortOption === 'recent' && 'Recent'}
                                                {sortOption === 'popular' && 'Popular'}
                                                {sortOption === 'trending' && 'Trending'}
                                            </span>
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {renderSortOptions()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* New content notification */}
                        <AnimatePresence>
                            {hasNewContent && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="sticky top-16 z-10 mx-auto mt-2 mb-0 w-max"
                                >
                                    <button
                                        onClick={fetchPosts}
                                        className="flex items-center gap-2 py-2 px-4 bg-white dark:bg-gray-800 text-orange-500 font-medium rounded-full shadow-md border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <FiRefreshCw className="w-4 h-4" />
                                        <span>New posts available</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
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
                        
                        {/* Post creation area */}
                        <div className="w-full px-4 pt-4 pb-2 bg-white dark:bg-gray-900">
                            <MessageBox refetchAllPosts={fetchPosts} />
                        </div>
                        
                        {/* Stories section */}
                        {statuses.length > 0 && (
                            <div className="mt-2 mb-4">
                                <StoriesSection storiesData={statuses} />
                            </div>
                        )}
                        
                        {/* Posts feed */}
                        {isLoading ? (
                            renderSkeletons()
                        ) : posts && posts.length > 0 ? (
                            <div className="pb-16 space-y-4 px-4 mt-4">
                                {posts.map((post, index) => (
                                    <motion.div
                                        key={post._id || index.toString()}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
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
                                            refetch={fetchPosts}
                                            setMessage={setMessage}
                                            setMessageOpen={setMessageOpen}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            renderEmptyState()
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
                
              {/* Right sidebar - hidden on mobile */}
              <div className={`${isMobileOrTablet ? 'hidden' : 'block'} w-1/4 min-w-[300px] max-w-sm h-full border-l border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900`}>
                    <div className="h-full overflow-y-auto">
                        <TopCreators 
                            setter={handleSearchResults} 
                            defaultery={fetchPosts} 
                        />
                    </div>
                </div>
                
                {/* Mobile bottom navigation (displayed only on mobile) */}
                {isMobileOrTablet && (
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-30 px-2 py-1.5"
                    >
                        <div className="flex justify-around items-center">
                            <button 
                                className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                                    activeTab === "For you" 
                                        ? "text-orange-500" 
                                        : "text-gray-500 dark:text-gray-400"
                                }`}
                                onClick={() => setActiveTab("For you")}
                            >
                                <FiHome className="w-5 h-5" />
                                <span className="text-xs mt-1">Home</span>
                            </button>
                            
                            <button 
                                className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                                    activeTab === "Following" 
                                        ? "text-orange-500" 
                                        : "text-gray-500 dark:text-gray-400"
                                }`}
                                onClick={() => setActiveTab("Following")}
                            >
                                <FiUsers className="w-5 h-5" />
                                <span className="text-xs mt-1">Following</span>
                            </button>
                            
                            <button 
                                className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400"
                                onClick={() => navigate("/creator")}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-xs mt-1">Create</span>
                            </button>
                            
                            <button 
                                className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400"
                                onClick={() => navigate("/notifications")}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="text-xs mt-1">Alerts</span>
                            </button>
                            
                            <button 
                                className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400"
                                onClick={() => navigate("/profile")}
                            >
                                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                    {user?.personal_info?.profile_img ? (
                                        <img 
                                            src={user.personal_info.profile_img} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                                            {user?.personal_info?.fullname?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs mt-1">Profile</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// Add these custom styles to your CSS
// .scrollbar-thin::-webkit-scrollbar {
//   width: 5px;
// }
// 
// .scrollbar-thin::-webkit-scrollbar-track {
//   background: transparent;
// }
// 
// .scrollbar-thin::-webkit-scrollbar-thumb {
//   background: #d1d5db;
//   border-radius: 9999px;
// }
// 
// .dark .scrollbar-thin::-webkit-scrollbar-thumb {
//   background: #4b5563;
// }

export default withProtectedRoute(Feed, 'home');
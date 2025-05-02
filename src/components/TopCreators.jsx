import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { checkAuthentication } from "../store/authSlice";

// Icons
import { FiSearch, FiChevronLeft, FiChevronRight, FiUser, FiUserCheck, FiUserPlus } from "react-icons/fi";

const TopCreators = ({ setter = () => {}, defaultery = () => {} }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // States
  const [creators, setCreators] = useState([]);
  const [following, setFollowing] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState("");
  
  // Refs
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchCreators(1);
  }, []);
  
  // Fetch when page changes
  useEffect(() => {
    if (!isSearching) {
      fetchCreators(page);
    } else if (query.trim().length >= 2) {
      handleSearch(query, true);
    }
  }, [page]);
  
  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  // Fetch creators with optional filter
  const fetchCreators = async (pageNum = 1, filter = "") => {
    setIsLoading(true);
    
    try {
      const response = await axios.get(
        `${baseUrl}/api/post/creators/top?page=${pageNum}&filter=${filter}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      setCreators(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      
      // Map following status
      const userFollowData = {};
      (response.data.data || []).forEach((creator) => {
        const followers = creator.creatorDetails?.personal_info?.followers || [];
        userFollowData[creator._id] = Array.isArray(followers) 
          ? followers.includes(user?._id) 
          : false;
      });
      
      setFollowing(userFollowData);
    } catch (error) {
      console.error("Failed to fetch creators:", error);
      toast.error("Could not load creators");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Search with debounce
  const handleSearchInput = (value) => {
    setQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If empty query, reset to default
    if (!value.trim()) {
      setIsSearching(false);
      fetchCreators(1);
      defaultery();
      return;
    }
    
    // Set timeout for debounce
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        setIsSearching(true);
        setPage(1);
        handleSearch(value, false, true);
      }
    }, 500);
  };
  
  // Perform search
  const handleSearch = async (searchQuery, creatorAlone = false, isFirstSearch = false) => {
    if (searchQuery.length < 2) return;
    
    setIsLoading(true);
    const pageToUse = isFirstSearch ? 1 : page;
    
    // Search for creators
    try {
      const creatorsResponse = await axios.get(
        `${baseUrl}/api/post/creators/top?page=${pageToUse}&filter=${searchQuery}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      setCreators(creatorsResponse.data.data || []);
      setTotalPages(creatorsResponse.data.totalPages || 1);
      
      // Map following status
      const userFollowData = {};
      (creatorsResponse.data.data || []).forEach((creator) => {
        const followers = creator.creatorDetails?.personal_info?.followers || [];
        userFollowData[creator._id] = Array.isArray(followers) 
          ? followers.includes(user?._id) 
          : false;
      });
      
      setFollowing(userFollowData);
    } catch (error) {
      console.error("Failed to search creators:", error);
    }
    
    // Search for posts if not creator-only search
    if (!creatorAlone) {
      try {
        const postsResponse = await axios.get(
          `${baseUrl}/api/post/search?query=${searchQuery}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        
        setter(postsResponse.data);
      } catch (error) {
        console.error("Failed to search posts:", error);
        defaultery();
      }
    }
    
    setIsLoading(false);
  };
  
  // Handle pagination
  const handlePagination = (direction) => {
    if (direction === "next" && page < totalPages) {
      setTransitionDirection("left");
      setPage((prevPage) => prevPage + 1);
    } else if (direction === "prev" && page > 1) {
      setTransitionDirection("right");
      setPage((prevPage) => prevPage - 1);
    }
  };
  
  // Follow/unfollow creator
  const followOrUnfollow = async (creatorId, event) => {
    if (!creatorId) return;
    event.stopPropagation();
    
    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/follow-unfollow/${creatorId}`,
        {},
        { 
          headers: { "Content-Type": "application/json" }, 
          withCredentials: true 
        }
      );
      
      // Update local state first for immediate feedback
      setFollowing(prev => ({
        ...prev,
        [creatorId]: !prev[creatorId]
      }));
      
      toast.success(response.data.message);
      
      // Update global auth state
      dispatch(checkAuthentication());
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating follow status");
    }
  };
  
  // Navigate to creator profile
  const navigateToProfile = (creatorId) => {
    navigate(`/user/${creatorId}`);
  };
  
  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };
  
  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* Search and Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            placeholder="Search creators or content..."
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
          {query && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              onClick={() => {
                setQuery("");
                setIsSearching(false);
                fetchCreators(1);
                defaultery();
                searchInputRef.current?.focus();
              }}
            >
              <span className="text-lg">&times;</span>
            </button>
          )}
        </div>
        
        {/* Header with Pagination */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Creators
          </h2>
          
          <div className="flex items-center space-x-1">
            <button
              className={`p-1.5 rounded-full ${
                page > 1 
                  ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" 
                  : "text-gray-300 dark:text-gray-700 cursor-not-allowed"
              }`}
              onClick={() => handlePagination("prev")}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            
            <span className="text-sm text-gray-500 dark:text-gray-400 mx-1">
              {page} / {totalPages}
            </span>
            
            <button
              className={`p-1.5 rounded-full ${
                page < totalPages 
                  ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" 
                  : "text-gray-300 dark:text-gray-700 cursor-not-allowed"
              }`}
              onClick={() => handlePagination("next")}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Creators List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse py-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : creators.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
              <FiUser className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {isSearching ? "No creators found" : "No creators available"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isSearching 
                ? `No creators matched "${query}"`
                : "Check back later for top creators"}
            </p>
            {isSearching && (
              <button
                className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setQuery("");
                  setIsSearching(false);
                  fetchCreators(1);
                  defaultery();
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          // Creator Cards
          <div 
            className={`space-y-4 transition-all duration-300 ${
              transitionDirection === "left" 
                ? "animate-slide-left" 
                : transitionDirection === "right" 
                  ? "animate-slide-right" 
                  : ""
            }`}
            onAnimationEnd={() => setTransitionDirection("")}
          >
            {creators.map((creator) => (
              <div
                key={creator._id}
                onClick={() => navigateToProfile(creator._id)}
                className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                {/* Cover Image/Background */}
                <div className="h-24 w-full bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-700 dark:to-orange-900">
                  <div
                    className="absolute inset-0 h-24 bg-cover bg-center opacity-40"
                    style={{
                      backgroundImage: `url(${creator?.creatorDetails?.personal_info?.profile_img || ""})`,
                    }}
                  ></div>
                </div>
                
                {/* Creator Info */}
                <div className="px-4 pb-4 pt-10 relative">
                  {/* Profile Image */}
                  <div className="absolute -top-10 left-4 w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 shadow-md overflow-hidden bg-white dark:bg-gray-700">
                    {creator?.creatorDetails?.personal_info?.profile_img ? (
                      <img
                        src={creator.creatorDetails.personal_info.profile_img}
                        alt={creator?.creatorDetails?.personal_info?.fullname || "Creator"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`absolute inset-0 ${creator?.creatorDetails?.personal_info?.profile_img ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xl font-bold`}
                    >
                      {getInitials(creator?.creatorDetails?.personal_info?.fullname)}
                    </div>
                  </div>
                  
                  {/* Creator Info - Fixed spacing issue */}
                  <div className="ml-24 pr-24">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {creator?.creatorDetails?.personal_info?.fullname || "Creator"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      @{creator?.creatorDetails?.personal_info?.username || "username"}
                    </p>
                    
                    {/* Creator Stats if available */}
                    {creator?.stats && (
                      <div className="flex space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{creator.stats.followers || 0} followers</span>
                        <span>•</span>
                        <span>{creator.stats.posts || 0} posts</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Follow Button - Fixed positioning */}
                  {creator._id !== user._id && (
                    <button
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                        following[creator._id]
                          ? "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                          : "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500"
                      }`}
                      onClick={(e) => followOrUnfollow(creator._id, e)}
                    >
                      {following[creator._id] ? (
                        <>
                          <FiUserCheck className="mr-1.5 h-4 w-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <FiUserPlus className="mr-1.5 h-4 w-4" />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination Dots */}
      {totalPages > 1 && !isLoading && creators.length > 0 && (
        <div className="flex justify-center py-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index + 1 === page
                    ? "bg-orange-500 scale-125"
                    : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400"
                }`}
                onClick={() => {
                  if (index + 1 > page) {
                    setTransitionDirection("left");
                  } else if (index + 1 < page) {
                    setTransitionDirection("right");
                  }
                  setPage(index + 1);
                }}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopCreators;
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiChevronLeft, FiChevronRight, FiCamera } from "react-icons/fi";
import StatusOverlay from "./StatusOverlay";

const StoriesSection = ({ storiesData = [] }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // States
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovering, setIsHovering] = useState(null);
  
  // Refs
  const storiesContainerRef = useRef(null);
  
  // Check if scrolling is possible
  useEffect(() => {
    const checkScroll = () => {
      if (!storiesContainerRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = storiesContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    };
    
    checkScroll();
    
    const container = storiesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      }
    };
  }, [storiesData]);
  
  // Story interactions
  const openOverlay = (statusIndex) => {
    setSelectedStatus(storiesData[statusIndex].statuses);
    setSelectedIndex(statusIndex);
    setShowOverlay(true);
    
    // Create a viewed history (could be stored in localStorage or state)
    // This would allow you to mark stories as viewed
  };
  
  const closeOverlay = () => {
    setShowOverlay(false);
  };
  
  // Navigate between stories with keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showOverlay) return;
      
      if (e.key === 'ArrowLeft') {
        if (selectedIndex > 0) {
          setSelectedStatus(storiesData[selectedIndex - 1].statuses);
          setSelectedIndex(prev => prev - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (selectedIndex < storiesData.length - 1) {
          setSelectedStatus(storiesData[selectedIndex + 1].statuses);
          setSelectedIndex(prev => prev + 1);
        }
      } else if (e.key === 'Escape') {
        closeOverlay();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showOverlay, selectedIndex, storiesData]);
  
  // Scroll the stories container
  const scrollStories = (direction) => {
    if (!storiesContainerRef.current) return;
    
    const container = storiesContainerRef.current;
    const scrollAmount = 300;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Get user's initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };
  
  // No stories to display
  if (!storiesData.length) {
    return null;
  }
  
  return (
    <section 
      className="w-full py-4 relative bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
      aria-label="Stories section"
    >
      <div className="flex justify-between items-center px-4 mb-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 w-1 h-5 rounded-sm mr-2 inline-block"></span>
          Stories
        </h2>
        {storiesData.length > 4 && (
          <button 
            className="text-sm font-medium text-[#E35F01] hover:text-[#b34a01] transition-colors flex items-center"
            onClick={() => {/* Handle see all */}}
          >
            See all
            <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className="relative px-4">
        {/* Left scroll button */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onClick={() => scrollStories('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Right scroll button */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onClick={() => scrollStories('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Scroll right"
            >
              <FiChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Stories container */}
        <div 
          ref={storiesContainerRef}
          className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2 px-1 -mx-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Create story card */}
          <motion.div 
            className="flex-shrink-0 w-20 h-32 md:w-24 md:h-36 rounded-xl relative group cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            onClick={() => navigate("/status/new")}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Create a new story"
            onMouseEnter={() => setIsHovering('create')}
            onMouseLeave={() => setIsHovering(null)}
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-600 dark:to-orange-800 animate-gradient-slow">
              {user.personal_info?.profile_img && (
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${user.personal_info?.profile_img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.2,
                    filter: 'blur(4px)',
                  }}
                />
              )}
            </div>
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-between p-3 z-10">
              <motion.div
                className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/90 dark:bg-gray-800/90 border-2 border-white dark:border-gray-700 flex items-center justify-center mt-1 shadow-lg"
                animate={isHovering === 'create' ? { y: [0, -3, 0], scale: 1.05 } : {}}
                transition={{ duration: 0.5, repeat: isHovering === 'create' ? Infinity : 0, repeatType: 'reverse' }}
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  <FiCamera className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </motion.div>
              
              <div className="w-full text-center">
                <span className="text-white text-xs md:text-sm font-medium text-center px-1 py-0.5 bg-black/20 rounded-full">
                  Add Story
                </span>
              </div>
            </div>
            
            {/* Pulse effect to draw attention */}
            <div className="absolute inset-0 rounded-xl border-2 border-white/30 dark:border-gray-700/30 animate-pulse-slow pointer-events-none" />
          </motion.div>
          
          {/* User stories */}
          {storiesData.map((story, index) => {
            const storyHasBeenViewed = false; // This would be determined from your view tracking
            
            return (
              <motion.div
                key={story._id._id || index}
                className="flex-shrink-0 w-20 h-32 md:w-24 md:h-36 rounded-xl relative cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                onClick={() => openOverlay(index)}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`View ${story._id.personal_info.fullname || 'user'}'s story`}
                onMouseEnter={() => setIsHovering(index)}
                onMouseLeave={() => setIsHovering(null)}
              >
                {/* Story border - changes color if viewed */}
                <div className={`absolute inset-0 rounded-xl border-2 ${storyHasBeenViewed ? 'border-gray-300 dark:border-gray-700' : 'border-orange-500 animate-pulse-slow'} pointer-events-none z-20`} />
                
                {/* Story background */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* Story content preview */}
                  {story.statuses[0]?.image ? (
                    <img 
                      src={story.statuses[0].image} 
                      alt=""
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div 
                      className="w-full h-full animate-gradient-slow" 
                      style={{
                        background: `linear-gradient(45deg, #E35F01, #FFB267)`,
                      }}
                    />
                  )}
                  
                  {/* Gradient overlay for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                </div>
                
                {/* Profile picture */}
                <motion.div 
                  className="absolute inset-x-0 top-3 flex flex-col items-center z-10"
                  animate={isHovering === index ? { y: [0, -2, 0], scale: 1.05 } : {}}
                  transition={{ duration: 0.5, repeat: isHovering === index ? Infinity : 0, repeatType: 'reverse' }}
                >
                  <div className={`w-11 h-11 rounded-full border-2 ${storyHasBeenViewed ? 'border-gray-300 dark:border-gray-600' : 'border-orange-500'} p-0.5 bg-white dark:bg-gray-800 shadow-md`}>
                    {story._id.personal_info.profile_img ? (
                      <img 
                        src={story._id.personal_info.profile_img} 
                        alt={story._id.personal_info.username || 'User'}
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                              <rect width="40" height="40" fill="#E35F01"/>
                              <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">${getInitials(story._id.personal_info.fullname || 'User')}</text>
                            </svg>
                          `);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm font-bold">
                        {getInitials(story._id.personal_info.fullname || 'User')}
                      </div>
                    )}
                  </div>
                </motion.div>
                
                {/* Story owner name */}
                <div className="absolute inset-x-0 bottom-3 z-10 px-2">
                  <p className="text-white text-xs text-center font-medium truncate px-1 py-0.5 bg-black/20 rounded-full mx-auto w-fit max-w-full">
                    {story._id.personal_info.fullname || story._id.personal_info.username || 'User'}
                  </p>
                </div>
                
                {/* Story count indicator (if more than one) */}
                {story.statuses.length > 1 && (
                  <div className="absolute top-1.5 right-1.5 bg-white dark:bg-gray-800 text-[10px] text-gray-700 dark:text-gray-300 rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 shadow-sm">
                    {story.statuses.length}
                  </div>
                )}
              </motion.div>
            );
          })}
          
          {/* Add extra empty space at the end for better UX */}
          <div className="flex-shrink-0 w-4" aria-hidden="true"></div>
        </div>
      </div>
      
      {/* Story viewer overlay with keyboard navigation */}
      <AnimatePresence>
        {showOverlay && (
          <StatusOverlay 
            selectedStatus={selectedStatus}
            onClose={closeOverlay}
            onNext={() => {
              if (selectedIndex < storiesData.length - 1) {
                setSelectedStatus(storiesData[selectedIndex + 1].statuses);
                setSelectedIndex(prev => prev + 1);
              } else {
                closeOverlay();
              }
            }}
            onPrevious={() => {
              if (selectedIndex > 0) {
                setSelectedStatus(storiesData[selectedIndex - 1].statuses);
                setSelectedIndex(prev => prev - 1);
              }
            }}
            currentIndex={selectedIndex}
            totalStories={storiesData.length}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

// Define these animations in your CSS or Tailwind config
// @keyframes gradient-slow {
//   0% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
//   100% { background-position: 0% 50%; }
// }
// @keyframes pulse-slow {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.5; }
// }
// .animate-gradient-slow {
//   background-size: 200% 200%;
//   animation: gradient-slow 3s ease infinite;
// }
// .animate-pulse-slow {
//   animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
// }
// .hide-scrollbar::-webkit-scrollbar {
//   display: none;
// }

export default StoriesSection;
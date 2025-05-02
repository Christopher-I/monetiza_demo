import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from "../context/SocketContext";

// Components
import { SharePopoverMod } from "./SharePopover";
import BlockOrInterested from "./BlockOrInterested";
import SendTipsModal from "./SendTipsModal";
import UnlockContentModal from "./unlockContent";
import DeleteMyPost from "./DeleteMyPost";
import DonationModal from "./DonationModal";
import useTwemoji from "../hooks/useTwimoji";

// Icons
import { FiHeart, FiMessageCircle, FiBookmark, FiShare2, FiMoreHorizontal, FiLock, FiDollarSign } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { loading as loader } from "../store/authSlice";

// Assets
import person from "../imgs/person.png";
import bookmarkedImg from "../imgs/bookmarked.png";
import verifiedSVG from "../imgs/Vector.svg";
import dollarSVG from "../imgs/dollar.svg";
import lockIcon from "../imgs/padlock.png";
import no_comment from "../imgs/no-comment.png";

const PostCard = ({
  postId,
  authorId,
  profilePic,
  name = "",
  verified = false,
  createdAt = new Date(),
  username,
  text = "",
  image,
  video,
  audio,
  comments = 2,
  likes = 3,
  bookmarked = false,
  isLiked = true,
  single = false,
  isPrivate = false,
  isPaidPost = false,
  price = 0,
  purchasedBy = [],
  donationTarget = 0,
  currentDonation = 0,
  refetch = async () => { },
  setMessage = async () => { },
  setMessageOpen = async () => { },
}) => {
  const dispatch = useDispatch();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const clientBaseUrl = import.meta.env.VITE_CLIENT_BASE_URL;
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null);
  
  // Post state
  const [likedState, setLikedState] = useState(isLiked);
  const [bookmarkedState, setBookmarkedState] = useState(bookmarked);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [likesCount, setLikesCount] = useState(likes);
  const [privateStatus, setPrivateStatus] = useState(isPrivate);
  const [isUnlocked, setIsUnlocked] = useState(purchasedBy?.includes(user?._id));
  const [timeAgo, setTimeAgo] = useState({ value: 0, unit: 's', isDraft: false });
  const [menuOpen, setMenuOpen] = useState(null);
  
  // Donation state
  const [donationInfo, setDonationInfo] = useState({ 
    currentDonation: currentDonation || 0, 
    donationTarget: donationTarget || 0 
  });
  
  // Refs
  const emojiRef = useRef(null);
  const menuRef = useRef(null);
  
  // Initialize twemoji
  useTwemoji(emojiRef);
  
  // Update private status when props change
  useEffect(() => {
    setPrivateStatus(isPrivate);
  }, [isPrivate]);
  
  // Update unlocked status when props change
  useEffect(() => {
    setIsUnlocked(purchasedBy?.includes(user?._id));
  }, [purchasedBy, user?._id]);
  
  // Fetch donation info
  useEffect(() => {
    if (donationTarget > 0) {
      fetchDonationInfo();
    }
  }, [baseUrl, postId, donationTarget]);
  
  // Handle clicking outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Calculate time ago
  useEffect(() => {
    const second = 1;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;

    const formatTimeAgo = () => {
      const calcSecs = Math.floor(
        (new Date().valueOf() - createdAt.valueOf()) / 1000
      );
      
      if (calcSecs < 5) {
        setTimeAgo({ value: 0, unit: 's', isDraft: true });
      } else if (calcSecs < minute) {
        setTimeAgo({ value: Math.floor(calcSecs), unit: 's', isDraft: false });
      } else if (calcSecs < hour) {
        setTimeAgo({ value: Math.floor(calcSecs / minute), unit: 'min', isDraft: false });
      } else if (calcSecs < day) {
        setTimeAgo({ value: Math.floor(calcSecs / hour), unit: 'hr', isDraft: false });
      } else if (calcSecs < month) {
        setTimeAgo({ value: Math.floor(calcSecs / day), unit: 'd', isDraft: false });
      } else {
        setTimeAgo({ value: Math.floor(calcSecs / month), unit: 'mo', isDraft: false });
      }
    };

    formatTimeAgo();
    const intervalId = setInterval(formatTimeAgo, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [createdAt]);
  
  // Fetch donation info
  const fetchDonationInfo = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/post/${postId}/donations`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        setDonationInfo({
          currentDonation: response.data.currentDonation,
          donationTarget: response.data.donationTarget,
        });
      }
    } catch (error) {
      console.error("Donation fetch error:", error);
    }
  };
  
  // Handle donation success
  const handleDonationSuccess = async () => {
    await fetchDonationInfo();
    toast.success("Thank you for your donation!");
  };
  
  // Like post
  const handleLiked = async (e) => {
    e.stopPropagation();
    
    try {
      if (likedState) {
        await axios.get(`${baseUrl}/api/post/${postId}/dislike`, {
          withCredentials: true,
        });
        setLikesCount((prev) => prev - 1);
      } else {
        const result = await axios.get(`${baseUrl}/api/post/${postId}/like`, {
          withCredentials: true,
        });
        setLikesCount((prev) => prev + 1);
        toast.success("Post liked!");
      }
      
      setLikedState((prev) => !prev);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
  
  // Bookmark post
  const handleBookmarked = async (e) => {
    e.stopPropagation();
    
    try {
      const result = await axios.get(`${baseUrl}/api/post/${postId}/bookmark`, {
        withCredentials: true,
      });
      
      setBookmarkedState((prev) => !prev);
      toast.success(bookmarkedState ? "Post removed from bookmarks" : "Post bookmarked");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
  
  // Delete post
  const handleDeletePost = async () => {
    try {
      dispatch(loader());
      
      await axios.delete(`${baseUrl}/api/post/delete/${postId}`, {
        withCredentials: true,
      });
      
      toast.success("Post deleted");
      refetch();
      setMenuOpen(null);
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };
  
  // Block user or hide post
  const notInterested = async () => {
    try {
      dispatch(loader());
      
      await axios.post(
        `${baseUrl}/api/post/block/${postId}`,
        {},
        { withCredentials: true }
      );
      
      toast.success("Post hidden");
      refetch();
      setMenuOpen(null);
    } catch (error) {
      toast.error("Failed to hide post");
    }
  };
  
  const blockUser = async () => {
    try {
      dispatch(loader());
      
      await axios.post(
        `${baseUrl}/api/auth/block/${authorId}`,
        {},
        { withCredentials: true }
      );
      
      toast.success("User blocked");
      refetch();
      setMenuOpen(null);
    } catch (error) {
      toast.error("Failed to block user");
    }
  };
  
  // Fetch post data and unlock content
  const fetchPostData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/post/${postId}`, {
        withCredentials: true,
      });
      setIsUnlocked(true);
      refetch();
    } catch (error) {
      console.error("Error fetching post data:", error);
    }
  };
  
  const handleUnlockPost = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/post/unlockContent`,
        { postId },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success("Post unlocked successfully!");
        fetchPostData();
      }
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    }
  };
  
  // Share post as message
  const handleShareAsMessage = (message) => {
    setMessage(message);
    setMessageOpen(true);
    setMenuOpen(null);
  };
  
  // Capitalize first letters of words
  const capitalizeFirstLetters = (text) => {
    return text?.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  // Go to post detail
  const goToPost = (e) => {
    if (privateStatus) return;
    navigate(`/post/${postId}`);
  };
  
  // Render post content
  const renderPostContent = () => {
    if (isPaidPost && !isUnlocked) {
      return (
        <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* Blurred background preview */}
          {image ? (
            <img
              src={profilePic || person}
              alt="Locked Content"
              className="w-full h-64 object-cover blur-lg opacity-50"
              loading="lazy"
            />
          ) : video ? (
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center blur-lg opacity-50">
              <span className="text-4xl">🎬</span>
            </div>
          ) : audio ? (
            <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 flex items-center justify-center blur-lg opacity-50">
              <span className="text-4xl">🎵</span>
            </div>
          ) : null}
          
          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                  <FiLock className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Exclusive Content</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Unlock this premium content from {capitalizeFirstLetters(name)}</p>
              <button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-2 px-4 rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModal('unlock');
                }}
              >
                Unlock for ${price}
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full rounded-xl overflow-hidden">
        {image ? (
          <img
            src={image}
            alt=""
            className="w-full rounded-xl object-cover max-h-[500px]"
            loading="lazy"
          />
        ) : video ? (
          <video controls className="w-full rounded-xl">
            <source src={video} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        ) : audio ? (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <audio controls className="w-full">
              <source src={audio} type="audio/mp3" />
              Your browser does not support audio playback.
            </audio>
          </div>
        ) : null}
      </div>
    );
  };
  
  // If author info is missing, don't render the post
  if (!authorId) return null;
  
  return (
    <article 
      ref={emojiRef}
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-all"
    >
      <div className="px-4 pt-4 pb-2 md:px-6">
        {/* Post header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Author avatar */}
          <Link 
            to={`/user/${authorId}`} 
            className="flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={profilePic || person}
              alt={name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              loading="lazy"
              onError={(e) => {
                e.target.src = person;
              }}
            />
          </Link>
          
          {/* Author info and post time */}
          <div className="flex-grow flex flex-col">
            <div className="flex items-center gap-1">
              <Link 
                to={`/user/${authorId}`}
                className="font-semibold text-gray-900 dark:text-white hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {capitalizeFirstLetters(name) || "Monetiza+ User"}
              </Link>
              
              {verified && (
                <MdVerified className="text-[#E35F01] w-4 h-4" />
              )}
              
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                @{username || "user"}
              </span>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo.isDraft ? (
                <span className="text-blue-500 font-medium">Draft</span>
              ) : (
                <>{timeAgo.value} {timeAgo.unit} ago</>
              )}
            </div>
          </div>
          
          {/* Post menu */}
          <div className="relative" ref={menuRef}>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(menuOpen === 'options' ? null : 'options');
              }}
              aria-label="Post options"
            >
              <FiMoreHorizontal className="w-5 h-5" />
            </button>
            
            {menuOpen === 'options' && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-30">
                {user._id === authorId ? (
                  <button
                    className="w-full text-left p-3 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost();
                    }}
                  >
                    Delete post
                  </button>
                ) : (
                  <>
                    <button
                      className="w-full text-left p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        notInterested();
                      }}
                    >
                      Not interested in this post
                    </button>
                    <button
                      className="w-full text-left p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-b-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        blockUser();
                      }}
                    >
                      Block @{username}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Post content */}
        <div
          className={`${privateStatus ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={goToPost}
        >
          {/* Post text */}
          {text && (
            <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-line">
              {text}
            </p>
          )}
          
          {/* Post media */}
          {(image || video || audio) && renderPostContent()}
          
          {/* Donation progress bar */}
          {donationInfo.donationTarget > 0 && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  ${donationInfo.currentDonation} raised
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Goal: ${donationInfo.donationTarget}
                </span>
              </div>
              
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-green-500 dark:bg-green-400"
                  style={{
                    width: `${Math.min((donationInfo.currentDonation / donationInfo.donationTarget) * 100, 100)}%`,
                  }}
                />
              </div>
              
              <button
                className="mt-3 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium py-2 px-4 rounded-full hover:from-green-600 hover:to-teal-600 transition-colors shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModal('donation');
                }}
              >
                Support this cause
              </button>
            </div>
          )}
        </div>
        
        {/* Post actions */}
        <div className="mt-3 pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
          {/* Send tips button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveModal('tips');
            }}
            className="flex items-center gap-1.5 font-medium text-sm px-4 py-1.5 rounded-full border-2 border-[#E35F01] text-[#E35F01] hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
          >
            <FiDollarSign className="w-4 h-4" />
            <span>Send tip</span>
          </button>
          
          {/* Post stats/interactions */}
          <div className="flex items-center">
            {/* Comments */}
            <button
              onClick={goToPost}
              disabled={privateStatus}
              className={`flex items-center gap-1 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ${
                privateStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              aria-label="Comments"
            >
              <FiMessageCircle className="w-5 h-5" />
              <span className="text-xs">{commentsCount}</span>
            </button>
            
            {/* Likes */}
            <button
              onClick={handleLiked}
              className={`flex items-center gap-1 p-2 ${
                likedState
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              aria-label={likedState ? "Unlike" : "Like"}
            >
              <FiHeart className={`w-5 h-5 ${likedState ? "fill-current" : ""}`} />
              <span className="text-xs">{likesCount}</span>
            </button>
            
            {/* Bookmark */}
            <button
              onClick={handleBookmarked}
              className={`p-2 ${
                bookmarkedState
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              aria-label={bookmarkedState ? "Remove bookmark" : "Bookmark"}
            >
              <FiBookmark className={`w-5 h-5 ${bookmarkedState ? "fill-current" : ""}`} />
            </button>
            
            {/* Share */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === 'share' ? null : 'share');
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Share post"
              >
                <FiShare2 className="w-5 h-5" />
              </button>
              
              {menuOpen === 'share' && (
                <div className="absolute right-0 bottom-full mb-2 z-30">
                  <SharePopoverMod 
                    shareUrl={`${clientBaseUrl}/post/${postId}`} 
                    sendDirectMessage={handleShareAsMessage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {activeModal === 'tips' && (
        <SendTipsModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          data={{
            postId,
            authorId,
            profilePic,
            name: capitalizeFirstLetters(name),
            verified,
            username,
          }}
        />
      )}
      
      {activeModal === 'unlock' && (
        <UnlockContentModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          data={{
            postId,
            authorId,
            profilePic,
            name: capitalizeFirstLetters(name),
            verified,
            username,
            price,
          }}
          onPaymentSuccess={handleUnlockPost}
        />
      )}
      
      {activeModal === 'donation' && (
        <DonationModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          data={{
            postId,
            authorId,
            profilePic,
            name: capitalizeFirstLetters(name),
            verified,
            username,
            price
          }}
          onDonationSuccess={handleDonationSuccess}
        />
      )}
    </article>
  );
};

export default PostCard;
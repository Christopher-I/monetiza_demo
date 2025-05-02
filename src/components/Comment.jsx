import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import heartFilled from "../imgs/heart.png";
import heartOutline from "../imgs/follow.png";
import chatBalloon from "../imgs/chat-balloon.png";
import { toast } from 'react-toastify';
import useTwemoji from '../hooks/useTwimoji';


const Comment = ({
  parent = false,
  authorId,
  commentId,
  setSelectedComment,
  name = "",
  avatar,
  time,
  text = "",
  gif,
  likes ,
  isLiked = false,
  commentsCount,
  single = false,
  goToPost,
  refetch = async () => { } }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;




  const [agoSuffix, setAgoSuffix] = useState("s");
  const [ago, setAgo] = useState(0);
  const [likedState, setLikedState] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(likes);
  const emojiRef = useRef(null);
  useTwemoji(emojiRef);

  useEffect(() => {
    setLikedState(isLiked);
    setLikesCount(likes);
  }, [isLiked, likes]);

  useEffect(() => {
    const calculateTimeAgo = () => {
      if (!time) return;
      const seconds = Math.floor((Date.now() - new Date(time)) / 1000);
      const intervals = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
      let value, suffix;
      if (seconds < intervals.minute) {
        value = seconds;
        suffix = "s";
      } else if (seconds < intervals.hour) {
        value = Math.floor(seconds / intervals.minute);
        suffix = "min";
      } else if (seconds < intervals.day) {
        value = Math.floor(seconds / intervals.hour);
        suffix = "hr";
      } else if (seconds < intervals.month) {
        value = Math.floor(seconds / intervals.day);
        suffix = "d";
      } else if (seconds < intervals.year) {
        value = Math.floor(seconds / intervals.month);
        suffix = "mn";
      } else {
        value = Math.floor(seconds / intervals.year);
        suffix = "yr";
      }
      setAgo(value);
      setAgoSuffix(suffix);
    };

    calculateTimeAgo();
    const intervalId = setInterval(calculateTimeAgo, 60000);
    return () => clearInterval(intervalId);

    
  }, [time]);



  const handleLiked = async (e) => {
    try {
      let result;
      if (!likedState) { // If not liked, then like it
        result = await axios.get(`${baseUrl}/api/post/comment/${commentId}/like`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        setLikesCount((prev) => prev + 1);
        toast.info(result.data.message);
      } else { // If liked, then dislike it
        result = await axios.get(`${baseUrl}/api/post/comment/${commentId}/dislike`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        setLikesCount((prev) => prev - 1);
        // toast.info(result.data.message);
      }
      setLikedState((prev) => !prev);
      
      // Optionally, refresh the comment data from the parent:
      await refetch();
    } catch (error) {
      console.error("Error in handleLiked:", error);
      toast.error("Something went wrong!");
    }
  };
  


  if (!authorId) return null;

  return (
    <div ref={emojiRef} className={`flex items-start space-x-3 px-4 py-2 w-full ${parent ? "max-w-full" : "max-w-md"}`}>
      <Link to={`/user/${authorId}`} className="shrink-0">
        <img loading="lazy" src={avatar} alt={`${name}'s avatar`} className="w-10 h-10 rounded-full object-cover" />
      </Link>
      <div className="flex-1">
        <Link to={`/comment/${commentId}`} className='shrink-0 flex-1'>
          <div
            style={{ backgroundColor: '#D9D9D9' }}
            className={`rounded-lg px-2 py-2 ${parent ? "w-full" : "w-[250px]"}`}
            // onClick={() => setSelectedComment?.(commentId)}
            // role="button"
            // tabIndex={0}
          >
            <p className="font-semibold text-sm text-gray-800">{name}</p>
            <div className="mt-1">
              {text && <p className="text-gray-700 text-sm">{text}</p>}
              {gif && <img src={gif} alt="Comment GIF" className="mt-2 w-full rounded-lg" />}
            </div>
          </div>
        </Link>
        <div className={`${parent ? "w-full" : "w-[250px]"} flex justify-between items-center text-gray-500 text-xs mt-1`}>
          <span>{ago}{agoSuffix} ago</span>
          <div className="flex items-center space-x-2">
            <button
              className="flex items-center space-x-1"
              onClick={single ? undefined : goToPost}
              aria-label="View comments"
            >
              <img loading="lazy" src={chatBalloon} alt="" className="h-4 w-4 lg:h-4 lg:w-4" />
              <span>{commentsCount}</span>
            </button>
            <div className="flex gap-1 text-gray-500 text-sm items-center">
              <button className="" onClick={handleLiked}>
                {likedState ? (
                  <img loading="lazy" src={heartFilled} alt="" className="h-4 w-4 lg:h-6 lg:w-6" />
                ) : (
                  <img loading="lazy" src={heartOutline} alt="" className="h-4 w-4 lg:h-6 lg:w-6" />
                )}
              </button>
              <span>{likesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;

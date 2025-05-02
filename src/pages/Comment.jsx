import RecentChats from "../components/RecentChats";
import ChatSection from "../components/ChatSection";
import withProtectedRoute from "../hoc/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import NewPublication from "../components/NewPublication";
import TopCreators from "../components/TopCreators";
import PostCard from "../components/PostCard";
import axios from "axios";
import StoriesSection from "../components/Stories";
import back from "../imgs/back.png";
import { useNavigate, useParams } from "react-router-dom";
import Comment from "../components/Comment";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { MdGifBox } from "react-icons/md";
import sendImg from '../imgs/send.png';
import ShareButton from "../components/ShareButtons";
import SharePopover from "../components/SharePopover";
import EmojiPicker from "emoji-picker-react";


const GIPHY_API_KEY = "VTn4RphvaRnRxxyn99UiuW1yBHuK8Hh2"; // Replace with your actual Giphy API key


const fetchTrendingGifs = async () => {
    try {
        const response = await axios.get(`https://api.giphy.com/v1/gifs/trending`, {
            params: {
                api_key: GIPHY_API_KEY,
                limit: 12,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching trending GIFs:", error);
        return [];
    }
};

const searchGifs = async (query) => {
    try {
        const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
            params: {
                api_key: GIPHY_API_KEY,
                q: query,
                limit: 12,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error searching for GIFs:", error);
        return [];
    }
};

const GifPicker = ({ selectGif }) => {
    const [gifs, setGifs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadTrendingGifs = async () => {
            const trendingGifs = await fetchTrendingGifs();
            setGifs(trendingGifs);
        };

        loadTrendingGifs();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        const searchedGifs = await searchGifs(searchQuery);
        setGifs(searchedGifs);
    };

    return (
        <div className="absolute bottom-[60px] left-12 z-50 bg-white p-4 shadow-md rounded-md max-h-[300px] overflow-y-auto w-[300px]">
            <input
                type="text"
                placeholder="Search GIFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <div className="grid grid-cols-3 gap-2">
                {gifs.map((gif) => (
                    <img
                        key={gif.id}
                        src={gif.images.fixed_height_small.url}
                        alt="GIF"
                        className="cursor-pointer"
                        onClick={() => selectGif(gif.images.fixed_height.url)}
                    />
                ))}
            </div>
        </div>
    );
};

const CommentPage = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const { user, unRead } = useSelector((state) => state.auth);

    const navigator = useNavigate();
    const { id } = useParams();

    if (!id) {
        console.error("Invalid comment ID");
        return null;
    }

    const focusOnInput = () => {
        inputRef.current.focus()
        // console.log("reached here")
    }

    const [isMobile, setIsMobile] = useState(false);
    const [post, setPost] = useState();
    const [selectedComment, setSelectedComment] = useState();
    const [comments, setComments] = useState([]);
    const [parentComment, setParentComment] = useState([]);
    const [commentsCount, setCommentsCount] = useState(0);
    const [text, setText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [selectedGif, setSelectedGif] = useState(null);

    const emojiPickerRef = useRef(null);
    const inputRef = useRef(null);
    const gifPickerRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const gifButtonRef = useRef(null)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        const handleClickOutside = (event) => {
            if (showEmojiPicker && emojiPickerRef.current && emojiButtonRef.current && !emojiPickerRef.current.contains(event.target) && !emojiButtonRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (showGifPicker && gifPickerRef.current && gifButtonRef.current && !gifPickerRef.current.contains(event.target) && !gifButtonRef.current.contains(event.target)) {
                setShowGifPicker(false);
            }
        };
        const timeoutId = setTimeout(() => { 
            document.addEventListener('click', handleClickOutside);
          }, 0);

        handleResize();
        window.addEventListener("resize", handleResize);

        fetchComments();
        // fetchPost();

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", handleResize);
            document.removeEventListener('click', handleClickOutside);
        }

    }, [showEmojiPicker, showGifPicker, id]);


    const fetchComments = async () => {
        try {
            const result = await axios.get(`${baseUrl}/api/post/comment/${id}`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            setComments(result.data.comments?.reverse() || []);
            setPost(result.data.post);
            // console.log(result.data.comment, "result.data.comment")
            setParentComment(result.data.comment)
            setCommentsCount(result.data.comments?.length || 0);
        } catch (error) {
            console.error("Error fetching comments", error);
        }
    };

    const fetchPost = async () => {
        try {
            const result = await axios.get(`${baseUrl}/api/post/post/${id}`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            setPost(result.data.post);
        } catch (error) {
            console.error("Failed to fetch post", error);
        }
    };

    const addComment = async () => {
        if (!text.trim() && !selectedGif) return;
        // console.log("Selected GIF before posting:", selectedGif);  // Log to verify the selected GIF


        try {
            await axios.post(`${baseUrl}/api/post/comment/${id}`, { text, gif: selectedGif }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            toast.info("Comment added successfully");
            setText("");
            setSelectedGif(null);
            fetchComments();
        } catch (error) {
            console.error("Error adding comment", error);
        }
    };

    const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);

    const addEmoji = (emoji) => {
        setText((prev) => prev + emoji.emoji);
        setShowEmojiPicker(false);
    };

    const toggleGifPicker = () => setShowGifPicker((prev) => !prev);

    const selectGif = (gif) => {
        setSelectedGif(gif);
        // console.log("Selected GIF:", gif);  // Log the selected GIF object here
        setShowGifPicker(false);
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            addComment();
        }
    };

    const goBack = () => {
        navigator(-1);
    };

    const capitalizeFirstLetters = (text) => {
        return text?.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <div className={`flex overflow-y-auto hide-scrollbar pb-[70px] lg:pb-0 max-h-screen h-screen flex-1 ${isMobile ? "flex-col" : "lg:flex-row"}`}>
            <div className="w-full flex flex-col h-screen overflow-y-auto hide-scrollbar relative lg:w-3/4 border-r border-[var(--border-color)]">
                <div className="w-full min-h-[40px] border-b border-gray-600 relative flex items-center">
                    <div className="absolute left-8 top-0 h-full flex items-center cursor-pointer" onClick={goBack}>
                        <img loading="lazy" src={back} alt="back" className="w-4" />
                    </div>
                    <h2 className="text-lg font-semibold flex ml-20 flex-wrap">
                        {capitalizeFirstLetters(post?.author?.personal_info?.fullname)}'s post
                    </h2>
                </div>
                {post && (
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
                        comments={commentsCount}
                        likes={post.likes?.length}
                        bookmarked={user.bookmarks.includes(post._id)}
                        isLiked={post.likes?.includes(user._id)}
                        // single={true}
                    />
                )}
                <div className="border-y w-full pt-2">
                    {/* hello - {JSON.stringify(parentComment)} */}
                    {parentComment && <Comment
                        commentId={parentComment?._id}
                        parent={true}
                        authorId={parentComment?.author?._id}
                        name={parentComment?.author?.personal_info?.username}
                        avatar={parentComment?.author?.personal_info?.profile_img}
                        time={parentComment?.commentedAt || Date.now()}
                        text={parentComment?.text}
                        gif={parentComment?.gif}
                        likes={parentComment?.likes?.length}
                        goToPost={focusOnInput}
                        commentsCount={parentComment?.sub_comments?.length}
                        isLiked={parentComment?.likes?.includes(user._id)}
                    />}
                </div>
                <div className="flex-1">
                    {comments.length > 0 ? comments.map((comment, index) => (
                        <Comment
                            key={index}
                            commentId={comment?._id}
                            setSelectedComment={setSelectedComment}
                            authorId={comment?.author?._id}
                            name={comment?.author?.personal_info?.username}
                            avatar={comment?.author?.personal_info?.profile_img}
                            time={comment.commentedAt || Date.now()}
                            text={comment.text}
                            gif={comment.gif}
                            likes={comment?.likes?.length}
                            commentsCount={comment?.sub_comments?.length}
                            isLiked={comment?.likes?.includes(user._id)}
                        />
                    )) : (
                        <div className="text-lg flex w-full flex-1 justify-center py-8">No comments</div>
                    )}
                </div>
                <div className="flex border border-gray-500 sticky h-[50px] rounded-lg bg-[#F1F5F9] bottom-[1px] left-0 w-full relative">
                    <MdOutlineEmojiEmotions
                        ref={emojiButtonRef}
                        className="absolute h-8 w-8 bottom-2 cursor-pointer left-2"
                        onClick={toggleEmojiPicker}
                    />
                    {showEmojiPicker && (
                        <div ref={emojiPickerRef} className="absolute bottom-[60px] left-2 z-50">
                            <EmojiPicker onEmojiClick={addEmoji} />
                        </div>
                    )}
                    <MdGifBox
                        ref={gifButtonRef}
                        className="absolute h-8 w-8 bottom-2 cursor-pointer left-12"
                        onClick={toggleGifPicker}
                    />
                    {showGifPicker && <GifPicker selectGif={setSelectedGif} ref={gifPickerRef} />}

                    <input
                        type="text"
                        ref={inputRef}
                        onKeyDown={handleKeyPress}
                        className="flex-1 bg-[#F1F5F9] rounded-lg h-[50px] pl-20 pr-12 text-lg"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    {selectedGif && (
                        <img
                            src={selectedGif}
                            alt="Selected GIF"
                            className="absolute h-10 right-16 top-1"
                        />
                    )}
                    <img
                        onClick={addComment}
                        loading="lazy"
                        src={sendImg}
                        alt="send comment"
                        className="absolute h-8 w-8 top-2 right-2 cursor-pointer"
                    />
                </div>
            </div>
            <div className="w-full lg:w-2/4 hidden lg:block">
                <TopCreators />
            </div>
        </div>
    );
};

export default withProtectedRoute(CommentPage);

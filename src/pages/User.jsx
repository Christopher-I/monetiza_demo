import RecentChats from "../components/RecentChats";
import ChatSection from "../components/ChatSection";
import withProtectedRoute from "../hoc/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import NewPublication from "../components/NewPublication";
import TopCreators from "../components/TopCreators";
import PostCard from "../components/PostCard";
import coverPhoto from "../imgs/cover-photo.png";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { capitalizeFirstLetters } from "../common/utils";
import { TfiWorld } from "react-icons/tfi";
import { LuInstagram } from "react-icons/lu";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { CiStar } from "react-icons/ci";
import { checkAuthentication } from "../store/authSlice";
import chatPhoto from "../imgs/chat.png";
import more_clear from "../imgs/more_clear.png";
import { Blocked } from "../components/BlockOrInterested";
import { loading as loader } from "../store/authSlice";
import verifiedSVG from "../imgs/Vector.svg";
import ReportUserModal from "../components/ReportUserModal";
import SubscribeModal from "../components/SubscribeModal";
import ShareLinkDMs from "../components/ShareLinkDMs";

const GradientIcon = ({ width = 24, height = 24 }) => (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
        <svg viewBox="0 0 20 20">
            <defs>
                <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    {/* <stop offset="0%" stopColor="#ff7f50" />
            <stop offset="100%" stopColor="#1e90ff" /> */}
                    <stop offset="0%" stopColor="#F58529" />
                    <stop offset="30%" stopColor="#FEDA77" />
                    <stop offset="50%" stopColor="#FFDC80" />
                    <stop offset="70%" stopColor="#833AB4" />
                    <stop offset="100%" stopColor="#515BD4" />
                </linearGradient>
            </defs>
            <LuInstagram height={24} width={24} style={{ stroke: "url(#starGradient)" }} />
        </svg>
    </div>
);

const handleBigNumbers = (number) => {
    if (isNaN(number) || number == null) {
        return "Invalid number";
    }

    if (number >= 1_000_000_000) {
        return (number / 1_000_000_000).toFixed(1) + "B";
    }
    if (number >= 1_000_000) {
        return (number / 1_000_000).toFixed(1) + "M";
    }
    if (number >= 1_000) {
        return (number / 1_000).toFixed(1) + "K";
    }

    return number.toString();
};


// eslint-disable-next-line react-refresh/only-export-components
const Profile = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const { user, unRead } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const [isMobile, setIsMobile] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [posts, setPosts] = useState([])
    const [currentUser, setCurrentUser] = useState();
    const [filteredPosts, setFilteredPosts] = useState([])
    const [activeTab, setActiveTab] = useState("Posts");
    const [isBlockedPopoverOpen, setIsBlockedPopoverOpen] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isSubscribedOpen, setIsSubscribedOpen] = useState(false)
    const [totalSubAmount, setTotalSubAmount] = useState({})
    const [defaultSubAmount, setDefaultSubAmount] = useState(undefined);
    const [subscribeCount, setSubscribeCount] = useState(0);
    const [message, setMessage] = useState("");
    const [messageOpen, setMessageOpen] = useState(false);
    const [postCount, setPostCount] = useState(0);
    const [mediaCount, setMediaCount] = useState(0);

    const { id } = useParams();

    const handleReportUser = async ({ reason, files = [], clearAll = () => {}}) => {
        try {
            // 
            const formData = new FormData();
            formData.append("reason", reason);
            formData.append("targetUser", currentUser?._id);
            // console.log(files, "files")
            files.forEach(async (file) => {
                // 
                formData.append("images", file);
            })
            // formData.append("images", files);
            const result = await axios.post(`${baseUrl}/api/auth/report`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            })
            toast.success(result.data?.message)
            setIsReportOpen(false)
            clearAll()
        } catch (error) {
            toast.error("There was an error")
        }
    }

    const handleReportUserToggle = async () => {
        setIsReportOpen(prev => !prev)
    }
    const subscribeToCreator = async () => {
        try {
            
            const frequency = "monthly";
            const plan = currentUser?.creatorSettings?.subscriptionPlans?.[0];
            if (!plan || !currentUser?._id) {
                return toast.error("No subscription plan available for this creator.");
            }
            const plan_id = plan._id; // use your plan's identifier

            const response = await axios.post(
                `${baseUrl}/api/auth/creator/subscribe`,
                { frequency, creatorId: currentUser._id, plan_id },
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Subscription error:", error);
            toast.error("Subscription failed. Please try again.");
        }
    };


    useEffect(() => {

        axios.get(`${baseUrl}/api/auth/${id}/posts`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }).then((result) => {
            // console.log(result, "result")
            const filteredData = result.data.posts.filter(post => post.audio || post.video || post.image);
            setPosts(() => result.data.posts)
            setFilteredPosts(() => filteredData)
        }).catch((err) => console.log(err, "failed to fetch posts"))

        axios.get(`${baseUrl}/api/auth/${id}/profile`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }).then((result) => {
            // console.log(result, "result")
            setCurrentUser(() => result.data.user)
            setIsSubscribed(() => result.data.isSubscribed)
            setDefaultSubAmount(() => result.data.defaultSubAmount)
            setSubscribeCount(() => result.data.subscribeCount)
            setTotalSubAmount(() => result.data.totalSubAmount)
            setPostCount(() => result.data.postCount)
            setMediaCount(() => result.data.mediaCount)
        }).catch((err) => console.log(err, "failed to fetch posts"))
    }, [id]);

    const refetchAllPosts = () => {
        // 
        axios.get(`${baseUrl}/api/post/userpost/all`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }).then((result) => {
            // console.log(result, "result")
            setPosts(() => result.data.posts)
        }).catch((err) => console.log(err, "failed to fetch posts"))
    }

    const blockUser = async (postId) => {
        // console.log("reached here")
        try {
            dispatch(loader())
            const result = await axios.post(`${baseUrl}/api/auth/block/${postId}`, {}, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            })
            toast.info(result.data.message)
        } catch (error) {

        }
    }

    const followOrUnfollow = async () => {
        // 
        await axios.post(`${baseUrl}/api/auth/follow-unfollow/${currentUser?._id}`, {}, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }).then((result) => {
            dispatch(checkAuthentication())
                .unwrap()
                .then(() => {
                    // 
                    // toast.info("Successfully updated profile")
                    toast.success(result.data.message)
                })
                .catch((err) => {
                    // 
                });
            // console.log(result, "result")
        }).catch((err) => toast.error(err.response.data.message || err.message))
    }

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Use 768px as breakpoint for mobile
        };

        // Check initial window size
        handleResize();

        // Add event listener for window resize
        window.addEventListener("resize", handleResize);

        // Cleanup event listener on component unmount
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleChatUser = async () => {
        navigate("/chat", { 
            state: { 
                receiver: {
                    _id: currentUser?._id,
                    personal_info: currentUser?.personal_info,
                    chatSettings: currentUser?.chatSettings,
                    creatorSettings: currentUser?.creatorSettings,
                }
            } 
        });
    }


    return (
        <div className={`flex flex-1 h-screen overflow-hidden ${isMobile ? "flex-col" : "lg:flex-row"}`}>
            <div className="w-full overflow-y-auto hide-scrollbar lg:w-3/4 border-r border-[var(--border-color)]">
                {/*  */}
                <div className="w-full bg-white shadow-md overflow-hidden">
                    {/* Header Section */}
                    <div className="relative">
                        <img loading="lazy"
                            src={currentUser?.personal_info.cover_img || coverPhoto}
                            alt="Cover"
                            className="w-full h-40 object-cover"
                        />
                        <img loading="lazy"
                            src={currentUser?.personal_info.profile_img}
                            alt="Profile"
                            className="absolute -bottom-10 left-5 w-20 h-20 rounded-full border-4 border-white"
                        />
                        {user._id === currentUser?._id && <button onClick={() => navigate("/settings")} className="absolute bottom-[-40px] border-2 border-black right-4 bg-white px-4 py-1 rounded-full text-sm">
                            Edit Profile
                        </button>}
                        {user._id !== currentUser?._id && <div className="absolute flex gap-2 bottom-[-40px] right-4 text-md font-montserrat font-semibold">
                            <img loading="lazy" src={more_clear} onClick={() => { setIsBlockedPopoverOpen(true) }} alt="" className="h-4 lg:h-7 cursor-pointer mr-1" />
                            <img onClick={() => handleChatUser()} src={chatPhoto} alt="" className="h-8 w-8 cursor-pointer rounded-full border border-gray-600 p-1" />
                            <button onClick={followOrUnfollow} className="bg-orange-500 text-white px-6 py-1 rounded-full">{user?.personal_info?.following?.includes(id) ? "Unfollow" : "Follow"}</button>
                            {/* {currentUser?.creatorSettings.isCreator && <button onClick={followOrUnfollow} disabled={currentUser?.personal_info.followers.includes(user._id) ? true : false} className={`bg-white text-orange-500 border border-orange-500 px-6 py-1 rounded-full ${currentUser?.personal_info.followers.includes(user._id) ? "cursor-not-allowed" : "cursor-pointer"}`}>{currentUser?.personal_info.subscribers.includes(user._id) ? "Subscribed" : "Subscribe"}</button>} */}
                            {isBlockedPopoverOpen && (<div className="absolute w-[200px] mt-2 -left-4 top-8 z-[20]">
                                <Blocked handleBlockUser={() => blockUser(currentUser?._id)} close={() => setIsBlockedPopoverOpen(false)} handleReportUser={handleReportUserToggle} />
                            </div>)}
                        </div>}
                        <ReportUserModal
                            isOpen={isReportOpen}
                            onClose={(data = {}) => setIsReportOpen(false)}
                            onSuccess={handleReportUser}
                        />
                    </div>

                    {/* Profile Info */}
                    <div className="p-6 text-left mt-6">
                        <div className="mb-5">
                            <h1 className="text-xl font-bold flex gap-1 lg:gap-2">{capitalizeFirstLetters(currentUser?.personal_info.fullname)}{currentUser?.creatorSettings.isCreator && <img loading="lazy" src={verifiedSVG} alt="verified" className="h-4 lg:h-7 w-4 lg:w-7" />}</h1>
                            <p className="text-gray-500 text-sm">@{currentUser?.personal_info.username}</p>
                        </div>
                        <p className="mt-2 text-gray-700 text-xl">
                            {currentUser?.personal_info.bio}
                        </p>

                        {/* Location and Join Date */}
                        <div className="flex items-center justify-start mt-4 text-sm text-gray-500 space-x-4">
                            <span>📍 {currentUser?.personal_info.location || "Unknown"}{false && "📍 Los Angeles, USA"}</span>
                            <span>📅 Joined {new Date(currentUser?.joinedAt).toLocaleString('default', { month: 'long' })} {new Date(currentUser?.joinedAt).getFullYear()}</span>
                        </div>

                        {/* Social Links */}
                        <div className="flex flex-wrap justify-start mt-4 space-x-3">
                            {currentUser?.social_links.website && <Link to={currentUser?.social_links.website} className="px-3 py-1 border rounded-full flex gap-2 items-center"><TfiWorld /><span className="">{currentUser?.social_links.website}</span></Link>}
                            {currentUser?.social_links.instagram && <Link to={currentUser?.social_links.instagram} className="px-3 py-1 border rounded-full flex gap-2 items-center"><GradientIcon /><span className="">{currentUser?.social_links.instagram}</span></Link>}
                            {currentUser?.social_links.twitter && <Link to={currentUser?.social_links.twitter} className="px-3 py-1 border rounded-full flex gap-2 items-center"><FaXTwitter /><span className="">{currentUser?.social_links.twitter}</span></Link>}
                            {currentUser?.social_links.youtube && <Link to={currentUser?.social_links.youtube} className="px-3 py-1 border rounded-full flex gap-2 items-center"><FaYoutube color="red" /><span className="">{currentUser?.social_links.youtube}</span></Link>}
                            {currentUser?.social_links.facebook && <Link to={currentUser?.social_links.facebook} className="px-3 py-1 border rounded-full flex gap-2 items-center"><FaFacebook color="blue" /><span className="">{currentUser?.social_links.facebook}</span></Link>}
                            {currentUser?.social_links.github && <Link to={currentUser?.social_links.github} className="px-3 py-1 border rounded-full flex gap-2 items-center"><FaGithub /><span className="">{currentUser?.social_links.github}</span></Link>}
                            {/* <Link to="#" className="px-3 py-1 border rounded-full">📷 instagram.com</Link>
                        <Link to="#" className="px-3 py-1 border rounded-full">🎵 tiktok.com</Link> */}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-16 text-[22px] mt-4 text-sm">
                            <div className="flex gap-2 items-center">
                                <CiHeart size={20} /><span className="">{currentUser?.speciall.formattedLikes} Likes</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <CiStar size={20} /><span className="">{handleBigNumbers(subscribeCount)} Subscribers</span>
                            </div>
                        </div>
                        {/* Subscriber Button */}
                        {user._id !== currentUser?._id && currentUser?.creatorSettings.isCreator && (
                            <div className="mt-4 w-full">
                                <button
                                    onClick={() => setIsSubscribedOpen(true)}
                                    disabled={isSubscribed}
                                    className={`w-full px-6 py-3 rounded-full ${isSubscribed
                                        ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                        : "bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"
                                        }`}
                                >
                                    {isSubscribed ? "Subscribed" : `Subscribe $${defaultSubAmount}`}
                                </button>
                            </div>
                        )}

                        <SubscribeModal
                            isOpen={isSubscribedOpen}
                            onClose={() => setIsSubscribedOpen(false)}
                            onSuccess={() => subscribeToCreator}
                            data={{
                                authorId: currentUser?._id,
                                profilePic: currentUser?.personal_info.profile_img,
                                name: currentUser?.personal_info.fullname,
                                verified: currentUser?.creatorSettings.isCreator,
                                username: currentUser?.personal_info.username,
                                subDetails: totalSubAmount
                            }}
                        />


                        {/* <div className="flex justify-around mt-6 text-sm">
                        <div>
                            <span className="font-bold">22.3k</span> Likes
                        </div>
                        <div>
                            <span className="font-bold">1.3k</span> Subscribers
                        </div>
                        </div> */}

                        {/* Tabs */}
                        <div className="flex justify-center mt-6 border-b">
                            {["Posts", "Media"].map((item) => (
                                <button className={`${activeTab == item ? "border-b-4 border-[#E35F01]" : ""} pb-1 mb-[1px] cursor-pointer font-semibold flex-1 text-center`} onClick={() => setActiveTab(item)}>{item === "Posts" ? postCount : mediaCount} {item}</button>
                            ))}
                            {/* <button className="flex-1 py-2 font-semibold border-b-2 border-orange-500">375 Posts</button>
                        <button className="flex-1 py-2 text-gray-500">292 Media</button> */}
                        </div>
                    </div>

                    {/* Posts Section */}
                    <div className="p-4">
                        <h2 className="text-lg font-bold mb-4">Recent</h2>
                        <ShareLinkDMs 
                            enabled={messageOpen}
                            message={message}
                            onClose={() => {console.log("supposed to work"); setMessageOpen(false);}}
                        />
                        {activeTab === "Posts" ? posts?.map((post, index) => (
                            <PostCard
                                key={index.toString()}
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
                                // refetch={refetch}
                                setMessage={setMessage}
                                setMessageOpen={setMessageOpen}
                            />
                            // <PostCard
                            //     key={index.toString()}
                            //     postId={post._id}
                            //     authorId={post?.author?._id}
                            //     name={post?.author?.personal_info?.fullname}
                            //     profilePic={post?.author?.personal_info?.profile_img}
                            //     verified={post?.author?.creatorSettings?.isCreator}
                            //     createdAt={new Date(post.publishedAt)}
                            //     username={post?.author?.personal_info?.username}
                            //     text={post.caption}
                            //     image={post.image}
                            //     audio={post.audio}
                            //     video={post.video}
                            //     comments={post.comments?.length}
                            //     likes={post.likes?.length}
                            //     bookmarked={user.bookmarks.includes(post._id)}
                            //     isLiked={post.likes?.includes(user._id)}
                            //     setMessage={setMessage}
                            //     setMessageOpen={setMessageOpen}
                            // />
                        )) : filteredPosts?.map((post, index) => (
                            <PostCard
                                key={index.toString()}
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
                                // refetch={refetch}
                                setMessage={setMessage}
                                setMessageOpen={setMessageOpen}
                            />
                            // <PostCard
                            //     key={index.toString()}
                            //     postId={post._id}
                            //     authorId={post?.author?._id}
                            //     name={post?.author?.personal_info?.fullname}
                            //     profilePic={post?.author?.personal_info?.profile_img}
                            //     verified={post?.author?.creatorSettings?.isCreator}
                            //     createdAt={new Date(post.publishedAt)}
                            //     username={post?.author?.personal_info?.username}
                            //     text={post.caption}
                            //     image={post.image}
                            //     audio={post.audio}
                            //     video={post.video}
                            //     comments={post.comments?.length}
                            //     likes={post.likes?.length}
                            //     bookmarked={user.bookmarks.includes(post._id)}
                            //     isLiked={post.likes?.includes(user._id)}
                            //     setMessage={setMessage}
                            //     setMessageOpen={setMessageOpen}
                            // />
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-full hidden lg:flex lg:w-2/4">
                <TopCreators />
            </div>
            {/* <ToastContainer /> */}
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withProtectedRoute(Profile, '');

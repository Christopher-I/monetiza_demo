import RecentChats from "../components/RecentChats";
import ChatSection from "../components/ChatSection";
import withProtectedRoute from "../hoc/ProtectedRoute";
import { useState, useEffect } from "react";
import NewPublication from "../components/NewPublication";
import TopCreators from "../components/TopCreators";
import PostCard from "../components/PostCard";
import coverPhoto from "../imgs/cover-photo.png";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { capitalizeFirstLetters } from "../common/utils";
import { TfiWorld } from "react-icons/tfi";
import { LuInstagram } from "react-icons/lu";
import { FaXTwitter, FaYoutube, FaFacebook, FaGithub } from "react-icons/fa6";
import { CiHeart, CiStar } from "react-icons/ci";
import verifiedSVG from "../imgs/Vector.svg";
import ShareLinkDMs from "../components/ShareLinkDMs";

const GradientIcon = ({ width = 24, height = 24 }) => (
  <div style={{ width: `${width}px`, height: `${height}px` }}>
    <svg viewBox="0 0 20 20">
      <defs>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
  if (isNaN(number) || number == null) return "0";
  return number > 1000 ? `${(number / 1000).toFixed(1)}k` : number.toString();
};

const Profile = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("Posts");
  const [message, setMessage] = useState("");
  const [messageOpen, setMessageOpen] = useState(false);
  const [subscribeCount, setSubscribeCount] = useState(0);

  useEffect(() => {
    axios.get(`${baseUrl}/api/post/userpost/all`, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }).then((result) => {
      const mediaPosts = result.data.posts.filter(post => post.audio || post.video || post.image);
      setPosts(result.data.posts);
      setFilteredPosts(mediaPosts);
      setSubscribeCount(result.data.subscribeCount);
    }).catch((err) => console.error("Failed to fetch posts:", err));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`flex flex-1 h-screen overflow-hidden ${isMobile ? "flex-col" : "lg:flex-row"}`}>
      <div className="w-full overflow-y-auto hide-scrollbar lg:w-3/4 border-r border-gray-200">
        <div className="w-full bg-white shadow-sm">
          {/* Cover & Profile */}
          <div className="relative">
            <img src={user.personal_info.cover_img || coverPhoto} alt="Cover" className="w-full h-44 object-cover" loading="lazy" />
            <img src={user.personal_info.profile_img} alt="Profile" className="absolute -bottom-10 left-5 w-20 h-20 rounded-full border-4 border-white shadow-md" loading="lazy" />
            <button onClick={() => navigate("/settings")} className="absolute bottom-[-40px] right-4 bg-white border border-gray-300 px-4 py-1 rounded-full text-sm hover:bg-gray-100">Edit Profile</button>
          </div>

          <div className="p-6 pt-12">
            <h1 className="text-2xl font-bold flex items-center gap-2">{capitalizeFirstLetters(user.personal_info.fullname)} {user.creatorSettings.isCreator && <img src={verifiedSVG} alt="verified" className="h-5 w-5" />}</h1>
            <p className="text-sm text-gray-500">@{user.personal_info.username}</p>
            <p className="mt-2 text-gray-700">{user.personal_info.bio}</p>

            <div className="flex gap-6 text-sm text-gray-500 mt-4">
              <span>📍 {user.personal_info.location || "Unknown"}</span>
              <span>📅 Joined {new Date(user.joinedAt).toLocaleString('default', { month: 'long' })} {new Date(user.joinedAt).getFullYear()}</span>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {user.social_links.website && <Link to={user.social_links.website} className="text-sm px-3 py-1 border rounded-full flex items-center gap-2"><TfiWorld /> {user.social_links.website}</Link>}
              {user.social_links.instagram && <Link to={user.social_links.instagram} className="text-sm px-3 py-1 border rounded-full flex items-center gap-2"><GradientIcon /> {user.social_links.instagram}</Link>}
              {user.social_links.twitter && <Link to={user.social_links.twitter} className="text-sm px-3 py-1 border rounded-full flex items-center gap-2"><FaXTwitter /> {user.social_links.twitter}</Link>}
              {user.social_links.youtube && <Link to={user.social_links.youtube} className="text-sm px-3 py-1 border rounded-full flex items-center gap-2"><FaYoutube /> {user.social_links.youtube}</Link>}
              {user.social_links.facebook && <Link to={user.social_links.facebook} className="text-sm px-3 py-1 border rounded-full flex items-center gap-2"><FaFacebook /> {user.social_links.facebook}</Link>}
              {user.social_links.github && <Link to={user.social_links.github} className="text-sm px-3 py-1 border rounded-full flex items-center gap-2"><FaGithub /> {user.social_links.github}</Link>}
            </div>

            <div className="flex gap-8 text-sm mt-4">
              <div className="flex items-center gap-2"><CiHeart /> {user.speciall.formattedLikes} Likes</div>
              <div className="flex items-center gap-2"><CiStar /> {handleBigNumbers(subscribeCount)} Subscribers</div>
            </div>

            <div className="flex mt-6 border-b text-center text-sm">
              {["Posts", "Media"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-2 ${activeTab === tab ? "border-b-4 border-orange-500 text-orange-600 font-semibold" : "text-gray-500"}`}
                >
                  {tab === "Posts" ? posts.length : filteredPosts.length} {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
            <ShareLinkDMs
              enabled={messageOpen}
              message={message}
              onClose={() => setMessageOpen(false)}
            />
            {(activeTab === "Posts" ? posts : filteredPosts).map((post, index) => (
              <PostCard
                key={index}
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
                bookmarked={user.bookmarks.includes(post._id)}
                isLiked={post.likes?.includes(user._id)}
                setMessage={setMessage}
                setMessageOpen={setMessageOpen}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-1/4 border-l border-gray-200 bg-gray-50 p-4">
        <TopCreators />
      </div>
    </div>
  );
};

export default withProtectedRoute(Profile, 'profile');

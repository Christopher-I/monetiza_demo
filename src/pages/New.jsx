import RecentChats from "../components/RecentChats";
import ChatSection from "../components/ChatSection";
import withProtectedRoute from "../hoc/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import NewPublication from "../components/NewPublication";
import TopCreators from "../components/TopCreators";
import PostCard from "../components/PostCard";

// eslint-disable-next-line react-refresh/only-export-components
const New = () => {
    const [isMobile, setIsMobile] = useState(false);

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


    return (
        <div className={`flex flex-1 ${isMobile ? "flex-col" : "lg:flex-row"}`}>
            {!isMobile ? (
                <>
                    {/* Desktop layout */}
                    <div className="w-full overflow-auto lg:w-3/4 border-r border-[var(--border-color)]">
                        <NewPublication />
                        {/* <PostCard 
                            name="Monetiza+"
                            profilePic=""
                            verified={true}
                            createdAt={new Date()}
                            username={"monetiza"}
                            text="Exciting news! Justine Sky just made her debut on the Monetiza+ platform and we're all here for the exciting moments ahead of us. Get her contents here @justinesky"
                            imgs={[1, 2, 3, 4]}
                            comments={200}
                            likes={1270}
                            bookmarked={true}
                            isLiked={true}
                        /> */}
                    </div>
                    <div className="w-full lg:w-2/4">
                        <TopCreators />
                    </div>
                </>
            ) : 
            (
                 <NewPublication />
            )}
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withProtectedRoute(New, 'new');

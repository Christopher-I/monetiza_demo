import RecentChats from "../components/RecentChats";
import ChatSection from "../components/ChatSection";
import withProtectedRoute from "../hoc/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import NewPublication from "../components/NewPublication";
import TopCreators from "../components/TopCreators";
import PostCard from "../components/PostCard";
import ProMessageBox from "../components/ProMessageBox";
import UploadForm from "../components/UploadForm";

// eslint-disable-next-line react-refresh/only-export-components
const BeACreator = () => {


    return (
        <div className={`flex flex-1 w-full overflow-y-auto max-h-screen bg-white`}>
            {/*  */}
            {/* <div className="flex justify-between items-center mb-4 p-4 border-b border-[var(--border-color)]">
                <h2 className="font-montserrat text-lg font-semibold">New Publication</h2>
                <button className="font-montserrat bg-[var(--main-color)] text-white px-4 py-1 rounded-full hover:bg-orange-600">
                    Post
                </button>
            </div>
            <div className="w-full px-4">

                <ProMessageBox />
            </div> */}
            <UploadForm />
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withProtectedRoute(BeACreator, 'creator');

import React from 'react';
import withProtectedRoute from "../hoc/ProtectedRoute";
import CreatorSettings from "../components/CreatorSettings";

const CreatorsPage = () => {
    return (
        <div className="flex flex-1 w-full h-screen bg-white overflow-y-auto">
            <div className="w-full">
                <CreatorSettings />
            </div>
        </div>
    );
};

export default withProtectedRoute(CreatorsPage, 'creatorPage');
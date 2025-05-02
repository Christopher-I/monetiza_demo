// Settings.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import withProtectedRoute from "../hoc/ProtectedRoute";
import SettingsSidebar from "../components/SettingsSidebar";
import SettingsContent from "../components/SettingsContent";
import { FiArrowLeft } from "react-icons/fi";

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [mobileDataVisible, setMobileDataVisible] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      {/* Mobile header */}
      <div className="lg:hidden w-full bg-white shadow-sm p-4 flex items-center">
        {mobileDataVisible ? (
          <button 
            onClick={() => setMobileDataVisible(false)}
            className="flex items-center text-gray-700 hover:text-orange-500 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Settings</span>
          </button>
        ) : (
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        )}
      </div>

      <div className="w-full flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`lg:block ${mobileDataVisible ? "hidden" : "block"} lg:w-1/4 xl:w-1/5 border-r border-gray-200`}>
          <SettingsSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            setMobileDataVisible={setMobileDataVisible} 
          />
        </div>
        
        {/* Content */}
        <motion.div 
          className={`w-full lg:w-3/4 xl:w-4/5 ${!mobileDataVisible && !window.matchMedia('(min-width: 1024px)').matches ? "hidden" : "block"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SettingsContent activeTab={activeTab} />
        </motion.div>
      </div>
    </div>
  );
};

export default withProtectedRoute(Settings, 'settings');
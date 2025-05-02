// SettingsSidebar.jsx
import { useSelector } from 'react-redux';
import { motion } from "framer-motion";
import { 
  FiUser, 
  FiSettings, 
  FiLock, 
  FiMonitor, 
  FiShield, 
  FiChevronRight 
} from "react-icons/fi";

const SettingsSidebar = ({ activeTab, setActiveTab, setMobileDataVisible }) => {
  const { user } = useSelector((state) => state.auth);
  
  const tabs = [
    { id: 'Profile', icon: <FiUser className="h-5 w-5" />, label: 'Profile' },
    { id: 'Account', icon: <FiSettings className="h-5 w-5" />, label: 'Account' },
    { id: 'Password Change', icon: <FiLock className="h-5 w-5" />, label: 'Password Change' },
    { id: 'Display', icon: <FiMonitor className="h-5 w-5" />, label: 'Display' },
    { id: '2FA', icon: <FiShield className="h-5 w-5" />, label: '2FA' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileDataVisible(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences</p>
      </div>
      
      <div className="py-2">
        {tabs.map((tab) => {
          // Skip password and 2FA tabs for OAuth users
          if ((user.google_auth || user.twitter_auth) && 
              (tab.id === 'Password Change' || tab.id === '2FA')) {
            return null;
          }
          
          return (
            <motion.button
              key={tab.id}
              className={`w-full flex items-center justify-between px-6 py-4 text-left ${
                activeTab === tab.id
                  ? "bg-orange-50 border-l-4 border-orange-500"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleTabChange(tab.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <span className={`mr-3 ${activeTab === tab.id ? "text-orange-500" : "text-gray-500"}`}>
                  {tab.icon}
                </span>
                <span className={`font-medium ${activeTab === tab.id ? "text-orange-600" : "text-gray-700"}`}>
                  {tab.label}
                </span>
              </div>
              <FiChevronRight className={`h-4 w-4 transition-transform ${
                activeTab === tab.id ? "text-orange-500 transform rotate-90" : "text-gray-400"
              }`} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsSidebar;

// SettingsContent.jsx
import { motion, AnimatePresence } from "framer-motion";
import ProfileSettings from './ProfileSettings';
import AccountSettings from './AccountSettings';
import PasswordSettings from './PasswordSettings';
import DisplaySettings from './DisplaySettings';
import TwoFactorAuth from './2FA';

const SettingsContent = ({ activeTab }) => {
  const contentVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={contentVariants}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'Profile' && <ProfileSettings />}
          {activeTab === 'Account' && <AccountSettings />}
          {activeTab === 'Password Change' && <PasswordSettings />}
          {activeTab === 'Display' && <DisplaySettings />}
          {activeTab === '2FA' && <TwoFactorAuth />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SettingsContent;
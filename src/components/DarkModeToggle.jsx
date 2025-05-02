import React, { useState, useEffect } from 'react';

const DarkModeToggle = () => {
  // State to track dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check localStorage for saved dark mode preference
  useEffect(() => {
    const storedPreference = localStorage.getItem('darkMode');
    if (storedPreference === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <button
  onClick={toggleDarkMode}
  className="relative inline-flex items-center h-6 w-12 bg-gray-300 dark:bg-gray-700 rounded-full p-1"
>
  <span
    className={`transition-transform transform ${isDarkMode ? 'translate-x-6' : ''} 
                inline-block w-4 h-4 bg-white rounded-full`}
  ></span>
</button>
  );
};

export default DarkModeToggle;

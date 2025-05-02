import { useState } from "react";
import menu from "../imgs/menu.png";
import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close"; // Import the Close icon

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <nav className="flex items-center justify-between bg-[var(--bg-color)] p-4 shadow">
        {/* Left Section */}
        <div className="flex items-center gap-2" onClick={toggleSidebar}>
          {/* Hamburger Icon */}
          <img loading="lazy"
            src={menu}
            alt="Menu"
            className="w-6 h-6 object-cover cursor-pointer"
          />
          <span className="font-montserrat text-gray-700 font-semibold text-lg">
            Menu
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center">
          {/* Profile Image */}
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img loading="lazy"
              src={user?.personal_info?.profile_img}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </nav>

      {/* Sidebar and Overlay */}
      {isSidebarOpen && (
        <div className="h-full fixed z-[50] inset-0 flex">
          {/* Sidebar */}
          <div className="h-full relative overflow-y-auto overflow-x-hidden w-[299px] bg-[var(--bg-color)] shadow-lg z-50 flex flex-col">
            {/* <button
              onClick={toggleSidebar}
              className="p-4 text-gray-400"
            >
              <CloseIcon /> {/* Replace the text with the icon */}
            {/* </button> */}
            <Sidebar />
          </div>

          {/* Blur Overlay */}
          <div
            className="flex-1 bg-black opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        </div>
      )}
    </>
  );
};

export default Navbar;

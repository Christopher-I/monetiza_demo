import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "./Navbar.jsx";

const MainLayout = ({children, activeSidebar}) => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024); // Use 1024px as breakpoint for desktop
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={`${isDesktop? "flex":""} font-montserrat w-full h-screen bg-gray-100 overflow-hidden`}>
            {isDesktop ? <Sidebar activeSidebar={activeSidebar}/>: <Navbar />}

            <div className="flex flex-1  bg-[var(--bg-color)]">
                {children}
            </div>
        </div>
    );
};


export default MainLayout;

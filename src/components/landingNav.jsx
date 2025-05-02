import { useState } from 'react';
import { Dialog, DialogPanel, PopoverGroup } from '@headlessui/react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from '../imgs/logo.png';

const LandingPageNav = () => {
    const location = useLocation();

    // Check if the current path matches '/signin' or '/signup'
    const hidePopover = ['/otp-confirmation'].includes(location.pathname);

    return (
        <div className='overflow-y-scroll hide-scrollbar h-screen pb-[60px]'>
            <header className="font-afacad bg-white">
                <nav
                    aria-label="Global"
                    className="mt-7 mb-9 flex items-center justify-between px-2 sm:px-6 lg:px-10 w-full"
                >
                    {/* Logo */}
                    <div className="flex lg:flex-1">
                        <Link to="/" className="-m-1.5 p-1.5">
                            <img loading="lazy" src={Logo} alt="logo" className="w-20 sm:w-24 lg:w-40" />
                        </Link>
                    </div>

                    {/* Conditionally render PopoverGroup */}
                    {!hidePopover && (
                        <PopoverGroup className="flex gap-x-[0.1rem] sm:gap-x-1 lg:gap-x-3">
                            <NavLink to="/" className="navlink ml-0">
                                <button className="font-afacad py-1 xs:py-2 px-1 xs:px-3 sm:px-2 lg:px-10 text-[1.1rem] sm:text-[1.6rem] md:text-[1.7rem] lg:text-[1.8rem] font-[900] rounded-full bg-white">
                                    Home
                                </button>
                            </NavLink>
                            <NavLink to="/signup" className="navlink ml-0">
                                <button className="font-afacad py-1 xs:py-2 px-1 xs:px-3 sm:px-2 lg:px-10 text-[1.1rem] sm:text-[1.6rem] md:text-[1.7rem] lg:text-[1.8rem] font-[900] rounded-full bg-white">
                                    Sign up
                                </button>
                            </NavLink>
                            <NavLink to="/signin" className="navlink ml-0">
                                <button className="font-afacad py-1 xs:py-2 px-1 xs:px-3 sm:px-2 lg:px-10 text-[1.1rem] sm:text-[1.6rem] md:text-[1.7rem] lg:text-[1.8rem] font-[900] rounded-full bg-white">
                                    Sign in
                                </button>
                            </NavLink>
                            <NavLink to="/contact" className="navlink ml-0">
                                <button className="font-afacad py-1 xs:py-2 px-1 xs:px-3 sm:px-2 lg:px-10 text-[1.1rem] sm:text-[1.6rem] md:text-[1.7rem] lg:text-[1.8rem] font-[900] rounded-full bg-white">
                                    Contact
                                </button>
                            </NavLink>
                        </PopoverGroup>
                    )}
                </nav>
            </header>

            {/* Outlet for pages */}
            <Outlet />
        </div>
    );
};

export default LandingPageNav;

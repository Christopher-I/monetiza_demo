import React, { useState } from 'react';
import AnimationWrapper from '../common/page-animation';
import toast, { Toaster } from 'react-hot-toast';
import InputBox from '../components/input.component';
import Logo from "../imgs/logo.png";
import { useNavigate, useParams } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";  // Import Spinner
import axios from 'axios';

const ResetPassword = () => {
    const [password, setpassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { token } = useParams();
    const [expired, setExpired] = useState(false);  // Track if the reset link has expired



    const baseUrl = import.meta.env.VITE_BASE_URL;
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();



    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     // Validate if passwords match
    //     if (password !== confirmPassword) {
    //         toast.error("Passwords do not match.");
    //         return;
    //     }

    //     const payload = {
    //         password,
    //         confirmPassword,
    //     };



    //     setLoading(true);

    //     try {
    //         const response = await axios.post(`${baseUrl}/api/auth/reset-password/${token}`, payload, {
    //             headers: { "Content-Type": "application/json" },
    //         });

    //         if (response.data.success) {
    //             toast.success("Password reset successfully!");
    //             navigate('/login');
    //         } else {
    //             toast.error(response.data.message || "Something went wrong.");
    //         }
    //     } catch (error) {
    //         toast.error(error.response?.data?.message || "Failed to send reset link.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validate if passwords match
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
    
        const payload = {
            password,
            confirmPassword,
        };
    
        setLoading(true);
    
        try {
            const response = await axios.post(`${baseUrl}/api/auth/reset-password/${token}`, payload, {
                headers: { "Content-Type": "application/json" },
            });
    
            if (response.data.success) {
                toast.success("Password reset successfully!");
                navigate('/login');
            } else {
                toast.error(response.data.message || "Something went wrong.");
            }
        } catch (error) {
            if (error.response?.data?.message === "Invalid or expired reset token") {
                setExpired(true);  // Set the expired state to true
            } else {
                toast.error(error.response?.data?.message || "Failed to send reset link.");
            }
        } finally {
            setLoading(false);
        }
    };
    



    return (
        <>
            <AnimationWrapper>
                <div className="flex flex-col lg:flex-row w-full max-w-full overflow-hidden">
                    <Toaster />
                    {/* Form Section */}


                    <div className="signup-form w-full lg:w-[55%] px-6 lg:px-12">

                        <div className="mt-4">
                        {expired ? (
                            <div>
                                <h1 className="text-2xl text-[#E35F01] font-bold">Reset Link Expired</h1>
                                <p className="text-xs mb-2">The password reset link has expired. Please request a new one.</p>
                            </div>
                        ) : (
                            <form id="formElement" className="space-y-4 " onSubmit={handleSubmit}>
                                <div>
                                    <h1 className='text-2xl text-[#E35F01] font-bold'>Reset Password</h1>
                                    <p className='text-xs mb-2'>Set up a new password to continue with your account</p>
                                </div>
                                <div>
                                    <InputBox
                                        name="password"
                                        type="password"
                                        placeholder="Enter New Password"
                                        icon="fi-rs-key"
                                        value={password}
                                        onChange={(e) => setpassword(e.target.value)}
                                        required
                                    />

                                </div>
                                <div>
                                    <InputBox
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Confirm New Password"
                                        icon="fi-rs-key"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />

                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="mt-5 text-xl btn-bg-active text-white py-3 px-12 w-full rounded-full shadow-lg font-futura"
                                    >
                                        {loading ? (
                                            <ClipLoader color="#ffffff" size={20} /> // Adjust size and color as needed
                                        ) : (
                                            "Reset Pasword"
                                        )}
                                    </button>

                                </div>
                            </form>

)}
                        </div>
                    </div>

                    <div className="text-center signup-cta flex flex-col justify-center items-center w-full lg:w-1/2 mt-1 lg:mt-0 hidden lg:flex">
                        <img loading="lazy" src={Logo} alt="logo" className="w-48 sm:w-64 lg:w-64" />
                        <h1 className="font-futura mt-4 text-balance text-5xl sm:text-7xl font-semibold tracking-tight text-black">
                            Welcome to
                            <br />
                            <span className="text-colored">Monetiza+</span>
                        </h1>
                        <p className="mt-8 text-pretty text-base sm:text-2xl font-medium text-black">
                            A place where your{" "}
                            <span className="text-colored">creativity</span> turns into
                            <br />
                            <span className="text-colored">money</span>.
                        </p>
                    </div>
                </div>
            </AnimationWrapper>
        </>
    );
};

export default ResetPassword;